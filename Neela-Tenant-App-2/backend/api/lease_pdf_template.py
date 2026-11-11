"""
Fill the polished Neela Texas lease PDF (logo + layout preserved) by overlaying
values onto underscore blanks and checkbox glyphs.
"""
from __future__ import annotations

import logging
import re
from io import BytesIO
from pathlib import Path
from typing import Any

import fitz

logger = logging.getLogger(__name__)

TEMPLATE_PDF_PATH = Path(__file__).resolve().parent / "lease_assets" / "neela_texas_lease_template.pdf"
_CHECK_EMPTY = ("☐", "□", "❑", "❒")


def template_pdf_available() -> bool:
    return TEMPLATE_PDF_PATH.is_file()


def _is_checked(value: Any) -> bool:
    if value is True:
        return True
    s = str(value or "").strip().lower()
    return s in ("[x]", "x", "true", "1", "yes", "on", "☑", "✓")


def _is_empty_fill(value: Any) -> bool:
    if value is None:
        return True
    text = str(value).strip()
    if not text:
        return True
    if re.fullmatch(r"_+", text):
        return True
    if text.startswith("[_"):
        return True
    return False


def _money_text(value: Any) -> str | None:
    if _is_empty_fill(value):
        return None
    return str(value).strip().lstrip("$").strip() or None


def _plain_text(value: Any) -> str | None:
    if _is_empty_fill(value):
        return None
    text = str(value).strip()
    # Skip leftover checkbox tokens accidentally mapped to blanks
    if text in ("[x]", "[ ]", "[X]"):
        return None
    return text


def _line_chars(line: dict) -> list[dict]:
    chars: list[dict] = []
    for sp in line.get("spans", []):
        chars.extend(sp.get("chars") or [])
    return chars


def _line_text(chars: list[dict]) -> str:
    return "".join(c.get("c", "") for c in chars)


def _underscore_runs(chars: list[dict]) -> list[tuple[int, int]]:
    runs: list[tuple[int, int]] = []
    i = 0
    n = len(chars)
    while i < n:
        if chars[i].get("c") == "_":
            j = i
            while j < n and chars[j].get("c") == "_":
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
        b = c.get("bbox")
        if not b:
            continue
        xs0.append(b[0])
        ys0.append(b[1])
        xs1.append(b[2])
        ys1.append(b[3])
    if not xs0:
        return fitz.Rect(0, 0, 0, 0)
    return fitz.Rect(min(xs0), min(ys0), max(xs1), max(ys1))


def _fill_blank(page: fitz.Page, rect: fitz.Rect, text: str, fontsize: float = 10.0) -> None:
    """White out underscore run and write value on the glyph baseline.

    ``insert_textbox`` fails on these tight blank rows (negative overflow), so we
    use ``insert_text`` at the baseline instead.
    """
    if rect.is_empty or not text:
        return
    pad = fitz.Rect(rect.x0 - 0.6, rect.y0 - 1.0, rect.x1 + 0.6, rect.y1 + 1.0)
    page.draw_rect(pad, color=(1, 1, 1), fill=(1, 1, 1), width=0)

    size = max(7.0, min(fontsize, rect.height * 0.95))
    max_w = max(8.0, rect.width - 1.0)
    # Approx Helvetica width ~0.5em; shrink / truncate to fit the blank
    while size >= 7.0 and (len(text) * size * 0.52) > max_w:
        size -= 0.4
    fitted = text
    while fitted and (len(fitted) * size * 0.52) > max_w:
        fitted = fitted[:-1]
    if not fitted:
        fitted = text[:1]

    baseline = fitz.Point(rect.x0 + 0.5, rect.y1 - 1.2)
    page.insert_text(
        baseline,
        fitted,
        fontsize=size,
        fontname="helv",
        color=(0, 0, 0),
    )


def _queue_checkbox(page: fitz.Page, box_rect: fitz.Rect, pending_marks: list) -> None:
    """Redact empty ☐ glyph; queue an X to draw after redactions apply."""
    if box_rect.is_empty:
        return
    pad = fitz.Rect(box_rect.x0 - 1.0, box_rect.y0 - 1.0, box_rect.x1 + 1.0, box_rect.y1 + 1.0)
    page.add_redact_annot(pad, fill=(1, 1, 1))
    pending_marks.append(box_rect)


