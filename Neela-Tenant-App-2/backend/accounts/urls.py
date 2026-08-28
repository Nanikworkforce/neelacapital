"""
URL configuration for accounts app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('verify-reset-token/', views.verify_reset_token, name='verify_reset_token'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('login/', views.login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

