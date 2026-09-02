"""
Django email backend that sends via the Gmail API over HTTPS.

Works on Render free tier (SMTP ports 465/587 are blocked there).
Requires OAuth client + refresh token for the Google Workspace mailbox.
"""
from __future__ import annotations

import base64
import logging

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)

GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send"


def _require_oauth_settings():
    client_id = (getattr(settings, "GMAIL_OAUTH_CLIENT_ID", None) or "").strip()
    client_secret = (getattr(settings, "GMAIL_OAUTH_CLIENT_SECRET", None) or "").strip()
    refresh_token = (getattr(settings, "GMAIL_OAUTH_REFRESH_TOKEN", None) or "").strip()
    missing = [
        name
        for name, val in (
            ("GMAIL_OAUTH_CLIENT_ID", client_id),
            ("GMAIL_OAUTH_CLIENT_SECRET", client_secret),
            ("GMAIL_OAUTH_REFRESH_TOKEN", refresh_token),
        )
        if not val
    ]
    if missing:
        raise RuntimeError(
            "Gmail API is not configured. Missing: "
            + ", ".join(missing)
            + ". Run: python manage.py gmail_oauth_setup"
        )
    return client_id, client_secret, refresh_token


def build_gmail_service():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    client_id, client_secret, refresh_token = _require_oauth_settings()
    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=[GMAIL_SEND_SCOPE],
    )
    creds.refresh(Request())
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def _message_to_raw(email_message) -> str:
    """Build RFC822 from Django EmailMessage and return base64url raw payload."""
    mime_msg = email_message.message()
    return base64.urlsafe_b64encode(mime_msg.as_bytes()).decode("ascii").rstrip("=")


class GmailApiEmailBackend(BaseEmailBackend):
    """Send email through Gmail API (HTTPS) using a Workspace mailbox OAuth refresh token."""

    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        try:
            service = build_gmail_service()
        except Exception as exc:
            if not self.fail_silently:
                raise
            logger.error("Gmail API auth failed: %s", exc, exc_info=True)
            return 0

        sent = 0
        for message in email_messages:
            try:
                raw = _message_to_raw(message)
                service.users().messages().send(
                    userId="me",
                    body={"raw": raw},
                ).execute()
                sent += 1
                logger.info(
                    "Gmail API sent message to %s subject=%r",
                    ", ".join(message.to or []),
                    message.subject,
                )
            except Exception as exc:
                logger.error("Gmail API send failed: %s", exc, exc_info=True)
                if not self.fail_silently:
                    raise
        return sent
