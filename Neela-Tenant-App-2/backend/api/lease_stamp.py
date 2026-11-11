"""
Label-based PDF stamping for signed leases.

Finds real signature / date / initials blanks on the branded lease PDF
(by line text) instead of relying on hardcoded page-1 coordinates.
"""
from __future__ import annotations

import base64
import logging
import re
from io import BytesIO
from typing import Any

import fitz

logger = logging.getLogger(__name__)

# UI-only acknowledgements — never paint onto the lease body.
_NON_STAMP_FIELD_IDS = frozenset({
    'agree_terms',
    'agree_rules',
})

# field_id → how to locate blanks on the PDF
# occurrence: which matching line (0-based) when several pages share the label
# blank_index: which underscore run on that line (0 = signature, 1 = date on same line)
_LABEL_TARGETS: dict[str, dict[str, Any]] = {
    'landlord_signature': {
        'line_contains': "Landlord's Signature:",
        'blank_index': 0,
        'kind': 'signature',
        'all_occurrences': True,
    },
    'landlord_signature_date': {
        'line_contains': "Landlord's Signature:",
        'blank_index': 1,
        'kind': 'text',
        'all_occurrences': True,
    },
    'landlord_print_name': {
        'line_contains': 'Print Name:',
        'blank_index': 0,
        'kind': 'text',
        # First Print Name under landlord block (page 12)
        'occurrence': 0,
        'all_occurrences': False,
    },
    'tenant_signature': {
        'line_contains': "Tenant's Signature:",
        'blank_index': 0,
        'kind': 'signature',
        'all_occurrences': True,
    },
    'tenant_signature_date': {
        'line_contains': "Tenant's Signature:",
        'blank_index': 1,
        'kind': 'text',
        'all_occurrences': True,
    },
    'tenant_print_name': {
        'line_contains': 'Print Name:',
        'blank_index': 0,
        'kind': 'text',
        # Second Print Name on execution page (under tenant signature)
        'occurrence': 1,
        'all_occurrences': False,
    },
    'tenant_initials': {
        'line_contains': 'Initials:',
        'blank_index': 1,  # Landlord ______  Tenant ______
        'kind': 'text',
        'all_occurrences': True,
        'prefer_contains': 'Tenant',
    },
    'landlord_initials': {
        'line_contains': 'Initials:',
        'blank_index': 0,
        'kind': 'text',
        'all_occurrences': True,
        'prefer_contains': 'Landlord',
    },
}


def _line_chars(line: dict) -> list[dict]:
    chars: list[dict] = []
    for sp in line.get('spans', []):
        chars.extend(sp.get('chars') or [])
    return chars


def _line_text(chars: list[dict]) -> str:
    return ''.join(c.get('c', '') for c in chars)


def _underscore_runs(chars: list[dict]) -> list[tuple[int, int]]:
    runs: list[tuple[int, int]] = []
    i = 0
    n = len(chars)
    while i < n:
        if chars[i].get('c') == '_':
            j = i
            while j < n and chars[j].get('c') == '_':
                j += 1
            if j - i >= 3:
                runs.append((i, j))
            i = j
        else:
            i += 1
    return runs


def _bbox_for_range(chars: list[dict], start: int, end: int) -> fitz.Rect:
    xs0, ys0, xs1, ys1 = [], [], [], []
    for c in chars[start:end]:
        b = c.get('bbox')
        if not b:
            continue
        xs0.append(b[0])
        ys0.append(b[1])
        xs1.append(b[2])
        ys1.append(b[3])
    if not xs0:
        return fitz.Rect(0, 0, 0, 0)
    return fitz.Rect(min(xs0), min(ys0), max(xs1), max(ys1))


