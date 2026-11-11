
import base64
import logging
import re
from io import BytesIO
from datetime import datetime, timedelta
from typing import Any
import fitz

from django.conf import settings

logger = logging.getLogger(__name__)
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from .models import Tenant, LeaseTemplate, LegalDocument


def _property_city_state_zip(tenant: Tenant) -> str:
    """Derive property city/state/zip from tenant.property_unit or settings."""
    pu = (tenant.property_unit or '').strip()
    if pu:
        parts = [p.strip() for p in pu.split(',') if p.strip()]
        if len(parts) >= 2:
            return ', '.join(parts[-2:])  # e.g. "Houston, TX 77001"
        if len(parts) >= 3:
            return ', '.join(parts[-3:])   # e.g. "Houston, Texas, 77011"
    return getattr(settings, 'PROPERTY_DEFAULT_CITY_STATE_ZIP', None) or '[Property City, State ZIP]'


def _last_day_of_month(d):
    """Return the last day of the month for date d."""
    next_first = (d.replace(day=28) + timedelta(days=4)).replace(day=1)
    return next_first - timedelta(days=1)


def _add_months(start, months: int):
    year = start.year + (start.month - 1 + months) // 12
    month = (start.month - 1 + months) % 12 + 1
    day = min(start.day, _last_day_of_month(start.replace(year=year, month=month, day=1)).day)
    return start.replace(year=year, month=month, day=day)


# Fixed blank lengths — long underscore runs wrap mid-line in PDF and look crossed.
_BLANK_SM = '__________'          # ~10
_BLANK_MD = '____________________'  # ~20
_BLANK_LG = '________________________________'  # ~32


def _val_or_blank(value, blank: str = _BLANK_MD) -> str:
    """Return cleaned value, or a short blank line if missing."""
    if value is None:
        return blank
    text = str(value).strip()
    return text if text else blank


def _cap_underscore_runs(text: str, max_len: int = 32) -> str:
    """Prevent oversized ____ runs that collide when ReportLab wraps lines."""
    if not text:
        return text or ''
    return re.sub(
        r'_{4,}',
        lambda m: '_' * min(len(m.group(0)), max_len),
        text,
    )


def _format_occupant_block(name='', relationship='', age='', dob='', index=None) -> str:
    """One occupant as stacked fields — never pack multiple blanks on one line."""
    header = f'Occupant {index}\n' if index is not None else ''
    return (
        f'{header}'
        f'Name: {_val_or_blank(name, _BLANK_LG)}\n'
        f'Relationship: {_val_or_blank(relationship, _BLANK_MD)}\n'
        f'Age: {_val_or_blank(age, _BLANK_SM)}\n'
        f'Date of Birth: {_val_or_blank(dob, _BLANK_MD)}'
    )


def apply_lease_dates_from_application(tenant: Tenant) -> None:
    """Persist lease_start/lease_end from application when missing (monthly rent unchanged)."""
    app = tenant.application_data or {}
    update_fields = []

    if not tenant.lease_start:
        raw_move_in = app.get('desiredMoveInDate') or ''
        try:
            if raw_move_in:
                tenant.lease_start = datetime.strptime(str(raw_move_in)[:10], '%Y-%m-%d').date()
                update_fields.append('lease_start')
        except ValueError:
            pass
        if not tenant.lease_start:
            tenant.lease_start = datetime.now().date()
            update_fields.append('lease_start')

    if not tenant.lease_end and tenant.lease_start:
        try:
            months = int(app.get('desiredLeaseMonths') or 12)
        except (TypeError, ValueError):
            months = 12
        months = max(1, min(months, 60))
        tenant.lease_end = _add_months(tenant.lease_start, months)
        update_fields.append('lease_end')

    if update_fields:
        tenant.save(update_fields=update_fields)


def build_lease_pdf_filename(tenant: Tenant, prefix: str = 'Lease') -> str:
    """
    Human-readable lease PDF name, e.g.
    Lease_Jane_Doe_6705_Sherman_Street_2026-11-02.pdf
    """
    def part(raw, max_len=48):
        cleaned = re.sub(r'[^\w\s-]', '', str(raw or '').strip())
        cleaned = re.sub(r'\s+', '_', cleaned)
        cleaned = re.sub(r'_+', '_', cleaned).strip('_')
        return (cleaned or 'Unknown')[:max_len]

    date = datetime.now().strftime('%Y-%m-%d')
    return f"{prefix}_{part(tenant.name)}_{part(tenant.property_unit)}_{date}.pdf"


