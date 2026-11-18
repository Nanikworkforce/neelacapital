"""
Import Zillow Rental Manager inquiries into the Inquiries dashboard.

Zillow emails every renter message to our inbox (from *@convo.zillow.com).
We read that inbox over IMAP (Google App Password) and create one Inquiry per
email. Replying to the stored address goes back to the renter through Zillow.
"""
from __future__ import annotations

import email
import html
import imaplib
import logging
import os
import re
import threading
from datetime import timedelta
from email.header import decode_header, make_header
from email.utils import parseaddr, parsedate_to_datetime

from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger(__name__)

_SYNC_CACHE_KEY = 'zillow_inquiries_last_sync'
_SYNC_INTERVAL_SECONDS = 120


def _imap_credentials() -> tuple[str, str] | None:
    user = os.environ.get('ZILLOW_INBOX_USER', '').strip()
    password = os.environ.get('ZILLOW_INBOX_APP_PASSWORD', '').replace(' ', '').strip()
    if not user or not password:
        return None
    return user, password


def _header(msg, name: str) -> str:
    raw = msg.get(name) or ''
    try:
        return str(make_header(decode_header(raw))).replace('\r\n', ' ').replace('\n', ' ').strip()
    except Exception:
        return raw.strip()


def _body_text(msg) -> str:
    plain = None
    html_text = None
    for part in msg.walk():
        ctype = part.get_content_type()
        if ctype not in ('text/plain', 'text/html') or part.get_filename():
            continue
        try:
            text = part.get_payload(decode=True).decode(part.get_content_charset() or 'utf-8', errors='replace')
        except Exception:
            continue
        if ctype == 'text/plain' and plain is None:
            plain = text
        elif ctype == 'text/html' and html_text is None:
            html_text = text
    if html_text:
        html_text = re.sub(r'(?is)<(style|script)[^>]*>.*?</\1>', ' ', html_text)
        html_text = re.sub(r'<[^>]+>', ' ', html_text)
        return ' '.join(html.unescape(html_text).split())
    return ' '.join((plain or '').split())


_ZILLOW_BUTTON_TEXT = re.compile(
    r"\s*(Yes, this property is available!|Sorry, this property is no longer available\.|Reply on Zillow|Send application)"
)


def clean_message(text: str) -> str:
    """Drop Zillow's quick-reply button labels that end up in the email text."""
    return _ZILLOW_BUTTON_TEXT.sub("", text or "").strip()


def parse_zillow_email(msg) -> dict | None:
    from_name, from_addr = parseaddr(_header(msg, 'From'))
    reply_name, reply_addr = parseaddr(_header(msg, 'Reply-To'))
    if 'convo.zillow.com' not in (from_addr + reply_addr).lower():
        return None

    subject = _header(msg, 'Subject')
    text = _body_text(msg)

    name = reply_name or from_name
    address = ''
    message = ''

    # First inquiry layout: "New message <address> . <Name> says: <message> Reply to ..."
    m = re.search(r'New message (.+?) \. (.+?) says: (.+?)(?: Reply to | You can also reply directly)', text)
    if m:
        address, name, message = m.group(1).strip(), m.group(2).strip() or name, m.group(3).strip()
    else:
        # Follow-up layout: "Regarding your listing at: <address> ... RENTER'S NAME <n> RENTER'S MESSAGE <msg> <uuid>"
        am = re.search(r'Regarding your listing at: (.+?) (?:Yes No )?Reply on Zillow', text)
        nm = re.search(r"RENTER'S NAME (.+?) RENTER'S MESSAGE (.+?)(?: [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{20,}|$)", text)
        if am:
            address = am.group(1).strip()
        if nm:
            name, message = nm.group(1).strip() or name, nm.group(2).strip()
    if not address:
        sm = re.search(r'(?:about|for) (.+)$', subject)
        if sm:
            address = sm.group(1).strip()
    message = clean_message(message)
    if not message:
        # Unknown layout: keep the start of the email so nothing is lost
        message = text[:1500] or subject

    phone_match = re.search(r'(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})', message + ' ' + text[:3000])
    parts = (name or '').split(None, 1)
    try:
        received = parsedate_to_datetime(msg.get('Date'))
    except Exception:
        received = None

    return {
        'external_id': (msg.get('Message-ID') or '').strip()[:255],
        'first_name': parts[0] if parts else '',
        'last_name': parts[1] if len(parts) > 1 else '',
        'email': reply_addr or from_addr,
        'phone': phone_match.group(1) if phone_match else '',
        'message': message,
        'property_address': address.rstrip(' .,')[:255],
        'received_at': received,
    }


def sync_zillow_inquiries(days: int = 14) -> int:
    """Import new Zillow inquiry emails from the last `days` days. Returns how many were added."""
    from .models import Inquiry

    creds = _imap_credentials()
    if not creds:
        return 0

    since = (timezone.now() - timedelta(days=days)).strftime('%d-%b-%Y')
    created = 0
    conn = imaplib.IMAP4_SSL('imap.gmail.com', timeout=20)
    try:
        conn.login(*creds)
        conn.select('INBOX', readonly=True)
        _typ, data = conn.search(None, f'(FROM "convo.zillow.com" SINCE {since})')
        for num in (data[0] or b'').split():
            _typ, hdr = conn.fetch(num, '(BODY.PEEK[HEADER.FIELDS (MESSAGE-ID)])')
            mid = (email.message_from_bytes(hdr[0][1]).get('Message-ID') or '').strip()[:255]
            if mid and Inquiry.objects.filter(external_id=mid).exists():
                continue
            _typ, full = conn.fetch(num, '(BODY.PEEK[])')
            parsed = parse_zillow_email(email.message_from_bytes(full[0][1]))
            if not parsed or not parsed['email']:
                continue
            received = parsed.pop('received_at')
            # Follow-up messages in the same Zillow conversation join the existing inquiry
            existing = (
                Inquiry.objects.filter(source='zillow', email=parsed['email'])
                .order_by('-created_at')
                .first()
            )
            if existing:
                stamp = received.strftime('%m/%d/%Y %I:%M %p') if received else ''
                entry = f"— {stamp}\n{parsed['message']}"
                if entry in existing.message or existing.external_id == parsed['external_id']:
                    continue
                existing.message = f"{existing.message}\n\n{entry}".strip()
                existing.status = 'new'
                existing.save(update_fields=['message', 'status', 'updated_at'])
                continue
            inquiry = Inquiry.objects.create(source='zillow', status='new', **parsed)
            if received:
                Inquiry.objects.filter(pk=inquiry.pk).update(created_at=received)
            created += 1
    finally:
        try:
            conn.logout()
        except Exception:
            pass
    if created:
        logger.info('Imported %s Zillow inquiries', created)
    return created


def sync_zillow_inquiries_throttled() -> None:
    """Run the import at most every couple of minutes (called when admins open Inquiries)."""
    if not _imap_credentials() or cache.get(_SYNC_CACHE_KEY):
        return
    cache.set(_SYNC_CACHE_KEY, True, _SYNC_INTERVAL_SECONDS)

    # Reading the inbox takes several seconds; don't hold up the admin's page load.
    def run():
        from django.db import connection
        try:
            sync_zillow_inquiries(days=3)
        except Exception as e:
            logger.warning('Zillow inquiry sync failed: %s', e)
        finally:
            connection.close()

    threading.Thread(target=run, daemon=True).start()
