import { Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const StatusBadge = ({ status }) => {
    const styles = {
        COMPLETED:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        PROCESSING:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        PENDING:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };

    const Icons = {
        COMPLETED: CheckCircle,
        FAILED: XCircle,
        PROCESSING: RefreshCw,
        PENDING: Clock,
    };
    const Icon = Icons[status] || Clock;

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-max ${styles[status]}`}
        >
            <Icon
                className={`w-3.5 h-3.5 ${
                    status === "PROCESSING" ? "animate-spin" : ""
                }`}
            />
            {status}
        </span>
    );
};

export default function PayoutTable({ payouts, isLoading }) {
    const renderSkeletons = () =>
        [1, 2, 3].map((i) => (
            <tr
                key={i}
                className="animate-pulse border-b border-gray-100 dark:border-gray-800"
            >
                <td className="px-5 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </td>
                <td className="px-5 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </td>
                <td className="px-5 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </td>
                <td className="px-5 py-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                </td>
            </tr>
        ));

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full transition-colors">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Payout History
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
                        <tr>
                            <th className="px-5 py-3">ID</th>
                            <th className="px-5 py-3">Bank Account</th>
                            <th className="px-5 py-3">Amount</th>
                            <th className="px-5 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            renderSkeletons()
                        ) : payouts.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="text-center py-8 text-gray-400 dark:text-gray-500"
                                >
                                    No payouts yet
                                </td>
                            </tr>
                        ) : (
                            payouts.map((p) => (
                                <tr
                                    key={p.id}
                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                                        #{p.id}
                                    </td>
                                    <td className="px-5 py-3">
                                        {p.bank_account_id}
                                    </td>
                                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                                        ₹ {(p.amount_paise / 100).toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <StatusBadge status={p.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
