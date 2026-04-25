/* eslint-disable no-unused-vars */
export default function PayoutTable({ payouts, isLoading }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 dark:text-gray-100">
                    Payout Activity
                </h2>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/40 text-[11px] uppercase tracking-wider font-bold text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Transaction</th>
                            <th className="px-6 py-4">Destination</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {payouts.map((p) => (
                            <tr
                                key={p.id}
                                className="group hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-colors duration-200"
                            >
                                <td className="px-6 py-4 font-mono text-[11px] text-gray-400 group-hover:text-blue-500 transition-colors">
                                    #{String(p.id).slice(0, 8)}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    {p.bank_account_id}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold">
                                    ₹{(p.amount_paise / 100).toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border ${
                                            p.status === "COMPLETED"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                                : p.status === "FAILED"
                                                ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                                : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                        }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
