#!/bin/sh

# Substitute PORT in nginx.conf
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Gunicorn in the background
echo "Starting Gunicorn..."
cd /app/backend
python manage.py collectstatic --noinput
python manage.py migrate --noinput
gunicorn automater.wsgi:application --bind 127.0.0.1:8000 &

# Start Nginx in the foreground
echo "Starting Nginx..."
nginx -g 'daemon off;'
