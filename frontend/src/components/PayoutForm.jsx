import { useState } from "react";
import { SendHorizontal } from "lucide-react";

export default function PayoutForm({ onSubmit }) {
    const [amt, setAmt] = useState("");
    const [bank, setBank] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(Math.round(parseFloat(amt) * 100), bank);
        setAmt("");
        setBank("");
        setLoading(false);
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Move Funds
            </h2>
            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Amount (INR)
                    </label>
                    <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amt}
                        onChange={(e) => setAmt(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Recipient Bank ID
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="ACCT_XXXX"
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-mono"
                    />
                </div>
                <button
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        "Authorizing..."
                    ) : (
                        <>
                            <SendHorizontal className="w-5 h-5" /> Initiate
                            Transfer
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
