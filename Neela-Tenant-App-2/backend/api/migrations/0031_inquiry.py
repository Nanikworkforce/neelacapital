from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_propertymonthinput_computed'),
    ]

    operations = [
        migrations.CreateModel(
            name='Inquiry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(blank=True, default='', max_length=150)),
                ('last_name', models.CharField(blank=True, default='', max_length=150)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, default='', max_length=50)),
                ('message', models.TextField()),
                ('source', models.CharField(choices=[('website', 'Main Website'), ('portal', 'Tenant Portal')], default='website', max_length=30)),
                ('status', models.CharField(choices=[('new', 'New'), ('read', 'Read'), ('archived', 'Archived')], default='new', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'inquiries',
                'ordering': ['-created_at'],
            },
        ),
    ]
