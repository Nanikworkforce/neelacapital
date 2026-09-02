"""Role-based helpers for admin vs property manager vs tenant access.

Fail closed: anonymous and unmatched users see nothing.
Managers stay scoped to assigned properties.
Tenants see only their own tenant-linked rows.
"""

from django.db.models import Q

# Operating categories property managers may record (no mortgage / tax / depreciation).
# Routine notices property managers may send (not formal eviction / legal).
MANAGER_NOTICE_TYPES = {
    'Notice of Late Rent',
    'Rent Reminder',
}

MANAGER_TENANT_STATUS_TRANSITIONS = {
    'Applicant': {'Approved', 'Declined'},
    'Approved': {'Active'},
    'Active': {'Past'},
}

MANAGER_EDITABLE_TENANT_FIELDS = {'status', 'lease_start', 'lease_end'}

MANAGER_PAYMENT_METHODS = {'Cash', 'Zelle', 'Check', 'Money Order'}

MANAGER_EDITABLE_PAYMENT_FIELDS = {'status', 'method', 'reference', 'date', 'amount', 'type', 'tenant'}

MANAGER_EXPENSE_CATEGORIES = {
    'utilities',
    'maintenance',
    'cleaning',
    'advertising',
    'legal',
    'supplies',
    'transportation',
    'hoa',
    'other',
}

# Admin-only expense / financing categories.
ADMIN_ONLY_EXPENSE_CATEGORIES = {
    'taxes',
    'insurance',
    'management',
    'bank_charges',
    'mortgage_interest',
    'mortgage_principal',
    'depreciation',
}


def is_admin_user(user):
    return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


def is_property_manager(user):
    if not (
        user
        and user.is_authenticated
        and getattr(user, 'role', None) == 'property_manager'
        and not is_admin_user(user)
    ):
        return False
    profile = getattr(user, 'manager_profile', None)
    if profile is None:
        return False
    return getattr(profile, 'status', None) == 'approved'


def is_staff_portal_user(user):
    """Admin or property manager — office roles, not tenants."""
    return is_admin_user(user) or is_property_manager(user)


def get_user_tenant(user):
    """Resolve the Tenant row for a logged-in resident (email match)."""
    if not user or not user.is_authenticated or not getattr(user, 'email', None):
        return None
    if is_staff_portal_user(user):
        return None
    from .models import Tenant

    return Tenant.objects.filter(email__iexact=user.email.strip()).order_by('-id').first()


def get_manager_property_ids(user):
    if not is_property_manager(user):
        return None
    profile = getattr(user, 'manager_profile', None)
    if not profile:
        return []
    return list(profile.properties.values_list('id', flat=True))


def filter_properties_for_user(queryset, user):
    if is_admin_user(user):
        return queryset
    property_ids = get_manager_property_ids(user)
    if property_ids is None:
        return queryset.none()
    return queryset.filter(id__in=property_ids)


def is_import_placeholder_email(email):
    """Synthetic tenants created by excel import — hide from admin/manager UI."""
    if not email:
        return False
    e = email.lower().strip()
    return e.startswith('excel-import-') and e.endswith('@neela.local')


def exclude_import_placeholder_tenants(queryset):
    return queryset.exclude(email__startswith='excel-import-', email__endswith='@neela.local')


def get_tenant_queryset_for_user(queryset, user):
    """Admins see all tenants (including excel rent-roll rows); others hide import placeholders."""
    qs = queryset
    if not is_admin_user(user):
        qs = exclude_import_placeholder_tenants(qs)
    return filter_tenants_for_user(qs, user)


def _tenant_property_unit_q(properties):
    """Match tenants whose property_unit text references assigned property name/address."""
    q = Q()
    for prop in properties:
        if prop.name:
            q |= Q(property_unit__icontains=prop.name)
        if prop.address:
            q |= Q(property_unit__icontains=prop.address)
    return q


def filter_tenants_for_user(queryset, user):
    """Admin: all. Manager: assigned properties. Tenant: own row. Else: none."""
    if not user or not user.is_authenticated:
        return queryset.none()
    if is_admin_user(user):
        return queryset
    if is_property_manager(user):
        from .models import Property

        props = list(filter_properties_for_user(Property.objects.only('name', 'address'), user))
        if not props:
            return queryset.none()
        unit_q = _tenant_property_unit_q(props)
        return queryset.filter(unit_q) if unit_q else queryset.none()

    email = (getattr(user, 'email', None) or '').strip()
    if not email:
        return queryset.none()
    return queryset.filter(email__iexact=email)


def filter_payments_for_user(queryset, user):
    if not user or not user.is_authenticated:
        return queryset.none()
    if is_admin_user(user):
        return queryset
    from .models import Tenant

    tenant_ids = filter_tenants_for_user(Tenant.objects.all(), user).values_list('id', flat=True)
    return queryset.filter(tenant_id__in=tenant_ids)


def filter_maintenance_for_user(queryset, user):
    if not user or not user.is_authenticated:
        return queryset.none()
    if is_admin_user(user):
        return queryset
    from .models import Tenant

    tenant_ids = filter_tenants_for_user(Tenant.objects.all(), user).values_list('id', flat=True)
    return queryset.filter(tenant_id__in=tenant_ids)


def filter_legal_documents_for_user(queryset, user):
    if not user or not user.is_authenticated:
        return queryset.none()
    if is_admin_user(user):
        return queryset
    if is_property_manager(user):
        return queryset.none()
    from .models import Tenant

    tenant_ids = filter_tenants_for_user(Tenant.objects.all(), user).values_list('id', flat=True)
    return queryset.filter(tenant_id__in=tenant_ids)


def get_valid_signing_token(raw_token):
    """Return a valid (unused, unexpired) LeaseSigningToken or None."""
    if not raw_token:
        return None
    from .models import LeaseSigningToken

    try:
        token = LeaseSigningToken.objects.select_related('legal_document').get(token=raw_token)
    except (LeaseSigningToken.DoesNotExist, ValueError, TypeError):
        return None
    if not token.is_valid:
        return None
    return token


def user_can_access_legal_document(user, legal_doc, raw_token=None):
    """
    Admin, owning tenant (login), or holder of a valid one-time signing link.
    """
    if legal_doc is None:
        return False
    if is_admin_user(user):
        return True
    token = get_valid_signing_token(raw_token)
    if token and token.legal_document_id == legal_doc.id:
        return True
    if not user or not user.is_authenticated:
        return False
    if is_property_manager(user):
        return False
    email = (getattr(user, 'email', None) or '').strip()
    if not email or not legal_doc.tenant_id:
        return False
    from .models import Tenant

    return Tenant.objects.filter(id=legal_doc.tenant_id, email__iexact=email).exists()