def _draw_checkbox_marks(page: fitz.Page, marks: list[fitz.Rect]) -> None:
    for box_rect in marks:
        size = min(10.5, max(8.0, box_rect.height * 0.78))
        x = box_rect.x0 + (box_rect.width - size * 0.55) / 2
        y = box_rect.y0 + box_rect.height * 0.78
        page.insert_text(
            fitz.Point(x, y),
            "X",
            fontsize=size,
            fontname="helv",
            color=(0, 0, 0),
        )


def _write_runs(page, chars, runs, values: list[str | None], fontsize: float) -> None:
    for run, value in zip(runs, values):
        if not value:
            continue
        _fill_blank(page, _bbox_for_range(chars, run[0], run[1]), value, fontsize=fontsize)


def _resolve_blank_line(text: str, counters: dict[str, int]) -> list[str] | None:
    """
    Return replacement keys for underscore runs on this line (left-to-right),
    or None if the line is not a known fillable blank line.
    """
    t = " ".join(text.split())

    def take(name: str) -> int:
        n = counters.get(name, 0)
        counters[name] = n + 1
        return n

    # --- Unique / high-priority patterns ---
    if t.startswith("Tenant's Name:"):
        take("tenant_name")
        return ["{{tenant_name}}"]
    if t.startswith("Tenant's Phone:"):
        return ["{{tenant_phone}}"]
    if t.startswith("Tenant's Email:"):
        return ["{{tenant_email}}"]
    if t.startswith("Occupants:"):
        return ["{{occupants}}"]
    if t.startswith("Occupant's Phone:"):
        return ["{{occupant_phone}}"]
    if t.startswith("Property Address:"):
        return ["{{property_address}}"]
    if t.startswith("Residence Type:"):
        return ["{{residence_type}}"]
    if t.startswith("Bedroom(s):"):
        return ["{{bedrooms}}"]
    if t.startswith("Bathroom(s):"):
        return ["{{bathrooms}}"]
    if "furnished with the following:" in t:
        return ["{{furnishings_list}}"]
    if t.startswith("Appliances Included:"):
        return ["{{appliances_list}}"]
    if t.startswith("Monthly Rent:"):
        return ["{{rent_amount}}"]
    if "otherwise agreed as" in t and "of the month" in t:
        return ["{{rent_due_day}}"]
    if t.startswith("☐ Other:") or t.startswith("Other:"):
        # Payment other vs utilities other vs amounts other — use counters
        n = take("other_blank")
        if n == 0:
            return ["{{payment_other}}"]
        if n == 1:
            return ["{{utilities_other}}"]
        # Amounts page: Other: ____ $____
        return ["{{due_other_label}}", "{{due_other_amount}}"]
    # Month-to-month: start-date blank is on the continuation line
    if t.startswith("________________") and "and terminates upon either the Landlord or Tenant" in t:
        return ["{{lease_start_date}}"]
    if "of at least" in t and "days" in t and "_" in text:
        return ["{{notice_days}}"]
    if "Standard lease: This Agreement has a start date of" in t:
        # start + possibly "end date of" on same line; end often continues next line
        if "end date of" in t and text.count("_") > 10:
            counters["await_end_date"] = 1
            return ["{{lease_start_date}}"]
        return ["{{lease_start_date}}"]
    if t.startswith("________________") and t.rstrip().endswith("."):
        # Standard-lease end-date continuation: ______________________.
        n = take("std_end_cont")
        if n == 0:
            return ["{{lease_end_date}}"]
    if "and an end date of" in t and "_" in text:
        return ["{{lease_end_date}}"]
    if "The Tenant is permitted to move in on" in t:
        return ["{{early_move_in_date}}", "{{early_move_in_prorated}}"]
    if "A security deposit of $" in t or "A security deposit of $" in text or (
        "A security deposit of" in t and "$" in t
    ):
        return ["{{deposit_amount}}"]
    if "The Tenant shall pre-pay rent of" in t:
        # amount on this line; period may continue next lines — fill first run only here
        return ["{{prepaid_rent_amount}}"]
    if "for the period" in t and "pre-pay" not in t:
        # period blanks (may be two dates)
        return ["{{prepaid_rent_period}}"]
    if "fixed amount equal to" in t:
        return ["{{late_fee_amount}}"]
    if "a penalty equal to" in t and ("$" in t or "☐ $" in text or "☐ $" in t):
        return ["{{nsf_amount}}"]
    if "following utilities and services:" in t:
        # blank may be on next line — if this line has underscores
        if "_" in text:
            return ["{{utilities_list}}"]
    if t.startswith("______________________________________________") and counters.get("await_util_list"):
        counters["await_util_list"] = 0
        return ["{{utilities_list}}"]
    if "Pets are allowed subject to the following:" in t:
        return ["{{pet_terms}}"]
    if t.startswith("Pet Fee:"):
        n = take("pet_fee")
        return ["{{pet_fee}}"] if n == 0 else ["{{due_pet_fee}}"]
    if "shall be completed by" in t:
        return ["{{inspection_by}}"]
    if "Smoking is permitted only in the following areas:" in t:
        if "_" in text:
            return ["{{smoking_areas}}"]
    if "minimum liability coverage of" in t:
        return ["{{insurance_min}}"]
    if t.startswith("Landlord's Name:"):
        # Page 1 is already filled with NEELA; only blank ones need fill
        if "_" in text:
            return ["{{landlord_name}}"]
    if t.startswith("Mailing Address:"):
        n = take("mailing")
        if n == 0:
            return ["{{landlord_address}}"]
        if n == 1:
            return ["{{landlord_address}}"]
        return ["{{property_address}}"]
    if "no more than" in t and "hours" in t:
        return ["{{guest_hours}}"]
    if t.startswith("Within") and "hours of the Tenant's occupancy" in t:
        return ["{{occupancy_accept_hours}}"]
    if "by providing" in t and "hours' notice" in t:
        return ["{{entry_notice_hours}}"]
    if "cure such violation within" in t:
        return ["{{default_cure_days}}"]
    if "continues for" in t and "days after the Tenant" in t:
        return ["{{landlord_default_days}}"]
    if t.startswith("Co-Signer's Name:"):
        return ["{{cosigner_name}}"]
    if t.startswith("Co-Signer's Address:"):
        return ["{{cosigner_address}}"]
    if t.startswith("Co-Signer's Phone:"):
        return ["{{cosigner_phone}}"]
    if "First (1st) Month's Rent:" in t:
        return ["{{due_first_month}}"]
    if t.startswith("Security Deposit:") and "$" in t:
        return ["{{due_deposit}}"]
    if t.startswith("Pre-Paid Rent:"):
        return ["{{due_prepaid}}"]
    if t.startswith("Total Due at Signing:"):
        return ["{{due_total}}"]
    if "Known lead-based paint and/or hazards are present" in t and "_" in text:
        return ["{{lead_explain}}"]
    if "The Landlord is responsible for the following utilities and services:" in t and "_" not in text:
        counters["await_util_list"] = 1
        return None
    if "Smoking is permitted only in the following areas:" in t and "_" not in text:
        counters["await_smoking"] = 1
        return None
    if counters.get("await_smoking") and "_" in text:
        counters["await_smoking"] = 0
        return ["{{smoking_areas}}"]

    # Continuation end-date line for standard lease
    if counters.get("await_end_date") and t.startswith("________________"):
        counters["await_end_date"] = 0
        return ["{{lease_end_date}}"]

    # Prepaid period continuation
    if counters.get("await_prepaid_period") and "_" in text:
        counters["await_prepaid_period"] = 0
        return ["{{prepaid_rent_period}}"]
    if "The Tenant shall pre-pay rent of" in t and "period" not in t:
        counters["await_prepaid_period"] = 1

    return None


