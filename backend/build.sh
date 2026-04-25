#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Automatically seed data (safe to run multiple times)
python seed_data.py

# Automatically schedule the background sweeper
python manage.py shell -c "from payouts.models import Schedule; Schedule.objects.get_or_create(func='payouts.tasks.retry_stuck_payouts', defaults={'schedule_type': Schedule.MINUTES, 'minutes': 1, 'repeats': -1})"