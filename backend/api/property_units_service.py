"""Sync PropertyUnit rows from portfolio properties and unit-level Property records."""
import re

from .models import Property, PropertyUnit

PROPERTY_GROUPS = [
    ('Avenue Q', ['avenue q', 'ave q']),
    ('Sherman St', ['sherman']),
    ('Avenue H', ['avenue h', 'ave h']),
    ('70th Street', ['70th']),
    ('Wooding St', ['wooding', 'wooden']),
    ('Bella Jess', ['bella jess']),
    ('Avenue F', ['avenue f', 'ave f']),
    ('Conroe', ['conroe']),
    ('Tomball', ['tomball', 'tomabll']),
    ('Magnolia Dr', ['magnolia']),
    ('Westlock Dr', ['westlock']),
]

# Canonical doors per building. Empty list = single-door (no unit picker).
# Keep in sync with utils/propertyGrouping.ts PORTFOLIO_UNIT_CATALOG.
PORTFOLIO_UNIT_CATALOG = {
    'Avenue Q': [
        'Unit A',
        'Unit B (Eado Escape)',
        'Unit C',
        'Unit D (Eado Studio)',
    ],
    'Bella Jess': [],
    'Tomball': [],
    'Conroe': [],
    'Sherman St': [
        'Unit 1',
        'Unit 2 (Urban Nesting)',
        'Unit 3',
        'Unit 4',
        'Unit 5',
        'Unit 6',
    ],
    '70th Street': ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'],
    'Avenue H': [
        'Unit 1 (The Hideaway) 7425',
        'Unit 2 (Little H House) 7427',
        'Unit 3 (Sweet Home) 7429',
        'Unit 4 - Erica',
    ],
    'Wooding St': ['Unit 1', 'Unit 2 (Cozy Suite)', 'Unit 3'],
    'Avenue F': ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4'],
}


def normalize(text):
    return re.sub(r'[^a-z0-9]+', '', (text or '').lower())


def unit_base_key(label):
    m = re.search(r'unit\s*([a-z0-9]+)', label or '', re.I)
    return m.group(1).upper() if m else normalize(label)


def property_search_text(prop):
    return ' '.join(
        x for x in (prop.area, prop.address, prop.name, prop.city, prop.state) if x
    ).lower()


def get_property_group_key(prop):
    text = property_search_text(prop)
    if prop.area and prop.area.strip():
        area = prop.area.strip().lower()
        area_aliases = {
            'tomabll': 'Tomball',
            'tomball': 'Tomball',
            'ave q': 'Avenue Q',
            'aveq': 'Avenue Q',
            'ave h': 'Avenue H',
            'aveh': 'Avenue H',
            'ave f': 'Avenue F',
            'avef': 'Avenue F',
            'wooden': 'Wooding St',
            'wooding': 'Wooding St',
            '70th': '70th Street',
            'sherman': 'Sherman St',
        }
        if area in area_aliases:
            return area_aliases[area]
        for key, _ in PROPERTY_GROUPS:
            if key.lower() == area:
                return key
    # Name-first for known roll-ups (avoid address contamination like Tomball on Avenue F)
    name_norm = normalize(prop.name)
    name_aliases = {
        'tomball': 'Tomball',
        'tomabll': 'Tomball',
        'conroe': 'Conroe',
        'bellajess': 'Bella Jess',
        'aveq': 'Avenue Q',
        'aveh': 'Avenue H',
        'avef': 'Avenue F',
        'sherman': 'Sherman St',
        '70th': '70th Street',
        'wooden': 'Wooding St',
        'wooding': 'Wooding St',
    }
    if name_norm in name_aliases:
        return name_aliases[name_norm]
    for key, patterns in sorted(PROPERTY_GROUPS, key=lambda x: -len(x[0])):
        if any(p in text for p in patterns):
            return key
    return re.sub(r'\s*[-–]\s*unit\s+\w+', '', prop.name or '', flags=re.I).strip() or prop.name or 'Other'


