from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, ResetPassword


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin interface for User model with email-based authentication."""
    
    # Fields to display in the list view
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_verified', 'is_active', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined', 'last_login')
    
    # Override to use email instead of username
    def get_fieldsets(self, request, obj=None):
        if not obj:
            # Add form (creating new user)
            return (
                (None, {
                    'classes': ('wide',),
                    'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_superuser', 'is_verified'),
                }),
            )
        else:
            # Edit form (updating existing user)
            return (
                (None, {'fields': ('email', 'password')}),
                (_('Personal info'), {'fields': ('first_name', 'last_name')}),
                (_('Permissions'), {
                    'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
                }),
                (_('Verification'), {
                    'fields': ('is_verified',),
                }),
                (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
            )
    
    # Fieldsets for the add form (when creating new user)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_superuser', 'is_verified'),
        }),
    )
    
    # Use email as the username field
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Remove username field if it exists (shouldn't be there, but just in case)
        if 'username' in form.base_fields:
            del form.base_fields['username']
        return form


@admin.register(ResetPassword)
class ResetPasswordAdmin(admin.ModelAdmin):
    """Admin interface for ResetPassword model."""
    list_display = ('user', 'code', 'created_at', 'is_valid')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'code')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
