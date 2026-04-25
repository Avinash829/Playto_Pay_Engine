import {
    Wallet,
    ArrowUpCircle,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

export default function StatsGrid({ balancePaise, payouts, isLoading }) {
    const format = (p) =>
        (p / 100).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
        });

    const held = payouts
        .filter((p) => ["PENDING", "PROCESSING"].includes(p.status))
        .reduce((sum, p) => sum + p.amount_paise, 0);

    const stats = [
        {
            label: "Available",
            val: format(balancePaise),
            icon: Wallet,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-500/10",
        },
        {
            label: "Processing",
            val: format(held),
            icon: ArrowUpCircle,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-500/10",
        },
        {
            label: "Successful",
            val: payouts.filter((p) => p.status === "COMPLETED").length,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
        },
        {
            label: "Failed",
            val: payouts.filter((p) => p.status === "FAILED").length,
            icon: AlertTriangle,
            color: "text-rose-600",
            bg: "bg-rose-50 dark:bg-rose-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
                <div
                    key={i}
                    className="group bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {s.label}
                        </span>
                    </div>
                    {isLoading ? (
                        <div className="h-8 w-3/4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold tracking-tight">
                            {s.val}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
