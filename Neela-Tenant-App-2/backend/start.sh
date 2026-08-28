#!/bin/bash

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if env vars are set
echo "Checking for superuser creation..."
python manage.py create_superuser_from_env

# Start Celery worker in the background
echo "Starting Celery worker..."
celery -A neela_backend worker --loglevel=info --concurrency=2 &

# Start Gunicorn
echo "Starting Gunicorn..."
gunicorn neela_backend.wsgi:application --bind 0.0.0.0:$PORT
