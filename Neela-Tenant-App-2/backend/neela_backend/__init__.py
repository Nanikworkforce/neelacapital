# Celery is optional — emails run in background threads via run_async().
# Keep this import soft so the API boots without Redis/Celery workers.
try:
    from .celery import app as celery_app
except Exception:  # pragma: no cover
    celery_app = None

__all__ = ('celery_app',)
