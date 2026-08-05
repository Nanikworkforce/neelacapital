"""
Remove leftover PropertyUnit rows that are not in the Master unit catalog.

- Portfolio parents: keep only catalog doors; remap expense FKs then delete orphans.
- Non-parent / single-door catalog properties: delete all unit rows (no unit picker).

Run: python manage.py cleanup_orphan_units
     python manage.py cleanup_orphan_units --dry-run
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import OperatingExpense, Property, PropertyUnit
from api.property_units_service import (
    catalog_units_for_property,
    display_units_for_property,
    get_property_group_key,
    is_portfolio_parent,
    sync_units_for_property,
    unit_base_key,
)


class Command(BaseCommand):
    help = 'Delete leftover PropertyUnit rows outside the canonical portfolio catalog'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true')

    def handle(self, *args, **options):
        dry = options['dry_run']
        deleted = 0
        remapped = 0

        props = list(Property.objects.all().order_by('id'))
        # Ensure parents have catalog rows before we delete orphans / child junk.
        if not dry:
            for prop in props:
                catalog = catalog_units_for_property(prop)
                group_key = get_property_group_key(prop)
                if catalog is not None and is_portfolio_parent(prop, group_key) and catalog:
                    sync_units_for_property(prop)

        for prop in props:
            catalog = catalog_units_for_property(prop)
            if catalog is None:
                continue

            group_key = get_property_group_key(prop)
            parent = is_portfolio_parent(prop, group_key)
            all_units = list(PropertyUnit.objects.filter(property_id=prop.id))
            if not all_units:
                continue

            if not catalog or not parent:
                # Single-door buildings, or unit-level Property rows: no units belong here.
                orphans = all_units
                kept_by_base = {}
                # Prefer remapping onto the portfolio parent catalog units.
                parent_prop = next(
                    (
                        p for p in props
                        if get_property_group_key(p) == group_key and is_portfolio_parent(p, group_key)
                    ),
                    None,
                )
                if parent_prop:
                    for u in display_units_for_property(parent_prop):
                        kept_by_base[unit_base_key(u.label)] = u
            else:
                kept = display_units_for_property(prop, all_units)
                kept_ids = {u.id for u in kept}
                kept_by_base = {unit_base_key(u.label): u for u in kept}
                orphans = [u for u in all_units if u.id not in kept_ids]

            if not orphans:
                continue

            self.stdout.write(
                f"{'[dry-run] ' if dry else ''}{prop.name} (id={prop.id}): "
                f"remove {len(orphans)} leftover unit(s)"
            )
            for u in orphans:
                self.stdout.write(f"  - {u.label!r} (id={u.id})")

            if dry:
                deleted += len(orphans)
                continue

            with transaction.atomic():
                for u in orphans:
                    target = kept_by_base.get(unit_base_key(u.label))
                    qs = OperatingExpense.objects.filter(unit_id=u.id)
                    count = qs.count()
                    if count:
                        if target:
                            qs.update(unit=target)
                            remapped += count
                            self.stdout.write(f"    remapped {count} expense(s) -> {target.label!r}")
                        else:
                            qs.update(unit=None)
                            remapped += count
                            self.stdout.write(f"    cleared unit on {count} expense(s)")
                    u.delete()
                    deleted += 1

        self.stdout.write(self.style.SUCCESS(
            f"{'[dry-run] would remove' if dry else 'Removed'} {deleted} leftover unit(s)"
            + (f"; remapped/cleared {remapped} expense link(s)" if remapped and not dry else '')
        ))