def extract_unit_label(name, address=''):
    src = f'{name or ""} {address or ""}'
    unit = re.search(r'unit\s*[-–]?\s*([A-Za-z0-9]+)', src, re.I)
    if unit:
        return f'Unit {unit[1].upper()}'
    door = re.search(r'door\s*(\d+)', src, re.I)
    if door:
        return f'Door {door[1]}'
    trimmed = (name or '').strip()
    if trimmed:
        return trimmed
    return (address or '').strip() or 'Unit'


DOOR_UNIT_PATTERNS = {
    1: ('unit a', 'unit 1', 'door 1'),
    2: ('unit b', 'unit 2', 'door 2', 'eado escape', 'urban nesting', 'hideaway', 'cozy suite'),
    3: ('unit c', 'unit 3', 'door 3', 'little h', 'sweet home'),
    4: ('unit d', 'unit 4', 'door 4', 'eado studio', 'erica'),
    5: ('unit 5', 'door 5'),
    6: ('unit 6', 'door 6'),
}


def unit_for_door_number(units, door_n):
    """Map Excel Door 1–N to PropertyUnit rows."""
    patterns = DOOR_UNIT_PATTERNS.get(door_n, ())
    for unit in units:
        label = (unit.label or '').lower()
        if any(p in label for p in patterns):
            return unit
    ordered = sorted(units, key=lambda u: (u.sort_order, u.id))
    if 1 <= door_n <= len(ordered):
        return ordered[door_n - 1]
    return None


def unit_sort_key(label):
    m = re.search(r'(\d+|[A-Za-z]+)', label or '')
    return m.group(1).rjust(4, '0') if m else label


def is_portfolio_parent(prop, group_key):
    """Roll-up property (Excel sheet / building total), not an individual door."""
    name_norm = normalize(prop.name)
    group_norm = normalize(group_key)
    area_norm = normalize(prop.area or '')
    if name_norm == group_norm or name_norm == area_norm:
        return True
    short_keys = {
        'aveq': 'Avenue Q',
        'sherman': 'Sherman St',
        '70th': '70th Street',
        'aveh': 'Avenue H',
        'wooden': 'Wooding St',
        'wooding': 'Wooding St',
        'avef': 'Avenue F',
        'tomabll': 'Tomball',
        'tomball': 'Tomball',
        'bellajess': 'Bella Jess',
        'conroe': 'Conroe',
    }
    if name_norm in short_keys and short_keys[name_norm] == group_key:
        return True
    return False


def find_group_siblings(prop, all_properties=None):
    group_key = get_property_group_key(prop)
    pool = all_properties if all_properties is not None else Property.objects.all()
    siblings = [p for p in pool if get_property_group_key(p) == group_key]
    unit_records = [p for p in siblings if not is_portfolio_parent(p, group_key)]
    if unit_records:
        return sorted(unit_records, key=lambda p: unit_sort_key(extract_unit_label(p.name, p.address)))
    return []


def catalog_units_for_property(prop):
    """Return canonical labels for this building, or None if unknown."""
    group_key = get_property_group_key(prop)
    if group_key in PORTFOLIO_UNIT_CATALOG:
        return PORTFOLIO_UNIT_CATALOG[group_key]
    return None


def display_units_for_property(prop, units=None):
    """Units shown in UI / P&L — catalog when known (empty = single-door)."""
    catalog = catalog_units_for_property(prop)
    rows = list(units) if units is not None else list(
        PropertyUnit.objects.filter(property_id=prop.id).order_by('sort_order', 'id')
    )
    if catalog is None:
        return rows
    if not catalog:
        return []
    by_label = {u.label: u for u in rows}
    by_base = {}
    for u in rows:
        key = unit_base_key(u.label)
        if key not in by_base:
            by_base[key] = u
    out = []
    for label in catalog:
        unit = by_label.get(label) or by_base.get(unit_base_key(label))
        if unit:
            out.append(unit)
    return out


