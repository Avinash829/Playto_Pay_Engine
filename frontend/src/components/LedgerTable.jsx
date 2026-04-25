import {
    FileText,
    ArrowDownRight,
    ArrowUpRight,
    Lock,
    CornerUpLeft,
} from "lucide-react";

const EntryIcon = ({ type }) => {
    switch (type) {
        case "CREDIT":
            return (
                <ArrowDownRight className="w-4 h-4 text-green-500 dark:text-green-400" />
            );
        case "DEBIT":
            return (
                <ArrowUpRight className="w-4 h-4 text-red-500 dark:text-red-400" />
            );
        case "HOLD":
            return (
                <Lock className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            );
        case "REFUND":
            return (
                <CornerUpLeft className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            );
        default:
            return (
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            );
    }
};

export default function LedgerTable({ transactions, isLoading }) {
    const renderSkeletons = () =>
        [1, 2, 3, 4].map((i) => (
            <li
                key={i}
                className="p-4 flex items-center justify-between animate-pulse border-b border-gray-100 dark:border-gray-800"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div>
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </li>
        ));

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mt-6 overflow-hidden transition-colors">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />{" "}
                    Immutable Ledger
                </h2>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto">
                {isLoading ? (
                    renderSkeletons()
                ) : transactions.length === 0 ? (
                    <li className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                        No transactions yet
                    </li>
                ) : (
                    transactions.map((t) => (
                        <li
                            key={t.id}
                            className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <EntryIcon type={t.entry_type} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                        {t.entry_type}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                        {new Date(
                                            t.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span
                                    className={`font-bold ${
                                        ["DEBIT", "HOLD"].includes(t.entry_type)
                                            ? "text-gray-900 dark:text-gray-100"
                                            : "text-green-600 dark:text-green-400"
                                    }`}
                                >
                                    {["DEBIT", "HOLD"].includes(t.entry_type)
                                        ? "-"
                                        : "+"}{" "}
                                    ₹ {(t.amount_paise / 100).toFixed(2)}
                                </span>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