def _expand_for_signature(rect: fitz.Rect) -> fitz.Rect:
    """
    Underscore runs are ~11pt tall; place a short signature band just above the line.
    Keep height under ~22pt so we do not collide with the Print Name / prior row
    (~22–24pt line spacing on the branded lease).
    """
    if rect.is_empty:
        return rect
    # ~15pt keeps ink on the signature line without covering Print Name above
    height = min(15.0, max(12.0, rect.height * 1.35))
    return fitz.Rect(rect.x0, max(0.0, rect.y1 - height), rect.x1, rect.y1 + 0.5)


def _expand_for_text(rect: fitz.Rect) -> fitz.Rect:
    if rect.is_empty:
        return rect
    return fitz.Rect(rect.x0 - 0.5, rect.y0 - 2.0, rect.x1 + 0.5, rect.y1 + 2.0)


def _iter_label_targets(
    doc: fitz.Document, target: dict[str, Any]
) -> list[tuple[int, fitz.Rect]]:
    needle = target['line_contains']
    blank_index = int(target.get('blank_index', 0))
    all_occ = bool(target.get('all_occurrences'))
    occurrence = int(target.get('occurrence', 0))
    results: list[tuple[int, fitz.Rect]] = []
    match_i = 0

    for page_index, page in enumerate(doc):
        raw = page.get_text('rawdict')
        for block in raw.get('blocks', []):
            if block.get('type') != 0:
                continue
            for line in block.get('lines', []):
                chars = _line_chars(line)
                if not chars:
                    continue
                text = _line_text(chars)
                if needle not in text:
                    continue
                runs = _underscore_runs(chars)
                if not runs:
                    continue
                if blank_index >= len(runs):
                    continue
                if not all_occ:
                    if match_i != occurrence:
                        match_i += 1
                        continue
                    rect = _bbox_for_range(chars, runs[blank_index][0], runs[blank_index][1])
                    if not rect.is_empty:
                        results.append((page_index, rect))
                    return results
                rect = _bbox_for_range(chars, runs[blank_index][0], runs[blank_index][1])
                if not rect.is_empty:
                    results.append((page_index, rect))
                match_i += 1
    return results


def _whiteout(page: fitz.Page, rect: fitz.Rect) -> None:
    pad = fitz.Rect(rect.x0 - 0.4, rect.y0 - 0.4, rect.x1 + 0.4, rect.y1 + 0.4)
    page.draw_rect(pad, color=(1, 1, 1), fill=(1, 1, 1), width=0)


def _stamp_text(page: fitz.Page, rect: fitz.Rect, text: str) -> None:
    text = (text or '').strip()
    if not text or rect.is_empty:
        return
    _whiteout(page, _expand_for_text(rect))
    size = min(10.5, max(8.0, rect.height * 0.9))
    # Baseline sits on the underscore row
    page.insert_text(
        fitz.Point(rect.x0 + 0.5, rect.y1 - 0.8),
        text[:64],
        fontsize=size,
        fontname='helv',
        color=(0, 0, 0),
    )


def _stamp_signature(page: fitz.Page, rect: fitz.Rect, data_url: str) -> None:
    if not isinstance(data_url, str) or not data_url.startswith('data:image'):
        return
    try:
        payload = data_url.split(',', 1)[1]
        image_bytes = base64.b64decode(payload)
    except Exception as e:
        logger.warning('Bad signature data URL: %s', e)
        return
    if not image_bytes:
        return
    box = _expand_for_signature(rect)
    _whiteout(page, rect)
    try:
        page.insert_image(box, stream=image_bytes, keep_proportion=True)
    except Exception as e:
        logger.warning('Failed to insert signature image: %s', e)


def _format_date(raw: Any) -> str:
    text = str(raw or '').strip()
    if not text:
        return ''
    # HTML date input → MM/DD/YYYY
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})', text)
    if m:
        return f'{m.group(2)}/{m.group(3)}/{m.group(1)}'
    return text


