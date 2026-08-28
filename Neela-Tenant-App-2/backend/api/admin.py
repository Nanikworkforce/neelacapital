from django.contrib import admin
from .models import Listing, Property, LeaseTemplate, Tenant, Payment, MaintenanceRequest, LegalDocument
# Register your models here.
admin.site.register(Listing)
admin.site.register(Property)
admin.site.register(LeaseTemplate)
admin.site.register(Tenant)
admin.site.register(Payment)
admin.site.register(MaintenanceRequest)
admin.site.register(LegalDocument)