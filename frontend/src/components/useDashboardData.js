import { useState, useEffect } from "react";
import { getBalance, getPayouts, getTransactions } from "../api/client";

export function useDashboardData(merchantId) {
    const [data, setData] = useState({
        balancePaise: 0,
        payouts: [],
        transactions: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);

    const fetchData = async (id, isBackground = false) => {
        if (!isBackground) setIsLoading(true);
        else setIsPolling(true);

        try {
            const [balRes, payRes, txnRes] = await Promise.all([
                getBalance(id),
                getPayouts(id),
                getTransactions(id),
            ]);

            setData({
                balancePaise: balRes.data.available_balance_paise || 0,
                payouts: payRes.data || [],
                transactions: txnRes.data || [],
            });
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false);
            setIsPolling(false);
        }
    };

    useEffect(() => {
        fetchData(merchantId, false);
        const interval = setInterval(() => fetchData(merchantId, true), 2000);
        return () => clearInterval(interval);
    }, [merchantId]);

    return {
        ...data,
        isLoading,
        isPolling,
        refresh: () => fetchData(merchantId, true),
    };
}
