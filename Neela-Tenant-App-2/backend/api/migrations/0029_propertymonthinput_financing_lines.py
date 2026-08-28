from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_property_month_input'),
    ]

    operations = [
        migrations.AddField(
            model_name='propertymonthinput',
            name='financing_lines',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