def sync_units_for_property(prop, all_properties=None, *, persist=True):
    """
    Ensure PropertyUnit rows exist for a portfolio property.
    Prefer PORTFOLIO_UNIT_CATALOG when the building is known.
    """
    existing = list(PropertyUnit.objects.filter(property_id=prop.id).order_by('sort_order', 'id'))
    catalog = catalog_units_for_property(prop)
    target = []

    if catalog is not None:
        # Empty catalog = single-door building — no unit picker rows needed.
        for i, label in enumerate(catalog):
            target.append({
                'label': label,
                'monthly_rent': 0,
                'status': 'vacant',
                'sort_order': i,
            })
        # Overlay rent/status from sibling Property records when base unit matches.
        siblings = find_group_siblings(prop, all_properties)
        sib_by_base = {
            unit_base_key(extract_unit_label(s.name, s.address)): s for s in siblings
        }
        for spec in target:
            sib = sib_by_base.get(unit_base_key(spec['label']))
            if sib:
                spec['monthly_rent'] = sib.price or 0
                spec['status'] = sib.status or 'vacant'
    else:
        siblings = find_group_siblings(prop, all_properties)
        if siblings:
            for i, sib in enumerate(siblings):
                target.append({
                    'label': extract_unit_label(sib.name, sib.address),
                    'monthly_rent': sib.price or 0,
                    'status': sib.status or 'vacant',
                    'sort_order': i,
                })
        expected = int(prop.units or 1)
        if expected > 1 and len(target) < expected:
            used = {t['label'] for t in target}
            for i in range(expected):
                label = f'Unit {chr(ord("A") + i)}'
                if label in used:
                    continue
                target.append({
                    'label': label,
                    'monthly_rent': 0,
                    'status': 'vacant',
                    'sort_order': len(target),
                })
                if len(target) >= expected:
                    break
        elif not siblings and expected > 1:
            count = int(prop.units)
            labels = [f'Unit {chr(ord("A") + i)}' for i in range(min(count, 26))]
            if count > 26:
                labels = [f'Unit {i + 1}' for i in range(count)]
            for i, label in enumerate(labels):
                target.append({
                    'label': label,
                    'monthly_rent': 0,
                    'status': 'vacant',
                    'sort_order': i,
                })

    if catalog is not None and not catalog:
        return []

    if not target:
        return existing

    if not persist:
        return target

    by_label = {u.label: u for u in existing}
    by_base = {}
    for u in existing:
        key = unit_base_key(u.label)
        if key not in by_base:
            by_base[key] = u

    kept_ids = []
    for spec in target:
        unit = by_label.get(spec['label']) or by_base.get(unit_base_key(spec['label']))
        if unit:
            changed = []
            if unit.label != spec['label']:
                unit.label = spec['label']
                changed.append('label')
            if unit.monthly_rent != spec['monthly_rent']:
                unit.monthly_rent = spec['monthly_rent']
                changed.append('monthly_rent')
            if unit.status != spec['status']:
                unit.status = spec['status']
                changed.append('status')
            if unit.sort_order != spec['sort_order']:
                unit.sort_order = spec['sort_order']
                changed.append('sort_order')
            if changed:
                unit.save(update_fields=changed)
        else:
            unit = PropertyUnit.objects.create(
                property=prop,
                label=spec['label'],
                monthly_rent=spec['monthly_rent'],
                status=spec['status'],
                sort_order=spec['sort_order'],
            )
        kept_ids.append(unit.id)

    # Never hard-delete units — stale IDs break in-flight expense creates (FK errors).
    # Return only catalog / target rows for callers that display units.
    return list(PropertyUnit.objects.filter(id__in=kept_ids).order_by('sort_order', 'id'))


def sync_all_property_units():
    """Sync units for every portfolio-style property (area set or multi-unit)."""
    all_props = list(Property.objects.all())
    synced = 0
    for prop in all_props:
        group_key = get_property_group_key(prop)
        if (
            group_key in PORTFOLIO_UNIT_CATALOG
            or is_portfolio_parent(prop, group_key)
            or (prop.units or 1) > 1
        ):
            sync_units_for_property(prop, all_props)
            synced += 1
    return synced
