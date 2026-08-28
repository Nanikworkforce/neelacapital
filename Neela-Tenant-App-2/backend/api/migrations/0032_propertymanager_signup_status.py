# Generated manually for property manager self-signup

from django.db import migrations, models
from django.utils import timezone


def approve_existing_managers(apps, schema_editor):
    PropertyManagerProfile = apps.get_model('api', 'PropertyManagerProfile')
    User = apps.get_model('accounts', 'User')
    now = timezone.now()
    PropertyManagerProfile.objects.all().update(status='approved', reviewed_at=now)
    User.objects.filter(role='property_manager').update(is_verified=True)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_inquiry'),
    ]

    operations = [
        migrations.AddField(
            model_name='propertymanagerprofile',
            name='middle_name',
            field=models.CharField(blank=True, default='', max_length=150),
        ),
        migrations.AddField(
            model_name='propertymanagerprofile',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('approved', 'Approved'),
                    ('declined', 'Declined'),
                ],
                default='pending',
                help_text='Self-signup starts pending until admin approves.',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='propertymanagerprofile',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(approve_existing_managers, migrations.RunPython.noop),
    ]
