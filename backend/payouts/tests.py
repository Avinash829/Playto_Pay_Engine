import uuid
import threading
from django.test import TransactionTestCase
from django.db import connection
from payouts.models import Merchant, Payout, LedgerEntry
from payouts.services import create_payout, get_merchant_available_balance

class PayoutEngineTests(TransactionTestCase):
    def setUp(self):
        # Setup a merchant with a 100 Rupee (10000 paise) balance
        self.merchant = Merchant.objects.create(name="Test Merchant", email="test@example.com")
        LedgerEntry.objects.create(
            merchant=self.merchant,
            amount_paise=10000,
            entry_type='CREDIT'
        )

    def test_idempotency_exact_response(self):
        """
        Test that two requests with the same Idempotency Key only create ONE payout
        and return the exact same response.
        """
        idemp_key = uuid.uuid4()
        
        # First Request
        payout1, code1, response1 = create_payout(
            merchant_id=self.merchant.id,
            amount_paise=6000,
            bank_account_id="BANK_123",
            idempotency_key=idemp_key
        )
        
        # Second Request (Identical Key)
        payout2, code2, response2 = create_payout(
            merchant_id=self.merchant.id,
            amount_paise=6000,
            bank_account_id="BANK_123",
            idempotency_key=idemp_key
        )

        # Assertions
        self.assertEqual(code1, 201)
        self.assertEqual(code2, 201)
        self.assertEqual(response1, response2)
        
        # Ensure only 1 payout was actually created in the DB
        self.assertEqual(Payout.objects.count(), 1)
        
        # Ensure balance was only deducted once (10000 - 6000 = 4000)
        self.assertEqual(get_merchant_available_balance(self.merchant.id), 4000)

    def test_concurrency_overdraw_protection(self):
        """
        Test that two simultaneous 60 Rupee withdrawal requests on a 100 Rupee balance
        result in one success and one failure (no negative balance).
        """
        results = []
        
        def make_concurrent_request(key):
            try:
                # We must close old connections in threads to avoid SQLite/Postgres thread issues
                connection.close() 
                _, code, _ = create_payout(
                    merchant_id=self.merchant.id,
                    amount_paise=6000, # 60 Rupees
                    bank_account_id="BANK_123",
                    idempotency_key=key
                )
                results.append(code)
            finally:
                connection.close()

        # Fire two simultaneous threads
        t1 = threading.Thread(target=make_concurrent_request, args=(uuid.uuid4(),))
        t2 = threading.Thread(target=make_concurrent_request, args=(uuid.uuid4(),))
        
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        # One should succeed (201), one should fail due to insufficient funds (400)
        self.assertIn(201, results)
        self.assertIn(400, results)
        
        # Balance should be exactly 40 Rupees (4000 paise) left
        self.assertEqual(get_merchant_available_balance(self.merchant.id), 4000)