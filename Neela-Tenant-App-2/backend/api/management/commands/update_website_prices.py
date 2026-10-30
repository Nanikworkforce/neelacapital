from decimal import Decimal

from django.core.management.base import BaseCommand

from api.models import Property
from api.property_units_service import sync_units_for_property

# Public listing Property.id → advertised monthly rent.
LISTING_PRICES = {
    # Sherman Street
    3: Decimal("1550.00"),  # Unit 1
    6: Decimal("1550.00"),  # Unit 2 (Urban Nesting)
    7: Decimal("1100.00"),  # Unit 3
    8: Decimal("1100.00"),  # Unit 4
    9: Decimal("1100.00"),  # Unit 5
    10: Decimal("1100.00"),  # Unit 6
    # Avenue Q
    1: Decimal("1750.00"),  # Unit A
    2: Decimal("1700.00"),  # Unit B (Eado Escape)
    4: Decimal("1300.00"),  # Unit C
    5: Decimal("1000.00"),  # Unit D (Eado Studio)
    # Avenue H
    11: Decimal("1300.00"),  # Unit 1 (The Hideaway) 7425
    12: Decimal("1200.00"),  # Unit 2 (Little H House) 7427
    13: Decimal("1200.00"),  # Unit 3 (Sweet Home) 7429
    14: Decimal("850.00"),  # Unit 4 (Erica)
    # 70th Street
    15: Decimal("1100.00"),  # Unit 1
    27: Decimal("1100.00"),  # Unit 2
    28: Decimal("1100.00"),  # Unit 3
    29: Decimal("1100.00"),  # Unit 4
    # Avenue F
    33: Decimal("900.00"),  # Unit 1
    34: Decimal("900.00"),  # Unit 2
    35: Decimal("900.00"),  # Unit 3
    36: Decimal("1200.00"),  # Unit 4
    # Wooding Street
    30: Decimal("1150.00"),  # Unit 1
    31: Decimal("1100.00"),  # Unit 2 (Cozy Suite)
    32: Decimal("1100.00"),  # Unit 3
}


class Command(BaseCommand):
    help = "Update advertised website listing prices and sync unit monthly_rent"

    def handle(self, *args, **options):
        changed = 0
        for prop_id, price in LISTING_PRICES.items():
            prop = Property.objects.filter(pk=prop_id).first()
            if not prop:
                self.stdout.write(self.style.WARNING(f"Missing property id={prop_id}"))
                continue
            if prop.price != price:
                old = prop.price
                prop.price = price
                prop.save(update_fields=["price"])
                changed += 1
                self.stdout.write(
                    f"{prop.id} {prop.name} ({prop.address}): {old} -> {price}"
                )
            else:
                self.stdout.write(f"{prop.id} {prop.name}: already {price}")

        all_props = list(Property.objects.all())
        for prop in all_props:
            sync_units_for_property(prop, all_props)

        self.stdout.write(self.style.SUCCESS(f"Updated {changed} listing prices."))
