from django.core.management.base import BaseCommand
from api.models import Tenant, Payment, MaintenanceRequest, Listing
from datetime import date

class Command(BaseCommand):
    help = 'Seeds the database with mock data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Tenants
        t1 = Tenant.objects.create(
            name='Alice Johnson',
            email='alice@example.com',
            phone='(512) 555-0101',
            status='Active',
            property_unit='101 - Sunset Apts',
            lease_start=date(2023, 1, 1),
            lease_end=date(2024, 1, 1),
            rent_amount=1200,
            deposit=1200,
            balance=0,
            credit_score=720,
            background_check_status='Clear'
        )

        t2 = Tenant.objects.create(
            name='Bob Smith',
            email='bob@example.com',
            phone='(512) 555-0102',
            status='Eviction Pending',
            property_unit='102 - Sunset Apts',
            lease_start=date(2023, 3, 1),
            lease_end=date(2024, 3, 1),
            rent_amount=1350,
            deposit=1350,
            balance=2750,
            credit_score=580,
            background_check_status='Flagged'
        )

        t3 = Tenant.objects.create(
            name='Charlie Davis',
            email='charlie@example.com',
            phone='(512) 555-0103',
            status='Applicant',
            property_unit='103 - Sunset Apts',
            lease_start=date(2024, 6, 1),
            lease_end=date(2025, 6, 1),
            rent_amount=1250,
            deposit=1250,
            balance=0,
            credit_score=690,
            background_check_status='Pending',
            application_data={
                "submissionDate": "2024-05-15",
                "employment": {
                    "employer": "Tech Solutions Inc.",
                    "jobTitle": "Software Engineer",
                    "monthlyIncome": 5800,
                    "duration": "2 years"
                },
                "references": [
                    { "name": "Sarah Connor", "relation": "Previous Landlord", "phone": "(512) 555-9999" },
                    { "name": "John Doe", "relation": "Manager", "phone": "(512) 555-8888" }
                ],
                "documents": [
                    { "name": "PayStub_April.pdf", "url": "#", "type": "Income" },
                    { "name": "DriverLicense_Front.jpg", "url": "#", "type": "ID" }
                ],
                "internalNotes": "Met during showing. Seemed very responsible. Verify move-in date flexibility."
            }
        )

        # Payments
        Payment.objects.create(tenant=t1, amount=1200, date=date(2024, 5, 1), status='Paid', type='Rent', method='Stripe (ACH)')
        Payment.objects.create(tenant=t2, amount=1350, date=date(2024, 4, 1), status='Failed', type='Rent', method='Credit Card')
        Payment.objects.create(tenant=t1, amount=1200, date=date(2024, 4, 1), status='Paid', type='Rent', method='Stripe (ACH)')

        # Maintenance
        MaintenanceRequest.objects.create(
            tenant=t1,
            category='Plumbing',
            description='Leaking faucet in the bathroom sink. Water is dripping constantly.',
            status='Open',
            priority='Medium',
            created_at='2024-05-10T10:00:00Z'
        )
        MaintenanceRequest.objects.create(
            tenant=t2,
            category='HVAC',
            description='AC is blowing warm air. Temperature inside is 82 degrees.',
            status='In Progress',
            priority='Emergency',
            created_at='2024-05-12T14:30:00Z'
        )

        # Listings
        Listing.objects.create(
            title='Luxury Downtown Loft',
            address='101 Sunset Blvd, Unit 304, Austin, TX',
            price=1850,
            beds=2,
            baths=2,
            sqft=1100,
            image='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            description='Modern loft in the heart of the city. Features high ceilings, exposed brick, and floor-to-ceiling windows. Includes access to rooftop pool and gym.',
            amenities=['Rooftop Pool', 'Gym Access', 'Covered Parking', 'Pet Friendly']
        )
        Listing.objects.create(
            title='Cozy Suburban Family Home',
            address='452 Oak Lane, Round Rock, TX',
            price=2200,
            beds=3,
            baths=2.5,
            sqft=1800,
            image='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            description='Spacious family home with a large backyard, perfect for entertaining. Recently updated kitchen with stainless steel appliances.',
            amenities=['Large Backyard', '2-Car Garage', 'Fireplace', 'Smart Home Features']
        )
        Listing.objects.create(
            title='Riverside Condo',
            address='888 River Rd, Unit 12, Austin, TX',
            price=1600,
            beds=1,
            baths=1,
            sqft=850,
            image='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            description='Quiet condo overlooking the river. Walking distance to hike and bike trails.',
            amenities=['River View', 'Balcony', 'In-unit Washer/Dryer', 'Reserved Parking']
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))
