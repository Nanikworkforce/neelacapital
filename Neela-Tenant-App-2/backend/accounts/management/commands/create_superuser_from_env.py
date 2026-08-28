from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = 'Creates a superuser from environment variables'

    def handle(self, *args, **options):
        User = get_user_model()
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        
        if not email or not password:
            self.stdout.write(self.style.WARNING('DJANGO_SUPERUSER_EMAIL or DJANGO_SUPERUSER_PASSWORD not set. Skipping superuser creation.'))
            return

        if not User.objects.filter(email=email).exists():
            # For custom user model where username might be required or auto-generated
            # Adjust fields as necessary based on your User model
            try:
                User.objects.create_superuser(email=email, password=password)
                self.stdout.write(self.style.SUCCESS(f'Superuser {email} created successfully'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating superuser: {e}'))
        else:
            self.stdout.write(self.style.SUCCESS('Superuser already exists'))

