"""
Django management command to create an admin user.

Usage:
    python manage.py create_admin --email admin@example.com --password securepassword --first-name Admin --last-name User
"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates a superuser/admin account with verified status'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            required=True,
            help='Email address for the admin user'
        )
        parser.add_argument(
            '--password',
            type=str,
            required=True,
            help='Password for the admin user (min 8 characters)'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            required=True,
            help='First name for the admin user'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            required=True,
            help='Last name for the admin user'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        # Validate email format
        try:
            validate_email(email)
        except ValidationError:
            raise CommandError(f'Invalid email format: {email}')

        # Validate password length
        if len(password) < 8:
            raise CommandError('Password must be at least 8 characters long')

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            raise CommandError(f'User with email {email} already exists')

        # Create admin user
        try:
            user = User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_verified=True,  # Admin users are verified by default
                is_active=True,
                is_staff=True,
                is_superuser=True,
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created admin user: {email}'
                )
            )
        except Exception as e:
            raise CommandError(f'Error creating admin user: {str(e)}')

