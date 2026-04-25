import {
    Wallet,
    IndianRupee,
    AlertCircle,
    CheckCircle,
    XCircle,
} from "lucide-react";

export default function StatsGrid({ balancePaise, payouts, isLoading }) {
    const formatRupees = (paise) => (paise / 100).toFixed(2);

    const heldBalancePaise = payouts
        .filter((p) => ["PENDING", "PROCESSING"].includes(p.status))
        .reduce((sum, p) => sum + p.amount_paise, 0);

    const completedCount = payouts.filter(
        (p) => p.status === "COMPLETED"
    ).length;
    const failedCount = payouts.filter((p) => p.status === "FAILED").length;

    const renderValue = (value, isCurrency = false) => {
        if (isLoading) {
            return (
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-1"></div>
            );
        }
        return (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center mt-1">
                {isCurrency && <IndianRupee className="w-5 h-5 mr-1" />}
                {value}
            </h2>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Available Balance
                </p>
                {renderValue(formatRupees(balancePaise), true)}
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" /> Held
                    Balance
                </p>
                {renderValue(formatRupees(heldBalancePaise), true)}
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Completed
                    Payouts
                </p>
                {renderValue(completedCount)}
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" /> Failed Payouts
                </p>
                {renderValue(failedCount)}
            </div>
        </div>
    );
}
