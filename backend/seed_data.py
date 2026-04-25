import os
import django
from dotenv import load_dotenv

load_dotenv()

os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'core.settings'
)

django.setup()

from django.contrib.auth import get_user_model
from payouts.models import Merchant, LedgerEntry
from django_q.models import Schedule 

User = get_user_model()


MERCHANTS = [
    {
        'name': 'Aravind',
        'email': 'aravind@example.com'
    },
    {
        'name': 'Yash',
        'email': 'yash@example.com'
    },
    {
        'name': 'Freelancer John',
        'email': 'john@example.com'
    }
]


INITIAL_CREDITS = [
    1000000,
    5000000,
    2500000
]


def seed_merchants():
    # Zip pairs the lists together: (Merchant 1, 100000), (Merchant 2, 50000), etc.
    for merchant_data, starting_credit in zip(MERCHANTS, INITIAL_CREDITS):
        merchant, created = Merchant.objects.get_or_create(
            email=merchant_data['email'],
            defaults={
                'name': merchant_data['name']
            }
        )

        if created:
            print(f'Created merchant: {merchant.name}')

        existing_entries = merchant.ledger_entries.count()

        if existing_entries == 0:
            # Only assign the single, matched credit amount
            LedgerEntry.objects.create(
                merchant=merchant,
                amount_paise=starting_credit,
                entry_type='CREDIT'
            )

            print(
                f'Seeded credit of {starting_credit} for merchant: {merchant.name}'
            )

def create_superuser():
    username = os.getenv(
        'DJANGO_SUPERUSER_USERNAME',
        'admin'
    )

    email = os.getenv(
        'DJANGO_SUPERUSER_EMAIL',
        'admin@example.com'
    )

    password = os.getenv(
        'DJANGO_SUPERUSER_PASSWORD',
        'admin123'
    )

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )

        print(
            f'Superuser created: {username}'
        )
    else:
        print(
            'Superuser already exists'
        )

def setup_cron_jobs():
    # This tells Django-Q to run our sweeper every 1 minute
    schedule, created = Schedule.objects.get_or_create(
        func='payouts.tasks.retry_stuck_payouts',
        defaults={
            'schedule_type': Schedule.MINUTES,
            'minutes': 1,
            'repeats': -1 # -1 means repeat forever
        }
    )
    if created:
        print('Scheduled background sweeper for stuck payouts')
    else:
        print('Background sweeper already scheduled')


def run():
    print('Starting seed process...')

    seed_merchants()
    create_superuser()
    setup_cron_jobs()

    print('Seeding completed successfully')


if __name__ == '__main__':
    run()