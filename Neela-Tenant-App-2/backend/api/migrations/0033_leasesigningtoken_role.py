from django.db import migrations, models
import django.db.models.deletion


def forwards_set_tenant_role(apps, schema_editor):
    LeaseSigningToken = apps.get_model('api', 'LeaseSigningToken')
    LeaseSigningToken.objects.filter(role='').update(role='tenant')
    LeaseSigningToken.objects.filter(role__isnull=True).update(role='tenant')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_propertymanager_signup_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='leasesigningtoken',
            name='role',
            field=models.CharField(
                choices=[('tenant', 'Tenant'), ('landlord', 'Landlord')],
                default='tenant',
                max_length=20,
            ),
        ),
        migrations.RunPython(forwards_set_tenant_role, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='leasesigningtoken',
            name='legal_document',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='signing_tokens',
                to='api.legaldocument',
            ),
        ),
        migrations.AddConstraint(
            model_name='leasesigningtoken',
            constraint=models.UniqueConstraint(
                fields=('legal_document', 'role'),
                name='uniq_lease_signing_token_doc_role',
            ),
        ),
    ]
