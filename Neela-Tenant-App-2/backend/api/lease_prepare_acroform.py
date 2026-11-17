"""
Build an AcroForm (fillable) copy of the Neela Texas lease from underscore blanks.

Adobe PDF Services Import Form Data requires interactive fields.
"""
from __future__ import annotations

import logging
from io import BytesIO
from pathlib import Path

import fitz

from .lease_pdf_template import (
    TEMPLATE_PDF_PATH,
    _CHECK_EMPTY,
    _bbox_for_range,
    _line_chars,
    _line_text,
    _resolve_blank_line,
    _resolve_checkbox_line,
    _underscore_runs,
)

logger = logging.getLogger(__name__)

FILLABLE_PDF_PATH = TEMPLATE_PDF_PATH.parent / "neela_texas_lease_fillable.pdf"


def _field_name(key: str) -> str:
    return key.strip().replace("{{", "").replace("}}", "").strip() or "field"


def prepare_fillable_lease_pdf(
    source: Path | None = None,
    dest: Path | None = None,
) -> Path:
    """Overlay named text/checkbox widgets on blanks and write fillable PDF."""
    src = Path(source or TEMPLATE_PDF_PATH)
    out_path = Path(dest or FILLABLE_PDF_PATH)
    if not src.is_file():
        raise FileNotFoundError(f"Source lease PDF missing: {src}")

    doc = fitz.open(str(src))
    counters: dict[str, int] = {}
    used_names: dict[str, int] = {}

    def unique_name(base: str) -> str:
        n = used_names.get(base, 0)
        used_names[base] = n + 1
        return base if n == 0 else f"{base}_{n}"

    try:
        for page in doc:
            raw = page.get_text("rawdict")
            for block in raw.get("blocks", []):
                if block.get("type") != 0:
                    continue
                for line in block.get("lines", []):
                    chars = _line_chars(line)
                    if not chars:
                        continue
                    text = _line_text(chars)

                    if chars[0].get("c") in _CHECK_EMPTY:
                        key = _resolve_checkbox_line(text, counters)
                        if key:
                            rect = _bbox_for_range(chars, 0, 1)
                            if not rect.is_empty:
                                r = fitz.Rect(
                                    rect.x0 - 0.5,
                                    rect.y0 - 0.5,
                                    rect.x1 + 0.5,
                                    rect.y1 + 0.5,
                                )
                                page.draw_rect(r, color=(1, 1, 1), fill=(1, 1, 1), width=0)
                                w = fitz.Widget()
                                w.field_type = fitz.PDF_WIDGET_TYPE_CHECKBOX
                                w.field_name = unique_name(_field_name(key))
                                w.rect = r
                                w.field_value = False
                                page.add_widget(w)

                    runs = _underscore_runs(chars)
                    if not runs:
                        continue
                    keys = _resolve_blank_line(text, counters)
                    if not keys:
                        continue

                    for run, key in zip(runs, keys):
                        if not key:
                            continue
                        rect = _bbox_for_range(chars, run[0], run[1])
                        if rect.is_empty:
                            continue
                        page.draw_rect(
                            fitz.Rect(rect.x0 - 0.3, rect.y0 - 0.4, rect.x1 + 0.3, rect.y1 + 0.4),
                            color=(1, 1, 1),
                            fill=(1, 1, 1),
                            width=0,
                        )
                        w = fitz.Widget()
                        w.field_type = fitz.PDF_WIDGET_TYPE_TEXT
                        w.field_name = unique_name(_field_name(key))
                        w.rect = fitz.Rect(rect.x0, rect.y0 - 1.0, rect.x1, rect.y1 + 1.0)
                        w.field_value = ""
                        w.text_fontsize = 9
                        w.fill_color = (1, 1, 1)
                        page.add_widget(w)

        buf = BytesIO()
        doc.save(buf, deflate=True, garbage=4)
        out_path.write_bytes(buf.getvalue())
        logger.info(
            "Wrote fillable lease PDF: %s (%s widgets)",
            out_path,
            sum(used_names.values()),
        )
        return out_path
    finally:
        doc.close()


def ensure_fillable_template() -> Path:
    if FILLABLE_PDF_PATH.is_file():
        return FILLABLE_PDF_PATH
    return prepare_fillable_lease_pdf()