def build_lease_replacements(tenant: Tenant) -> dict:
    """
    Build {{placeholder}} → value map for a tenant (text template + PDF overlay).
    """
    # Extract name parts
    name_parts = tenant.name.split(' ', 1)
    first_name = name_parts[0] if len(name_parts) > 0 else tenant.name
    last_name = name_parts[1] if len(name_parts) > 1 else ''
    
    # Lease dates: prefer stored dates; else move-in + desiredLeaseMonths (default 12)
    lease_start = tenant.lease_start or datetime.now().date()
    if tenant.lease_end:
        lease_end = tenant.lease_end
    else:
        application_data_preview = tenant.application_data or {}
        months_raw = application_data_preview.get('desiredLeaseMonths')
        try:
            months = int(months_raw) if months_raw not in (None, '') else 12
        except (TypeError, ValueError):
            months = 12
        months = max(1, min(months, 60))
        # Approximate calendar months without dateutil
        year = lease_start.year + (lease_start.month - 1 + months) // 12
        month = (lease_start.month - 1 + months) % 12 + 1
        day = min(lease_start.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
        lease_end = lease_start.replace(year=year, month=month, day=day)
    
    # Get employment info from application data
    employment = tenant.application_data.get('employment', {}) if tenant.application_data else {}
    application_data = tenant.application_data or {}

    # Parse emergency contact (stored as "Name, Relationship, Phone")
    ec_full = application_data.get('emergencyContact', '')
    ec_parts = [p.strip() for p in ec_full.split(',')] if ec_full else []
    ec_name = (
        application_data.get('emergencyContactName')
        or (ec_parts[0] if len(ec_parts) >= 1 else '')
    )
    ec_relationship = (
        application_data.get('emergencyContactRelationship')
        or (ec_parts[1] if len(ec_parts) >= 2 else '')
    )
    ec_phone = (
        application_data.get('emergencyContactPhone')
        or (ec_parts[2] if len(ec_parts) >= 3 else '')
    )

    blank_occupant_lines = (
        _format_occupant_block(index=1)
        + '\n\n'
        + _format_occupant_block(index=2)
    )

    # Get other occupants (prefer structured list from application form)
    occupants_list = application_data.get('otherOccupantsList')
    if isinstance(occupants_list, list) and occupants_list:
        occupant_blocks = []
        for i, o in enumerate(occupants_list, start=1):
            if not isinstance(o, dict):
                continue
            oname = str(o.get('name') or '').strip()
            if not oname:
                continue
            oage = str(o.get('age') or '').strip()
            orel = str(o.get('relationship') or '').strip()
            odob = str(o.get('dob') or o.get('dateOfBirth') or '').strip()
            occupant_blocks.append(
                _format_occupant_block(oname, orel, oage, odob, index=i)
            )
        other_occupants = ', '.join(
            f"{str(o.get('name') or '').strip()}"
            + (f" (age {str(o.get('age') or '').strip()})" if str(o.get('age') or '').strip() else '')
            for o in occupants_list
            if isinstance(o, dict) and str(o.get('name') or '').strip()
        ) or 'None'
        if occupant_blocks:
            occupants_detailed = '\n\n'.join(occupant_blocks)
            # Keep one extra blank block for signing-time additions
            if len(occupant_blocks) < 2:
                occupants_detailed += '\n\n' + _format_occupant_block(index=len(occupant_blocks) + 1)
        else:
            occupants_detailed = blank_occupant_lines
    else:
        other_occupants = application_data.get('otherOccupants') or 'None'
        if other_occupants and other_occupants != 'None':
            occupants_detailed = (
                _format_occupant_block(other_occupants, index=1)
                + '\n\n'
                + _format_occupant_block(index=2)
            )
        else:
            occupants_detailed = blank_occupant_lines

    # Previous landlord may be combined "address, name, contact" or separate fields
    prev_combined = application_data.get('previousLandlordInfo') or ''
    prev_parts = [p.strip() for p in prev_combined.split(',')] if prev_combined else []
    previous_address = application_data.get('previousAddress') or (prev_parts[0] if prev_parts else '')
    previous_landlord_name = application_data.get('landlordName') or (prev_parts[1] if len(prev_parts) >= 2 else '')
    previous_landlord_phone = (
        application_data.get('landlordContact')
        or application_data.get('previousLandlordPhone')
        or (prev_parts[2] if len(prev_parts) >= 3 else '')
    )

    has_pets = application_data.get('hasPets')
    pets_desc = application_data.get('petsWhich') or application_data.get('pets_description') or ''
    if has_pets and application_data.get('petCount'):
        pets_desc = (
            f"{application_data.get('petCount')} pet(s)"
            + (f": {pets_desc}" if pets_desc else '')
        ).strip()

    eviction_or_felony = application_data.get('hasEvictionOrFelony')
    agrees_no_smoking = application_data.get('agreesNoSmoking')

    try:
        lease_term_months = str(int(application_data.get('desiredLeaseMonths') or 12))
    except (TypeError, ValueError):
        lease_term_months = '12'

    move_in_raw = application_data.get('desiredMoveInDate') or ''
    move_in_display = move_in_raw
    try:
        if move_in_raw:
            move_in_display = datetime.strptime(str(move_in_raw)[:10], '%Y-%m-%d').strftime('%m/%d/%Y')
    except ValueError:
        pass

    # Extract bedrooms/bathrooms from application data
    # We use the first desired option as the default for the lease if specific unit details aren't available
    bedrooms_list = application_data.get('bedroomsDesired')
    bedrooms_val = str(bedrooms_list[0]) if isinstance(bedrooms_list, list) and bedrooms_list else '[_Beds_]'
    
    bathrooms_list = application_data.get('bathroomsDesired')
    bathrooms_val = str(bathrooms_list[0]) if isinstance(bathrooms_list, list) and bathrooms_list else '[_Baths_]'

    # Template variables
    replacements = {
        '{{tenant_name}}': tenant.name,
        '{{tenant_first_name}}': first_name,
        '{{tenant_last_name}}': last_name,
        '{{tenant_email}}': tenant.email,
        '{{tenant_phone}}': tenant.phone,
        '{{property_unit}}': tenant.property_unit,
        '{{rent_amount}}': f"${tenant.rent_amount:,.2f}",
        '{{deposit_amount}}': f"${tenant.deposit:,.2f}",
        # Backward-compatible aliases used by some legal/compliance templates
        '{{deposit}}': f"{tenant.deposit:,.2f}",
        '{{lease_start_date}}': lease_start.strftime('%m/%d/%Y'),
        '{{lease_end_date}}': lease_end.strftime('%m/%d/%Y'),
        '{{lease_start}}': lease_start.strftime('%m/%d/%Y'),
        '{{lease_end}}': lease_end.strftime('%m/%d/%Y'),
        '{{employer}}': _val_or_blank(
            application_data.get('currentEmployer') or employment.get('employer')
        ),
        '{{job_title}}': _val_or_blank(
            employment.get('jobTitle') or application_data.get('jobTitle')
        ),
        '{{monthly_income}}': (
            f"${float(employment.get('monthlyIncome')):,.2f}"
            if employment.get('monthlyIncome') not in (None, '')
            else (
                f"${float(application_data.get('monthlyIncome')):,.2f}"
                if application_data.get('monthlyIncome') not in (None, '')
                else _BLANK_MD
            )
        ),
        '{{current_date}}': datetime.now().strftime('%m/%d/%Y'),
        '{{property_manager}}': getattr(settings, 'PROPERTY_MANAGER_NAME', None) or 'Neela Capital Investment',
        
        # Landlord/company from settings only (no hardcoded defaults)
        '{{landlord_name}}': getattr(settings, 'LANDLORD_NAME', None) or '[Landlord Name]',
        '{{landlord_address}}': getattr(settings, 'LANDLORD_ADDRESS', None) or '[Landlord Address]',
        '{{landlord_phone}}': getattr(settings, 'LANDLORD_PHONE', None) or '[Landlord Phone]',
        '{{landlord_email}}': getattr(settings, 'LANDLORD_EMAIL', None) or '[Landlord Email]',
        
        # Property city/state/zip: derive from tenant.property_unit when it contains commas, else settings or placeholder
        '{{property_city_state_zip}}': _property_city_state_zip(tenant),
        # Aliases used in some templates (e.g. Settings UI)
        '{{company_name}}': getattr(settings, 'PROPERTY_MANAGER_NAME', None) or getattr(settings, 'LANDLORD_NAME', None) or 'Neela Capital Investment',
        '{{property_address}}': tenant.property_unit or '[Property Address]',
        
        # Date helpers for Notices
        '{{period_start_date}}': lease_start.replace(day=1).strftime('%m/%d/%Y'),
        '{{period_end_date}}': (_last_day_of_month(lease_start)).strftime('%m/%d/%Y'),
        
        # Termination Helper (Default to 30 days from now)
        '{{move_out_deadline}}': (datetime.now() + timedelta(days=30)).strftime('%B %d, %Y'),
        
        # New helpers for Application Packet
        '{{tenant_current_address}}': (
            application_data.get('currentAddress')
            or ', '.join(
                p for p in [
                    application_data.get('currentAddressStreet'),
                    application_data.get('currentAddressCity'),
                    f"{application_data.get('currentAddressState') or ''} {application_data.get('currentAddressZip') or ''}".strip(),
                ]
                if p
            )
            or ''
        ),
        '{{move_in_date}}': move_in_display,
        '{{lease_term_months}}': lease_term_months,
        '{{additional_notes}}': _val_or_blank(application_data.get('additionalNotes')),

        '{{occupants}}': other_occupants,
        '{{occupants_detailed}}': occupants_detailed,

        # --- APPLICATION DATA MAPPING ---
        '{{bedrooms_desired}}': bedrooms_val,
        '{{bathrooms_desired}}': bathrooms_val,

        '{{date_of_birth}}': _val_or_blank(
            application_data.get('dateOfBirth') or application_data.get('dob')
        ),
        '{{driver_license}}': _val_or_blank(application_data.get('driverLicense')),
        '{{dl_state}}': _val_or_blank(application_data.get('driverLicenseState')),
        '{{ssn}}': _val_or_blank(
            application_data.get('ssn') or application_data.get('ssnLast4')
        ),
        '{{marital_status}}': _val_or_blank(application_data.get('maritalStatus')),
        '{{citizenship}}': _val_or_blank(application_data.get('citizenship')),
        '{{height}}': _val_or_blank(application_data.get('height')),
        '{{weight}}': _val_or_blank(application_data.get('weight')),
        '{{hair_color}}': _val_or_blank(application_data.get('hairColor')),
        '{{eye_color}}': _val_or_blank(application_data.get('eyeColor')),

        '{{emergency_contact_name}}': _val_or_blank(ec_name),
        '{{emergency_contact_relationship}}': _val_or_blank(ec_relationship),
        '{{emergency_contact_phone}}': _val_or_blank(ec_phone),
        '{{emergency_contact_address}}': _val_or_blank(
            application_data.get('emergencyContactAddress')
        ),
        '{{emergency_contact_email}}': _val_or_blank(
            application_data.get('emergencyContactEmail')
        ),

        '{{vehicles_list}}': (
            ', '.join(
                f"{v.get('year', '')} {v.get('make', '')} {v.get('model', '')}".strip()
                for v in application_data.get('vehicles', [])
                if isinstance(v, dict)
            )
            if application_data.get('vehicles')
            else _BLANK_MD
        ),

        '{{pets_description}}': (
            pets_desc
            or (
                ', '.join(
                    [f"{p.get('type')} ({p.get('name')})" for p in application_data.get('pets', [])]
                )
                if application_data.get('pets')
                else ('NONE' if has_pets is False else _BLANK_MD)
            )
        ),
        '{{has_pets_check}}': '[x]' if has_pets else '[ ]',
        '{{no_pets_check}}': '[x]' if has_pets is False else '[ ]',
        '{{has_pets_yes}}': '[x]' if has_pets else '[ ]',
        '{{has_pets_no}}': '[x]' if has_pets is False else '[ ]',
        '{{smokes_yes}}': '[ ]' if agrees_no_smoking else ('[x]' if agrees_no_smoking is False else '[ ]'),
        '{{smokes_no}}': '[x]' if agrees_no_smoking else '[ ]',
        '{{eviction_yes}}': '[x]' if eviction_or_felony else '[ ]',
        '{{eviction_no}}': '[x]' if eviction_or_felony is False else '[ ]',
        '{{felony_yes}}': '[x]' if eviction_or_felony else '[ ]',
        '{{felony_no}}': '[x]' if eviction_or_felony is False else '[ ]',
        '{{eviction_felony_explanation}}': application_data.get('evictionFelonyExplanation') or '',

        '{{supervisor_name}}': _val_or_blank(employment.get('supervisorName')),
        '{{supervisor_phone}}': _val_or_blank(employment.get('supervisorPhone')),
        '{{employment_start_date}}': _val_or_blank(employment.get('startDate')),
        '{{employment_duration}}': _val_or_blank(employment.get('duration')),

        '{{previous_address}}': _val_or_blank(previous_address),
        '{{previous_landlord}}': _val_or_blank(prev_combined or previous_landlord_name),
        '{{previous_landlord_name}}': _val_or_blank(previous_landlord_name),
        '{{previous_landlord_phone}}': _val_or_blank(previous_landlord_phone),
        '{{previous_landlord_email}}': _val_or_blank(application_data.get('previousLandlordEmail')),
        '{{previous_rent}}': _val_or_blank(application_data.get('previousRent')),
        '{{reason_for_leaving}}': _val_or_blank(application_data.get('reasonForLeaving')),
        '{{move_in_date_prev}}': _val_or_blank(application_data.get('prevMoveInDate')),
        '{{move_out_date_prev}}': _val_or_blank(application_data.get('prevMoveOutDate')),

        '{{bedrooms}}': bedrooms_val,
        '{{bathrooms}}': bathrooms_val,
        '{{late_fee_day}}': '3rd',
        '{{returned_check_fee}}': '$55.00',
    }

    # --- Neela Texas lease options (admin/PM ticks + application extras) ---
    opts = application_data.get('leaseOptions') if isinstance(application_data.get('leaseOptions'), dict) else {}

    def _chk(cond):
        return '[x]' if cond else '[ ]'

    def _money(val, fallback=''):
        if val in (None, ''):
            return fallback if fallback != '' else _BLANK_MD
        s = str(val).strip()
        if not s:
            return fallback if fallback != '' else _BLANK_MD
        if s.startswith('$'):
            return s
        try:
            return f"${float(str(s).replace(',', '')):,.2f}"
        except (TypeError, ValueError):
            return s

    def _opt_date(val):
        raw = str(val or '').strip()
        if not raw:
            return _BLANK_MD
        try:
            return datetime.strptime(raw[:10], '%Y-%m-%d').strftime('%m/%d/%Y')
        except ValueError:
            return raw

    # Property / furnishing defaults from matched Property when present
    prop_furnishing = ''
    prop_beds = bedrooms_val
    prop_baths = bathrooms_val
    try:
        from .models import Property
        unit_text = (tenant.property_unit or '').lower()
        for p in Property.objects.all()[:200]:
            name = (p.name or '').lower()
            addr = (p.address or '').lower()
            if name and name in unit_text:
                prop_furnishing = (getattr(p, 'furnishing_type', None) or '') or ''
                if getattr(p, 'bedrooms', None):
                    prop_beds = str(p.bedrooms)
                if getattr(p, 'bathrooms', None):
                    prop_baths = str(p.bathrooms)
                break
            if addr and addr.split(',')[0] in unit_text:
                prop_furnishing = (getattr(p, 'furnishing_type', None) or '') or ''
                if getattr(p, 'bedrooms', None):
                    prop_beds = str(p.bedrooms)
                if getattr(p, 'bathrooms', None):
                    prop_baths = str(p.bathrooms)
                break
    except Exception:
        pass

    furnished_opt = opts.get('furnished')
    if furnished_opt is None:
        furnished = bool(prop_furnishing and 'unfurnished' not in str(prop_furnishing).lower() and str(prop_furnishing).strip())
        if prop_furnishing and 'semi' in str(prop_furnishing).lower():
            furnished = True
        if prop_furnishing and ('not furnished' in str(prop_furnishing).lower() or str(prop_furnishing).lower() == 'unfurnished'):
            furnished = False
    else:
        furnished = bool(furnished_opt)

    term_type = (opts.get('termType') or 'month_to_month').strip().lower()
    is_mtm = term_type in ('month_to_month', 'month-to-month', 'mtm')
    early_allowed = opts.get('earlyMoveInAllowed')
    if early_allowed is None:
        early_allowed = bool(application_data.get('earlyMoveInRequested'))
    deposit_required = opts.get('securityDepositRequired')
    if deposit_required is None:
        deposit_required = float(tenant.deposit or 0) > 0
    prepaid_required = bool(opts.get('prepaidRentRequired'))
    pets_allowed = opts.get('petsAllowed')
    if pets_allowed is None:
        pets_allowed = bool(has_pets)
    smoking_allowed = opts.get('smokingAllowed')
    if smoking_allowed is None:
        smoking_allowed = False if agrees_no_smoking else (True if agrees_no_smoking is False else False)
    insurance_required = bool(opts.get('rentersInsuranceRequired'))
    has_cosigner = bool(opts.get('hasCosigner'))
    electricity_must = opts.get('electricityInTenantName')
    if electricity_must is None:
        electricity_must = True
    lead_pre = bool(opts.get('leadPaintPre1978'))
    flood_yes = bool(opts.get('floodplainAware'))
    late_daily = opts.get('lateFeeDaily')
    if late_daily is None:
        late_daily = True
    nsf_max = bool(opts.get('nsfUseMaxStatutory'))
    landlord_utils = bool(opts.get('landlordPaysUtilities'))
    inspection_req = bool(opts.get('moveInInspectionRequired'))

    util_inc = opts.get('utilitiesIncluded') if isinstance(opts.get('utilitiesIncluded'), dict) else {}
    amounts = opts.get('amountsDue') if isinstance(opts.get('amountsDue'), dict) else {}

    early_date = _opt_date(opts.get('earlyMoveInDate') or application_data.get('earlyMoveInDate'))
    pet_terms = opts.get('petTerms') or pets_desc or _BLANK_MD
    furnishings_list = opts.get('furnishingsList') or (str(prop_furnishing) if furnished and prop_furnishing else _BLANK_MD)
    appliances_list = opts.get('appliances') or 'Mini-split AC, Refrigerator, Stove/Oven, Smoke Detector(s)'

    due_first = _money(amounts.get('firstMonth'), f"${tenant.rent_amount:,.2f}")
    due_dep = _money(amounts.get('deposit'), f"${tenant.deposit:,.2f}")
    due_prepaid = _money(amounts.get('prepaid'), '$0.00')
    due_pet = _money(amounts.get('petFee') or opts.get('petFee'), '$0.00')
    due_other_amt = _money(amounts.get('otherAmount'), '$0.00')
    due_total = amounts.get('total')
    if due_total in (None, ''):
        try:
            total_n = float(tenant.rent_amount or 0) + float(tenant.deposit or 0)
            due_total = f"${total_n:,.2f}"
        except (TypeError, ValueError):
            due_total = _BLANK_MD
    else:
        due_total = _money(due_total)

    replacements.update({
        '{{occupant_phone}}': _val_or_blank(application_data.get('occupantPhone') or opts.get('occupantPhone')),
        '{{residence_type}}': _val_or_blank(opts.get('residenceType') or 'Residential Unit'),
        '{{bedrooms}}': str(opts.get('bedrooms') or prop_beds),
        '{{bathrooms}}': str(opts.get('bathrooms') or prop_baths),
        '{{furnished_yes}}': _chk(furnished),
        '{{furnished_no}}': _chk(not furnished),
        '{{furnishings_list}}': furnishings_list if furnished else _BLANK_MD,
        '{{appliances_list}}': appliances_list,
        '{{rent_due_day}}': str(opts.get('rentDueDay') or '3rd'),
        '{{pay_ach}}': _chk(bool(opts.get('payAch'))),
        '{{pay_cash}}': _chk(bool(opts.get('payCash'))),
        '{{pay_check}}': _chk(bool(opts.get('payCheck'))),
        '{{pay_zelle}}': _chk(opts.get('payZelle') if opts.get('payZelle') is not None else True),
        '{{pay_other}}': _chk(bool(opts.get('payOther'))),
        '{{payment_other}}': _val_or_blank(opts.get('paymentOther')),
        '{{term_month_to_month}}': _chk(is_mtm),
        '{{term_standard}}': _chk(not is_mtm),
        '{{notice_days}}': str(opts.get('noticeDays') or '30'),
        '{{early_move_in_yes}}': _chk(bool(early_allowed)),
        '{{early_move_in_no}}': _chk(not early_allowed),
        '{{early_move_in_date}}': early_date if early_allowed else _BLANK_MD,
        '{{early_move_in_prorated}}': _money(opts.get('earlyMoveInProrated')) if early_allowed else _BLANK_MD,
        '{{deposit_required}}': _chk(bool(deposit_required)),
        '{{deposit_none}}': _chk(not deposit_required),
        '{{prepaid_required}}': _chk(prepaid_required),
        '{{prepaid_none}}': _chk(not prepaid_required),
        '{{prepaid_rent_amount}}': _money(opts.get('prepaidRentAmount')) if prepaid_required else _BLANK_MD,
        '{{prepaid_rent_period}}': _val_or_blank(opts.get('prepaidRentPeriod')) if prepaid_required else _BLANK_MD,
        '{{late_fee_amount}}': _money(opts.get('lateFeeAmount'), '$55.00'),
        '{{late_fee_one_time}}': _chk(not late_daily),
        '{{late_fee_daily}}': _chk(late_daily),
        '{{nsf_fixed}}': _chk(not nsf_max),
        '{{nsf_amount}}': _money(opts.get('nsfAmount'), '$55.00'),
        '{{nsf_max_statutory}}': _chk(nsf_max),
        '{{utilities_tenant}}': _chk(not landlord_utils),
        '{{utilities_landlord}}': _chk(landlord_utils),
        '{{utilities_list}}': _val_or_blank(opts.get('utilitiesList')) if landlord_utils else _BLANK_MD,
        '{{util_water}}': _chk(bool(util_inc.get('water'))),
        '{{util_electricity}}': _chk(bool(util_inc.get('electricity'))),
        '{{util_gas}}': _chk(bool(util_inc.get('gas'))),
        '{{util_internet}}': _chk(bool(util_inc.get('internet'))),
        '{{util_other}}': _chk(bool(util_inc.get('other') or opts.get('utilitiesOther'))),
        '{{utilities_other}}': _val_or_blank(util_inc.get('other') or opts.get('utilitiesOther')),
        '{{pets_none}}': _chk(not pets_allowed),
        '{{pets_allowed}}': _chk(pets_allowed),
        '{{pet_terms}}': pet_terms if pets_allowed else _BLANK_MD,
        '{{pet_fee}}': _money(opts.get('petFee')) if pets_allowed else _BLANK_MD,
        '{{inspection_none}}': _chk(not inspection_req),
        '{{inspection_required}}': _chk(inspection_req),
        '{{inspection_by}}': _opt_date(opts.get('moveInInspectionBy')) if inspection_req else _BLANK_MD,
        '{{smoking_no}}': _chk(not smoking_allowed),
        '{{smoking_yes}}': _chk(smoking_allowed),
        '{{smoking_areas}}': _val_or_blank(opts.get('smokingAreas')) if smoking_allowed else _BLANK_MD,
        '{{insurance_optional}}': _chk(not insurance_required),
        '{{insurance_required}}': _chk(insurance_required),
        '{{insurance_min}}': _money(opts.get('rentersInsuranceMin')) if insurance_required else _BLANK_MD,
        '{{guest_hours}}': str(opts.get('guestHours') or '48'),
        '{{occupancy_accept_hours}}': str(opts.get('occupancyAcceptHours') or '24'),
        '{{entry_notice_hours}}': str(opts.get('entryNoticeHours') or '24'),
        '{{default_cure_days}}': str(opts.get('defaultCureDays') or '3'),
        '{{landlord_default_days}}': str(opts.get('landlordDefaultDays') or '7'),
        '{{cosigner_none}}': _chk(not has_cosigner),
        '{{cosigner_yes}}': _chk(has_cosigner),
        '{{cosigner_name}}': _val_or_blank(opts.get('cosignerName')) if has_cosigner else _BLANK_MD,
        '{{cosigner_address}}': _val_or_blank(opts.get('cosignerAddress')) if has_cosigner else _BLANK_MD,
        '{{cosigner_phone}}': _val_or_blank(opts.get('cosignerPhone')) if has_cosigner else _BLANK_MD,
        '{{electricity_must}}': _chk(bool(electricity_must)),
        '{{electricity_must_not}}': _chk(not electricity_must),
        '{{lead_pre_1978}}': _chk(lead_pre),
        '{{lead_post_1978}}': _chk(not lead_pre),
        '{{lead_no_knowledge}}': _chk(not bool(opts.get('leadKnownHazards'))),
        '{{lead_known}}': _chk(bool(opts.get('leadKnownHazards'))),
        '{{lead_explain}}': _val_or_blank(opts.get('leadExplain')),
        '{{lead_no_reports}}': _chk(not bool(opts.get('leadHasReports'))),
        '{{lead_has_reports}}': _chk(bool(opts.get('leadHasReports'))),
        '{{lead_reports_list}}': _val_or_blank(opts.get('leadReportsList')),
        '{{flood_yes}}': _chk(flood_yes),
        '{{flood_no}}': _chk(not flood_yes),
        '{{due_first_month}}': due_first,
        '{{due_deposit}}': due_dep if deposit_required else '$0.00',
        '{{due_prepaid}}': due_prepaid,
        '{{due_pet_fee}}': due_pet,
        '{{due_other_label}}': _val_or_blank(amounts.get('otherLabel')),
        '{{due_other_amount}}': due_other_amt,
        '{{due_total}}': due_total,
    })

    return replacements


def fill_lease_template(template_content: str, tenant: Tenant) -> str:
    """
    Fill lease template with tenant data.

    Args:
        template_content: Template string with placeholders
        tenant: Tenant instance

    Returns:
        Filled template string
    """
    replacements = build_lease_replacements(tenant)
    filled_content = template_content
    for placeholder, value in replacements.items():
        filled_content = filled_content.replace(placeholder, str(value))

    # Cap any leftover long blank runs from the template itself
    return _cap_underscore_runs(filled_content)


def bake_inline_fills(content: str, values: dict) -> str:
    """
    Apply interactive HTML blank fills (____ / [ ]) into lease text so they
    persist into regenerated PDFs. Keys match frontend ids: p{para}l{line}_t{token}.
    """
    if not content or not isinstance(values, dict):
        return content or ''

    paragraphs = content.split('\n\n')
    out_paras = []
    for pi, para in enumerate(paragraphs):
        lines = para.split('\n')
        out_lines = []
        for li, line in enumerate(lines):
            tokens = re.split(r'(_{4,}|\[\s*\])', line)
            if len(tokens) == 1:
                out_lines.append(line)
                continue
            rebuilt = []
            for ti, token in enumerate(tokens):
                fid = f'p{pi}l{li}_t{ti}'
                if re.fullmatch(r'_{4,}', token or ''):
                    raw = values.get(fid, '')
                    text = str(raw).strip() if raw not in (None, False) else ''
                    # Keep a capped blank if still empty so PDF wrap stays clean
                    rebuilt.append(text if text else ('_' * min(len(token), 32)))
                elif re.fullmatch(r'\[\s*\]', token or ''):
                    checked = values.get(fid) is True or str(values.get(fid, '')).lower() in (
                        'true', '1', 'yes', 'x', 'on',
                    )
                    rebuilt.append('[x]' if checked else '[ ]')
                else:
                    rebuilt.append(token)
            out_lines.append(''.join(rebuilt))
        out_paras.append('\n'.join(out_lines))
    return _cap_underscore_runs('\n\n'.join(out_paras))


def _pdf_markup_line(text: str) -> str:
    """
    Escape text for ReportLab Paragraph and convert underscore blanks to
    underlined non-breaking spaces so wrap never splits a ____ run mid-glyph.
    """
    escaped = (
        (text or '')
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
    )

    def blank_to_underline(match: re.Match) -> str:
        # Cap visual width (~0.4–1.6"); &nbsp; underline stays one visual blank
        n = max(8, min(len(match.group(0)), 28))
        return f'<u>{"&nbsp;" * n}</u>'

    escaped = re.sub(r'_{4,}', blank_to_underline, escaped)
    return escaped.replace('\n', '<br/>')


def _lease_logo_path():
    """Prefer PNG logo extracted from the branded lease PDF."""
    from pathlib import Path
    assets = Path(__file__).resolve().parent / 'lease_assets'
    for name in ('neela_logo_from_pdf.png', 'neela-logo.png', 'neela-logo.webp'):
        p = assets / name
        if p.is_file():
            return str(p)
    return None


def render_lease_pdf_bytes(filled_content: str, title: str = 'RESIDENTIAL LEASE APPLICATION') -> bytes:
    """Render lease/application text content to a PDF byte string (fallback path)."""
    from reportlab.platypus import Image as RLImage

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=48,
        bottomMargin=40,
    )
    elements = []
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=13,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=10,
        alignment=1,
        leading=16,
    )
    body_style = ParagraphStyle(
        'LeaseBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=14,  # Extra leading so underline blanks never collide across wraps
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=0,
        spaceAfter=0,
    )
    header_style = ParagraphStyle(
        'LeaseSectionHeader',
        parent=body_style,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=6,
        spaceAfter=2,
    )

    logo_path = _lease_logo_path()
    if logo_path:
        try:
            elements.append(RLImage(logo_path, width=2.6 * inch, height=0.76 * inch))
            elements.append(Spacer(1, 0.12 * inch))
        except Exception as e:
            logger.warning('Could not embed lease logo: %s', e)

    doc_title = (title or 'RESIDENTIAL LEASE APPLICATION').upper()
    elements.append(Paragraph(doc_title.replace('&', '&amp;'), title_style))
    elements.append(Spacer(1, 0.1 * inch))

    content = _cap_underscore_runs(filled_content or '')
    for para in content.split('\n\n'):
        raw = para.strip()
        if not raw:
            continue
        first_line = raw.split('\n', 1)[0].strip()
        is_header = (
            bool(re.match(r'^\d+\.\s+[A-Z]', first_line))
            or (
                len(first_line) < 80
                and first_line.isupper()
                and any(c.isalpha() for c in first_line)
            )
        )
        style = header_style if is_header and '\n' not in raw else body_style
        elements.append(Paragraph(_pdf_markup_line(raw), style))
        elements.append(Spacer(1, 0.1 * inch))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


