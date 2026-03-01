#!/bin/sh

# Substitute PORT in nginx.conf
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Gunicorn in the background
echo "Starting Gunicorn..."
cd /app/backend
python manage.py collectstatic --noinput
python manage.py migrate --noinput
gunicorn automater.wsgi:application --bind 127.0.0.1:8000 --access-logfile - --error-logfile - &

# Check if Gunicorn is running
sleep 2
if ps aux | grep -v grep | grep gunicorn > /dev/null
then
    echo "Gunicorn is running."
else
    echo "Gunicorn failed to start."
    exit 1
fi

# Start Nginx in the foreground
echo "Starting Nginx..."
nginx -t && nginx -g 'daemon off;'