def _coord_fallback_rect(page: fitz.Page, field: dict) -> fitz.Rect | None:
    try:
        x = float(field.get('x', 0))
        y = float(field.get('y', 0))
        w = float(field.get('width', 0.1))
        h = float(field.get('height', 0.05))
    except (TypeError, ValueError):
        return None
    # Ignore legacy page-1 furniture-zone coords (clearly wrong for branded lease)
    if int(field.get('page', 1) or 1) <= 1 and y >= 0.65:
        return None
    pw = page.rect.width or 612.0
    ph = page.rect.height or 792.0
    return fitz.Rect(x * pw, y * ph, (x + w) * pw, (y + h) * ph)


def _place_on_rect(page: fitz.Page, ftype: str, fid: str, raw: Any, rect: fitz.Rect) -> None:
    if ftype == 'checkbox':
        checked = raw is True or str(raw).lower() in ('true', '1', 'yes', 'x')
        if checked:
            size = min(12.0, rect.height * 0.85)
            page.insert_text(
                fitz.Point(rect.x0 + 1, rect.y1 - 1),
                'X',
                fontsize=size,
                fontname='helv',
                color=(0, 0, 0),
            )
    elif ftype == 'signature':
        _stamp_signature(page, rect, str(raw))
    else:
        text = _format_date(raw) if 'date' in fid else str(raw).strip()
        _stamp_text(page, rect, text)


def stamp_signed_pdf(pdf_bytes: bytes, fields: list[dict], values: dict[str, Any]) -> bytes:
    """
    Stamp signature / date / initials onto the lease PDF.

    Prefers DB / submitted normalized coordinates. Falls back to label search
    (Texas branded lease safety net) when coords are missing or legacy junk.
    """
    if not pdf_bytes or not isinstance(fields, list):
        raise ValueError('pdf_bytes and fields required')

    doc = fitz.open(stream=pdf_bytes, filetype='pdf')
    if len(doc) == 0:
        doc.close()
        raise ValueError('PDF has no pages')

    out = BytesIO()
    try:
        field_ids = {f.get('id') for f in fields if isinstance(f, dict)}
        work_items: list[tuple[str, str, dict | None]] = []
        for field in fields:
            if not isinstance(field, dict):
                continue
            fid = field.get('id')
            ftype = field.get('type')
            if not fid or ftype not in ('checkbox', 'text', 'signature'):
                continue
            if fid in _NON_STAMP_FIELD_IDS or field.get('stamp') is False:
                continue
            raw = values.get(fid)
            if raw is None:
                continue
            work_items.append((fid, ftype, field))

        for extra_id in ('tenant_print_name', 'landlord_print_name', 'landlord_initials'):
            if extra_id in field_ids:
                continue
            if values.get(extra_id) in (None, ''):
                continue
            work_items.append((extra_id, 'text', None))

        for fid, ftype, field in work_items:
            raw = values.get(fid)
            if raw is None:
                continue

            placed = False
            # 1) Prefer normalized coords from DocumentField / signing metadata
            if field:
                page_index = max(0, int(field.get('page', 1)) - 1)
                if page_index < len(doc):
                    page = doc[page_index]
                    rect = _coord_fallback_rect(page, field)
                    if rect is not None and not rect.is_empty:
                        _place_on_rect(page, ftype, fid, raw, rect)
                        placed = True

            if placed:
                continue

            # 2) Label search fallback (known Texas keys)
            target = _LABEL_TARGETS.get(fid)
            if not target:
                logger.info('Skipping stamp for %s — no safe coords and no label rule', fid)
                continue
            kind = target.get('kind') or ftype
            for page_index, rect in _iter_label_targets(doc, target):
                page = doc[page_index]
                use_type = 'signature' if (kind == 'signature' or ftype == 'signature') else ftype
                _place_on_rect(page, use_type, fid, raw, rect)
                placed = True
            if not placed:
                logger.info('Skipping stamp for %s — label search found nothing', fid)

        doc.save(out, deflate=True, garbage=4)
    finally:
        doc.close()
    out.seek(0)
    return out.read()