def generate_lease_pdf(tenant: Tenant, template: LeaseTemplate = None):
    """
    Generate PDF lease document from template.
    
    Args:
        tenant: Tenant instance
        template: LeaseTemplate instance (optional, uses default if not provided)
        
    Returns:
        tuple: (PDF BytesIO object, filled content string)
    """
    apply_lease_dates_from_application(tenant)

    # Prefer Neela Texas Residential Lease (current packet)
    if not template:
        template = (
            LeaseTemplate.objects.filter(
                is_active=True, name__iexact='Neela Texas Residential Lease'
            ).first()
            or LeaseTemplate.objects.filter(
                is_active=True, name__icontains='Neela Texas Residential'
            ).first()
            or LeaseTemplate.objects.filter(
                is_active=True, name__iexact='Residential Lease Application'
            ).first()
            or LeaseTemplate.objects.filter(
                is_active=True, name__icontains='Residential Lease Application'
            ).first()
            or LeaseTemplate.objects.filter(is_active=True, name__icontains='Residential Lease').first()
            or LeaseTemplate.objects.filter(is_active=True).first()
        )
        if not template:
            # Create default template if none exists
            template = LeaseTemplate.objects.create(
                name='Standard Residential Lease',
                content=get_default_lease_template(),
                is_active=True
            )
    
    # Fill text template (signing UI / audit) and prefer branded PDF overlay
    filled_content = fill_lease_template(template.content, tenant)
    replacements = build_lease_replacements(tenant)
    pdf_bytes = None
    try:
        from .lease_pdf_template import render_filled_template_pdf, template_pdf_available
        use_branded = template_pdf_available() and (
            'neela' in (template.name or '').lower()
            or 'texas residential' in (template.name or '').lower()
        )
        if use_branded:
            pdf_bytes = render_filled_template_pdf(replacements)
    except Exception as e:
        logger.warning('Branded lease PDF fill failed; falling back to text render: %s', e)
        pdf_bytes = None

    if not pdf_bytes:
        pdf_bytes = render_lease_pdf_bytes(
            filled_content, template.name or 'RESIDENTIAL LEASE APPLICATION'
        )
    buffer = BytesIO(pdf_bytes)
    buffer.seek(0)
    return buffer, filled_content


