#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# THE RESET COMMANDS
python manage.py flush --no-input  # This wipes the DB tables
python seed_data.py                # This puts the original data back