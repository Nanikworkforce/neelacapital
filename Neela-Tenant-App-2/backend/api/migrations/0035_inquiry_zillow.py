from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0034_document_template_versions_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inquiry',
            name='source',
            field=models.CharField(
                choices=[('website', 'Main Website'), ('portal', 'Tenant Portal'), ('zillow', 'Zillow')],
                default='website',
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name='inquiry',
            name='property_address',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='inquiry',
            name='external_id',
            field=models.CharField(blank=True, db_index=True, default='', max_length=255),
        ),
    ]