def get_default_lease_template() -> str:
    """Return default lease template content."""
    return """RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Lease") is entered into on {{current_date}} between {{property_manager}} ("Landlord") and {{tenant_name}} ("Tenant").

1. PROPERTY
Landlord leases to Tenant the property located at {{property_unit}} (the "Property").

2. TERM
The lease term begins on {{lease_start_date}} and ends on {{lease_end_date}}.

3. RENT
Tenant agrees to pay Landlord monthly rent of {{rent_amount}} per month, due on the first day of each month.

4. SECURITY DEPOSIT
Tenant shall pay a security deposit of {{deposit_amount}} prior to move-in (or as otherwise agreed). The deposit will be held by Landlord as security for the performance of Tenant's obligations under this Lease and is not treated as paid until Landlord confirms receipt.

5. TENANT INFORMATION
Tenant Name: {{tenant_name}}
Email: {{tenant_email}}
Phone: {{tenant_phone}}
Employer: {{employer}}
Job Title: {{job_title}}
Monthly Income: {{monthly_income}}

6. OBLIGATIONS
Tenant agrees to:
- Pay rent on time
- Keep the Property clean and in good condition
- Not disturb other tenants
- Comply with all applicable laws and regulations

7. DEFAULT
If Tenant fails to pay rent or breaches any term of this Lease, Landlord may terminate this Lease.

8. SIGNATURES
By signing below, both parties agree to the terms of this Lease.

Landlord's Signature: _________________________  Date: {{current_date}}
{{landlord_name}}


Tenant's Signature: _________________________  Date: {{current_date}}
{{tenant_name}}"""


