#!/bin/sh
set -e

python manage.py migrate --noinput

if [ "${DJANGO_SEED_DEMO_DATA:-false}" = "true" ]; then
    python manage.py seed_demo_data
fi

exec "$@"