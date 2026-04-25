import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { createPayout } from "../api/client";
import { useDashboardData } from "../components/useDashboardData";
import StatsGrid from "../components/StatsGrid";
import PayoutForm from "../components/PayoutForm";
import PayoutTable from "../components/PayoutTable";
import LedgerTable from "../components/LedgerTable";
import MerchantDropdown from "../components/MerchantDropdown";
import { Activity, Sun, Moon } from "lucide-react";

const MERCHANTS = [
    { id: 1, name: "Glen" },
    { id: 2, name: "Yash" },
    { id: 3, name: "John" },
];

export default function Dashboard() {
    const [merchantId, setMerchantId] = useState(1);
    const [isDark, setIsDark] = useState(
        () => localStorage.getItem("theme") === "dark"
    );

    const { balancePaise, payouts, transactions, isLoading, refresh } =
        useDashboardData(merchantId);

    useEffect(() => {
        const root = document.documentElement;
        isDark ? root.classList.add("dark") : root.classList.remove("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    const handleCreatePayout = async (amountPaise, bankId) => {
        try {
            await createPayout(
                merchantId,
                { amount_paise: amountPaise, bank_account_id: bankId },
                uuidv4()
            );
            refresh();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create payout");
        }
    };

    return (
        <div className="min-h-screen transition-colors duration-500 bg-[#f9fafb] text-[#111827] dark:bg-[#030712] dark:text-[#f9fafb] p-4 md:p-8 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-gray-200/60 dark:border-gray-800/60 pb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Playto
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            Real-time Treasury & Payouts
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-blue-600" />
                            )}
                        </button>

                        <MerchantDropdown
                            merchants={MERCHANTS}
                            selectedId={merchantId}
                            onSelect={setMerchantId}
                            disabled={isLoading}
                        />
                    </div>
                </header>

                <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <StatsGrid
                        balancePaise={balancePaise}
                        payouts={payouts}
                        isLoading={isLoading}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <section className="lg:col-span-4">
                            <PayoutForm onSubmit={handleCreatePayout} />
                        </section>
                        <section className="lg:col-span-8">
                            <PayoutTable
                                payouts={payouts}
                                isLoading={isLoading}
                            />
                        </section>
                    </div>

                    <LedgerTable
                        transactions={transactions}
                        isLoading={isLoading}
                    />
                </main>
            </div>
        </div>
    );
}