def resolve_template_version_for_lease(template: LeaseTemplate | None = None):
    """Latest published DocumentTemplateVersion for a LeaseTemplate, if any."""
    if template is None:
        return None
    try:
        return template.latest_published_version()
    except Exception:
        return None


def save_lease_document(
    tenant: Tenant,
    pdf_buffer: BytesIO,
    filled_content: str,
    template: LeaseTemplate = None,
    template_version=None,
) -> LegalDocument:
    """
    Save lease document to database and storage.
    
    Args:
        tenant: Tenant instance
        pdf_buffer: PDF file buffer
        filled_content: Filled template content
        template: LeaseTemplate used for generation (optional)
        template_version: Frozen DocumentTemplateVersion (optional)
        
    Returns:
        LegalDocument instance
    """
    if template_version is None:
        if template is None:
            template = (
                LeaseTemplate.objects.filter(
                    is_active=True, name__iexact='Neela Texas Residential Lease'
                ).first()
                or LeaseTemplate.objects.filter(
                    is_active=True, name__icontains='Neela Texas Residential'
                ).first()
            )
        template_version = resolve_template_version_for_lease(template)

    # Always create a NEW legal document (each generation is a new version)
    # Don't reuse old leases - they serve as history
    legal_doc = LegalDocument.objects.create(
        tenant=tenant,
        type='Lease Agreement',
        generated_content=filled_content,
        status='Draft',
        template_version=template_version,
    )
    
    # Save PDF file — human-readable: Lease_Name_Unit_YYYY-MM-DD.pdf
    filename = build_lease_pdf_filename(tenant)
    
    # Check if using Cloudinary storage
    if hasattr(settings, 'CLOUDINARY_STORAGE') and settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'):
        try:
            import cloudinary.uploader
            # Reset buffer
            pdf_buffer.seek(0)
            
            # Configure Cloudinary explicitly if needed
            if not cloudinary.config().api_secret:
                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
                    api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
                    api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
                )
            
            # Upload as raw file
            # Use f"media/leases/{filename}" to match what Django storage likely expects for retrieval
            # The Cloudinary storage backend typically prepends MEDIA_TAG or similar if configured.
            # Even if we upload manually, if we set the name to "media/leases/...", the backend will look there.
            
            # CRITICAL: Remove the .pdf extension from public_id because format="pdf" adds it?
            # Or keep it and remove format="pdf"?
            # Cloudinary raw resources with format often duplicate extensions.
            
            # IMPORTANT: For Cloudinary, keep public_id WITHOUT file extension.
            # Cloudinary stores the "format" separately, and admin signed download URLs
            # (private_download_url) expect a public_id without extension.
            public_id = f"media/leases/{filename}"
            if public_id.lower().endswith(".pdf"):
                public_id = public_id[:-4]
            # if public_id.endswith('.pdf'):
            #     public_id = public_id[:-4]

            logger.info(f"Uploading lease PDF to Cloudinary with public_id: {public_id}")
            
            # Check actual buffer size
            pdf_buffer.seek(0, 2)  # Seek to end
            actual_size = pdf_buffer.tell()  # Get size
            pdf_buffer.seek(0)  # CRITICAL: Reset to beginning for upload!
            
            logger.info(f"Buffer size: {actual_size} bytes")
            
            # OPTION A: Upload PDF as raw + public.
            # This does not guarantee CDN access (Cloudinary access control can still return 401),
            # but it ensures the asset exists as a raw resource and can be fetched via
            # Cloudinary admin-signed URLs for server-side retrieval.
            upload_result = cloudinary.uploader.upload(
                pdf_buffer, 
                resource_type="raw", 
                public_id=public_id,
                type="upload",  # public delivery type
                format="pdf",
            )
            
            logger.info(f"Cloudinary upload successful!")
            logger.info(f"Result public_id: {upload_result.get('public_id')}")
            logger.info(f"Result secure_url: {upload_result.get('secure_url')}")
            logger.info(f"Result format: {upload_result.get('format')}")
            
            # IMPORTANT: django-cloudinary-storage expects `name` to be the Cloudinary public_id
            # (WITHOUT the extension). If we store "foo.pdf" here, Cloudinary URLs can become "foo.pdf.pdf".
            uploaded_public_id = upload_result.get('public_id') or public_id
            legal_doc.pdf_file.name = uploaded_public_id
            legal_doc.save()
            
            logger.info(f"Saved legal_doc.pdf_file.name: {legal_doc.pdf_file.name}")
            
        except Exception as e:
            # Log the error properly
            logger.error(f"Cloudinary raw upload failed: {e}")
            import traceback
            logger.error(traceback.format_exc())
            
            # Fallback to standard save if Cloudinary manual upload fails
            try:
                pdf_buffer.seek(0)
                legal_doc.pdf_file.save(filename, ContentFile(pdf_buffer.read()), save=True)
                logger.info(f"Fallback save completed: {legal_doc.pdf_file.name}")
            except Exception as fallback_error:
                logger.error(f"Fallback save also failed: {fallback_error}")
                raise
    else:
        # Standard local storage
        legal_doc.pdf_file.save(filename, ContentFile(pdf_buffer.read()), save=True)
    
    return legal_doc


# Letter size in points (PyMuPDF / PDF coordinate system)
_PDF_PAGE_WIDTH = 612
_PDF_PAGE_HEIGHT = 792


def stamp_signed_pdf(pdf_bytes: bytes, fields: list[dict], values: dict[str, Any]) -> bytes:
    """Stamp signatures/dates/initials via label search on the branded lease PDF."""
    from .lease_stamp import stamp_signed_pdf as _label_stamp

    return _label_stamp(pdf_bytes, fields, values)


