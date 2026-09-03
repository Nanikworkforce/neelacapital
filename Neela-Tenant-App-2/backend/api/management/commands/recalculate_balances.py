from django.core.management.base import BaseCommand

from api.models import Tenant


class Command(BaseCommand):
    help = 'Recalculate all tenant balances (Paid collections only; Pending proof ignored).'

    def handle(self, *args, **options):
        updated = 0
        for tenant in Tenant.objects.all().iterator():
            before = tenant.balance
            tenant.update_balance()
            tenant.refresh_from_db()
            if before != tenant.balance:
                updated += 1
                self.stdout.write(f'  {tenant.id} {tenant.name}: {before} -> {tenant.balance}')
        self.stdout.write(self.style.SUCCESS(f'Recalculated balances ({updated} changed).'))
