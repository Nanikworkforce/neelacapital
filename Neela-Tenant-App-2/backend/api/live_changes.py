import logging

from django.db.models import F
from django.db.models.signals import post_delete, post_save

logger = logging.getLogger(__name__)

# model name -> area the portal refreshes
MODEL_AREAS = {
    'Tenant': 'tenants',
    'Payment': 'payments',
    'MaintenanceRequest': 'maintenance',
    'Inquiry': 'inquiries',
    'LegalDocument': 'legal',
    'Property': 'properties',
    'PropertyUnit': 'properties',
    'OperatingExpense': 'expenses',
    'ShortStayBooking': 'short_stays',
    'ShortStayBlockedDate': 'short_stays',
}


def bump(area: str) -> None:
    from .models import ChangeStamp

    try:
        if not ChangeStamp.objects.filter(area=area).update(version=F('version') + 1):
            stamp, created = ChangeStamp.objects.get_or_create(area=area, defaults={'version': 1})
            if not created:
                ChangeStamp.objects.filter(pk=stamp.pk).update(version=F('version') + 1)
    except Exception as e:
        # Never let change tracking break the save that triggered it.
        logger.warning(f'Could not bump change stamp for {area}: {e}')


def current_versions() -> dict:
    from .models import ChangeStamp

    return dict(ChangeStamp.objects.values_list('area', 'version'))


def _on_change(sender, **kwargs):
    area = MODEL_AREAS.get(sender.__name__)
    if area:
        bump(area)


def connect_signals() -> None:
    from django.apps import apps

    for model_name in MODEL_AREAS:
        try:
            model = apps.get_model('api', model_name)
        except LookupError:
            continue
        post_save.connect(_on_change, sender=model, dispatch_uid=f'live_changes_save_{model_name}')
        post_delete.connect(_on_change, sender=model, dispatch_uid=f'live_changes_delete_{model_name}')