def _resolve_checkbox_line(text: str, counters: dict[str, int]) -> str | None:
    """Return replacement key for a line that begins with an empty checkbox."""
    t = " ".join(text.split())
    # Strip leading checkbox glyph for matching
    for g in _CHECK_EMPTY:
        if t.startswith(g):
            t = t[len(g) :].strip()
            break

    def take(name: str) -> int:
        n = counters.get(name, 0)
        counters[name] = n + 1
        return n

    rules = [
        ("The Property is not furnished.", "{{furnished_no}}"),
        ("The Property is furnished with the following:", "{{furnished_yes}}"),
        ("ACH (electronic bank transfer)", "{{pay_ach}}"),
        ("Cash", "{{pay_cash}}"),
        ("Check", "{{pay_check}}"),
        ("Zelle: neelarealestatellc@gmail.com", "{{pay_zelle}}"),
        ("Month-to-month: This Agreement is a month-to-month lease", "{{term_month_to_month}}"),
        ("Standard lease: This Agreement has a start date of", "{{term_standard}}"),
        ("The Tenant is not permitted to move into the Property before the Start Date.", "{{early_move_in_no}}"),
        ("The Tenant is permitted to move in on", "{{early_move_in_yes}}"),
        ("No security deposit is required as part of this Agreement.", "{{deposit_none}}"),
        ("A security deposit of", "{{deposit_required}}"),
        ("The Tenant is not required to pre-pay rent other than the 1st month's rent", "{{prepaid_none}}"),
        ("The Tenant shall pre-pay rent of", "{{prepaid_required}}"),
        ("The Landlord is not responsible for any utilities and services.", "{{utilities_tenant}}"),
        ("The Landlord is responsible for the following utilities and services:", "{{utilities_landlord}}"),
        ("Water", "{{util_water}}"),
        ("Electricity", "{{util_electricity}}"),
        ("Gas", "{{util_gas}}"),
        ("Internet", "{{util_internet}}"),
        ("No pets are allowed on the Property except for animals legally recognized", "{{pets_none}}"),
        ("Pets are allowed subject to the following:", "{{pets_allowed}}"),
        ("No move-in inspection is required to be completed as part of this Agreement.", "{{inspection_none}}"),
        ("A move-in inspection is required and shall be completed by", "{{inspection_required}}"),
        ("Smoking is not permitted anywhere on the Property.", "{{smoking_no}}"),
        ("Smoking is permitted only in the following areas:", "{{smoking_yes}}"),
        ("The Tenant is not legally obligated to obtain or maintain renters insurance", "{{insurance_optional}}"),
        ("The Tenant is required to obtain and maintain renters insurance", "{{insurance_required}}"),
        ("The Property was constructed prior to January 1, 1978.", "{{lead_pre_1978}}"),
        ("The Property was constructed on or after January 1, 1978", "{{lead_post_1978}}"),
        ("There is no co-signer to this Agreement", "{{cosigner_none}}"),
        ("The following co-signer personally guarantees", "{{cosigner_yes}}"),
        ("Must Not", "{{electricity_must_not}}"),
        ("Must", "{{electricity_must}}"),
        ("Lessor has no knowledge of lead-based paint", "{{lead_no_knowledge}}"),
        ("Known lead-based paint and/or hazards are present", "{{lead_known}}"),
        ("Lessor has no reports or records pertaining to lead-based paint", "{{lead_no_reports}}"),
        ("Lessor has provided the lessee with all available records", "{{lead_has_reports}}"),
        ("The Landlord is aware that the dwelling you are renting is in a 100-year floodplain.", "{{flood_yes}}"),
        ("The Landlord is not aware that the dwelling you are renting is in a 100-year floodplain.", "{{flood_no}}"),
    ]
    if t.startswith("Other:"):
        n = take("other_check")
        return "{{pay_other}}" if n == 0 else "{{util_other}}"

    # Prefer longer needles first
    rules.sort(key=lambda x: len(x[0]), reverse=True)
    for needle, key in rules:
        # Exact for short utility/payment labels so "Cash" doesn't match longer text
        if len(needle) <= 12:
            head = t.split()[0] if t.split() else t
            # Allow "Cash" / "Check" / "Water" / "Gas" / "Internet" / "Electricity" / "Must"
            if head.rstrip(":") == needle.rstrip(":") or t == needle or t.startswith(needle + " "):
                return key
            continue
        if t == needle or t.startswith(needle):
            return key
    return None


