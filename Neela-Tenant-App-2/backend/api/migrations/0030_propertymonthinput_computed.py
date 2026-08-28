from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_propertymonthinput_financing_lines'),
    ]

    operations = [
        migrations.AddField(
            model_name='propertymonthinput',
            name='computed',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
