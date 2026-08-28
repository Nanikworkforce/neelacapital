from django.core.management.base import BaseCommand

from api.models import Property, PropertyUnit

BILLS_INCLUDED = 'Bills included'
BILLS_TENANT = 'You pay bills'
BILLS_TAGS = {BILLS_INCLUDED, BILLS_TENANT, 'Tenant pays bills'}

# Keep existing unit nicknames. These 7 are the Airbnb catalog.
AIRBNB_LISTINGS = [
    {
        'key': 'hideaway',
        'title': 'The Hideaway',
        'address': '7425 Avenue H, Houston, TX',
        'area': 'Avenue H',
        'price': 1200,
        'bills': None,
        'description': (
            'A cozy furnished house on Avenue H — The Hideaway. '
            'Comfortable Houston stay with on-site parking and a simple check-in.'
        ),
    },
    {
        'key': 'little-h',
        'title': 'Little H House',
        'address': '7427 Avenue H, Houston, TX',
        'area': 'Avenue H',
        'price': 1100,
        'bills': None,
        'description': (
            'Little H House on Avenue H. A clean, furnished home for short stays, '
            'with parking and everything you need for a Houston visit.'
        ),
    },
    {
        'key': 'sweet-home',
        'title': 'Sweet Home',
        'address': '7429 Avenue H, Houston, TX',
        'area': 'Avenue H',
        'price': 1100,
        'bills': None,
        'description': (
            'Sweet Home at 7429 Avenue H. A welcoming house stay with parking, '
            'close to East Houston dining and local spots.'
        ),
    },
    {
        'key': 'eado-b',
        'title': 'Eado Escape',
        'address': '6835 Avenue Q, Unit B, Houston, TX',
        'area': 'Avenue Q',
        'price': 1700,
        'bills': BILLS_INCLUDED,
        'description': (
            'Eado Escape — 6835 Avenue Q Unit B. Furnished 2nd-floor stay. '
            'Bills included.'
        ),
    },
    {
        'key': 'eado-d',
        'title': 'Eado Studio',
        'address': '6835 Avenue Q, Unit D, Houston, TX',
        'area': 'Avenue Q',
        'price': 1000,
        'bills': BILLS_INCLUDED,
        'description': (
            'Eado Studio — 6835 Avenue Q Unit D. Downstairs furnished studio. '
            'Bills included.'
        ),
    },
    {
        'key': 'wooding-3',
        'title': 'Wooding Unit 3',
        'address': '903 Wooding Street, Unit 3, Houston, TX',
        'area': 'Wooding St',
        'price': 1000,
        'bills': None,
        'description': (
            'Wooding Unit 3 — a comfortable furnished stay on Wooding Street in Houston.'
        ),
    },
    {
        'key': 'sherman-2',
        'title': 'Urban Nesting',
        'address': '6705 Sherman Street, Unit 2, Houston, TX',
        'area': 'Sherman St',
        'price': 1500,
        'bills': BILLS_TENANT,
        'description': (
            'Urban Nesting — 6705 Sherman Street Unit 2. Furnished duplex stay. '
            'You pay bills.'
        ),
    },
]


def blob(prop):
    return f'{prop.name} {prop.address} {prop.area or ""}'.lower()


def is_unit_row(prop):
    return (prop.units or 1) == 1


def match_listing(prop, key):
    text = blob(prop)
    name = (prop.name or '').lower()
    if key == 'hideaway':
        return '7425' in text or 'hideaway' in name
    if key == 'little-h':
        return '7427' in text or 'little h' in name
    if key == 'sweet-home':
        return '7429' in text or 'sweet home' in name
    if key == 'eado-b':
        return 'eado escape' in name or ('avenue q' in text and 'unit b' in name)
    if key == 'eado-d':
        return 'eado studio' in name or ('avenue q' in text and 'unit d' in name)
    if key == 'wooding-3':
        return ('wooding' in text or 'wooden' in text) and name.strip() == 'unit 3'
    if key == 'sherman-2':
        return 'urban nesting' in name or ('sherman' in text and 'unit 2' in name)
    return False


def set_bills_note(prop, note):
    items = [x for x in (prop.furnishings_breakdown or []) if x not in BILLS_TAGS]
    if note:
        items.append(note)
    prop.furnishings_breakdown = items


class Command(BaseCommand):
    help = 'Sets the Airbnb catalog to the 7 guest stays (keeps long-term portal listings)'

    def handle(self, *args, **options):
        properties = list(Property.objects.all())
        enabled_ids = set()
        updated = []

        for spec in AIRBNB_LISTINGS:
            matches = [p for p in properties if match_listing(p, spec['key'])]
            unit_matches = [p for p in matches if is_unit_row(p)]
            prop = (unit_matches or matches)[0] if (unit_matches or matches) else None
            if not prop:
                self.stdout.write(self.style.WARNING(f'Could not find {spec["title"]}'))
                continue

            prop.address = spec['address']
            prop.city = 'Houston'
            prop.state = 'TX'
            prop.area = spec['area']
            prop.price = spec['price']
            prop.short_stay_nightly_rate = None
            prop.short_stay_enabled = True
            prop.short_stay_listing_title = spec['title']
            prop.short_stay_listing_description = spec['description']
            prop.short_stay_listing_area = spec['area']
            set_bills_note(prop, spec['bills'])
            prop.save()
            enabled_ids.add(prop.id)

            PropertyUnit.objects.filter(label=prop.name).update(monthly_rent=spec['price'])
            updated.append(f'{prop.name} -> {spec["title"]} @ {spec["address"]} ${spec["price"]}')

        disabled = Property.objects.exclude(id__in=enabled_ids).update(short_stay_enabled=False)

        for line in updated:
            self.stdout.write(self.style.SUCCESS(line))
        self.stdout.write(
            self.style.SUCCESS(
                f'Airbnb catalog: {len(enabled_ids)} enabled, {disabled} other properties left on the main portal only.'
            )
        )
