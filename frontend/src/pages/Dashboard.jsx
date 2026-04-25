/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    getBalance,
    getPayouts,
    getTransactions,
    createPayout,
} from "../api/client";

import StatsGrid from "../components/StatsGrid";
import PayoutForm from "../components/PayoutForm";
import PayoutTable from "../components/PayoutTable";
import LedgerTable from "../components/LedgerTable";
import { Activity, ChevronDown, Sun, Moon } from "lucide-react";

const MERCHANTS = [
    { id: 1, name: "Aravind" },
    { id: 2, name: "Yash" },
    { id: 3, name: "Freelancer John" },
];

export default function Dashboard() {
    const [merchantId, setMerchantId] = useState(1);

    // Core Data States
    const [balancePaise, setBalancePaise] = useState(0);
    const [payouts, setPayouts] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // UX States
    const [isLoading, setIsLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);

    // Dark Mode State (Checks localStorage first, defaults to false)
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") === "dark";
        }
        return false;
    });

    // Apply Dark Mode class to the HTML document body
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    const fetchData = async (id, isBackgroundPoll = false) => {
        if (!isBackgroundPoll) setIsLoading(true);
        else setIsPolling(true);

        try {
            const [balRes, payRes, txnRes] = await Promise.all([
                getBalance(id),
                getPayouts(id),
                getTransactions(id),
            ]);

            setBalancePaise(balRes.data.available_balance_paise || 0);
            setPayouts(payRes.data || []);
            setTransactions(txnRes.data || []);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setIsLoading(false);
            setIsPolling(false);
        }
    };

    useEffect(() => {
        setBalancePaise(0);
        setPayouts([]);
        setTransactions([]);

        fetchData(merchantId, false);

        const interval = setInterval(() => {
            fetchData(merchantId, true);
        }, 2000);

        return () => clearInterval(interval);
    }, [merchantId]);

    const handleCreatePayout = async (amountPaise, bankId) => {
        const idempotencyKey = uuidv4();
        try {
            await createPayout(
                merchantId,
                { amount_paise: amountPaise, bank_account_id: bankId },
                idempotencyKey
            );
            fetchData(merchantId, true);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create payout");
        }
    };

    return (
        <div className="min-h-screen transition-colors duration-200 bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 p-4 md:p-8 font-sans">
            {/* Notice the dark: classes added to the background and text here */}
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                            Playto Pay Engine
                            {isPolling && !isLoading && (
                                <Activity
                                    className="w-4 h-4 text-green-500 animate-pulse"
                                    title="Live connection active"
                                />
                            )}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Cross-border payout infrastructure
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow transition-all text-gray-500 dark:text-gray-400"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Merchant Dropdown (Updated with Dark Mode classes) */}
                        <div className="relative flex items-center bg-white dark:bg-gray-900 pl-3 pr-2 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all group focus-within:ring-4 focus-within:ring-blue-50 dark:focus-within:ring-blue-900/30 cursor-pointer">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider select-none mr-2">
                                Merchant
                            </span>
                            <div className="relative flex items-center">
                                <select
                                    className="appearance-none bg-transparent border-none text-sm font-bold text-gray-900 dark:text-white pr-6 py-1 focus:ring-0 cursor-pointer outline-none w-full z-10"
                                    value={merchantId}
                                    onChange={(e) =>
                                        setMerchantId(Number(e.target.value))
                                    }
                                    disabled={isLoading}
                                >
                                    {MERCHANTS.map((m) => (
                                        <option
                                            key={m.id}
                                            value={m.id}
                                            className="dark:bg-gray-900"
                                        >
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-0 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="animate-in fade-in duration-500">
                    <StatsGrid
                        balancePaise={balancePaise}
                        payouts={payouts}
                        isLoading={isLoading}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="col-span-1">
                            <PayoutForm onSubmit={handleCreatePayout} />
                        </div>
                        <div className="col-span-1 lg:col-span-2">
                            <PayoutTable
                                payouts={payouts}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>

                    <LedgerTable
                        transactions={transactions}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
