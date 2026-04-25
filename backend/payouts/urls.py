from django.urls import path
from .views import (
    PayoutListCreateView,
    MerchantBalanceView,
    MerchantTransactionsView
)

urlpatterns = [
    path(
        'merchants/<int:merchant_id>/balance/',
        MerchantBalanceView.as_view(),
        name='merchant-balance'
    ),
    path(
        'merchants/<int:merchant_id>/payouts/',
        PayoutListCreateView.as_view(),
        name='merchant-payouts'
    ),
    path(
        'merchants/<int:merchant_id>/transactions/',
        MerchantTransactionsView.as_view(),
        name='merchant-transactions'
    ),
]