def _value_for_key(key: str, replacements: dict[str, Any]) -> str | None:
    raw = replacements.get(key)
    money_keys = {
        "{{rent_amount}}",
        "{{deposit_amount}}",
        "{{early_move_in_prorated}}",
        "{{prepaid_rent_amount}}",
        "{{late_fee_amount}}",
        "{{nsf_amount}}",
        "{{pet_fee}}",
        "{{insurance_min}}",
        "{{due_first_month}}",
        "{{due_deposit}}",
        "{{due_prepaid}}",
        "{{due_pet_fee}}",
        "{{due_other_amount}}",
        "{{due_total}}",
    }
    if key in money_keys:
        return _money_text(raw)
    return _plain_text(raw)


def render_filled_template_pdf(replacements: dict[str, Any]) -> bytes:
    """Overlay lease field values onto the branded Neela Texas lease PDF."""
    if not template_pdf_available():
        raise FileNotFoundError(f"Lease template PDF missing: {TEMPLATE_PDF_PATH}")

    doc = fitz.open(str(TEMPLATE_PDF_PATH))
    out = BytesIO()
    counters: dict[str, int] = {}
    try:
        for page in doc:
            pending_checks: list[fitz.Rect] = []
            pending_blanks: list[tuple[fitz.Rect, str, float]] = []
            raw = page.get_text("rawdict")
            for block in raw.get("blocks", []):
                if block.get("type") != 0:
                    continue
                for line in block.get("lines", []):
                    chars = _line_chars(line)
                    if not chars:
                        continue
                    text = _line_text(chars)
                    fontsize = 10.0
                    if line.get("spans"):
                        try:
                            fontsize = float(line["spans"][0].get("size") or 10.0)
                        except (TypeError, ValueError):
                            pass

                    # Leading checkbox
                    if chars and chars[0].get("c") in _CHECK_EMPTY:
                        key = _resolve_checkbox_line(text, counters)
                        if key and _is_checked(replacements.get(key)):
                            _queue_checkbox(page, _bbox_for_range(chars, 0, 1), pending_checks)

                    # Inline mid-line checkboxes (late fee / NSF)
                    if "one time" in text or "for each day" in text:
                        for ci, ch in enumerate(chars):
                            if ch.get("c") not in _CHECK_EMPTY:
                                continue
                            after = _line_text(chars[ci + 1 : ci + 48]).strip().lower()
                            if after.startswith("one time") and _is_checked(
                                replacements.get("{{late_fee_one_time}}")
                            ):
                                _queue_checkbox(
                                    page, _bbox_for_range(chars, ci, ci + 1), pending_checks
                                )
                            elif after.startswith("for each day") and _is_checked(
                                replacements.get("{{late_fee_daily}}")
                            ):
                                _queue_checkbox(
                                    page, _bbox_for_range(chars, ci, ci + 1), pending_checks
                                )

                    if "maximum allowable statutory" in text or "penalty equal to" in text:
                        for ci, ch in enumerate(chars):
                            if ch.get("c") not in _CHECK_EMPTY:
                                continue
                            after = _line_text(chars[ci + 1 : ci + 60]).strip()
                            if after.lstrip().startswith("$") and _is_checked(
                                replacements.get("{{nsf_fixed}}")
                            ):
                                _queue_checkbox(
                                    page, _bbox_for_range(chars, ci, ci + 1), pending_checks
                                )
                            elif "maximum allowable" in after and _is_checked(
                                replacements.get("{{nsf_max_statutory}}")
                            ):
                                _queue_checkbox(
                                    page, _bbox_for_range(chars, ci, ci + 1), pending_checks
                                )

                    runs = _underscore_runs(chars)
                    if not runs:
                        continue

                    keys = _resolve_blank_line(text, counters)
                    if not keys:
                        continue

                    # Don't fill blanks belonging to an unselected term type
                    is_mtm_line = (
                        "and terminates upon either the Landlord or Tenant" in text
                        or ("of at least" in text and "days" in text)
                    )
                    is_std_line = "Standard lease:" in text or (
                        text.strip().startswith("________________") and text.rstrip().endswith(".")
                    )
                    if is_mtm_line and not _is_checked(replacements.get("{{term_month_to_month}}")):
                        continue
                    if is_std_line and not _is_checked(replacements.get("{{term_standard}}")):
                        continue

                    values = [_value_for_key(k, replacements) for k in keys]
                    for run, value in zip(runs, values):
                        if not value:
                            continue
                        pending_blanks.append(
                            (
                                _bbox_for_range(chars, run[0], run[1]),
                                value,
                                max(8.5, fontsize - 0.5),
                            )
                        )

            # Redact checkbox glyphs once per page, then paint marks + blanks
            if pending_checks:
                page.apply_redactions()
                _draw_checkbox_marks(page, pending_checks)
            for rect, value, size in pending_blanks:
                _fill_blank(page, rect, value, fontsize=size)

        doc.save(out, deflate=True, garbage=4)
    finally:
        doc.close()
    out.seek(0)
    return out.read()
