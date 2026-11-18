from django.core.management.base import BaseCommand

from api.zillow_inquiries import sync_zillow_inquiries


class Command(BaseCommand):
    help = 'Import Zillow renter inquiries from the inbox into the Inquiries dashboard.'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=14)

    def handle(self, *args, **options):
        added = sync_zillow_inquiries(days=options['days'])
        self.stdout.write(self.style.SUCCESS(f'Imported {added} Zillow inquiries'))
