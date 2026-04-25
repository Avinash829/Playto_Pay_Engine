import { useState } from "react";
import { Send } from "lucide-react";

export default function PayoutForm({ onSubmit }) {
    const [amountRupees, setAmountRupees] = useState("");
    const [bankId, setBankId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amountRupees || !bankId) return;

        setIsSubmitting(true);
        const amountPaise = Math.round(parseFloat(amountRupees) * 100);

        await onSubmit(amountPaise, bankId);

        setAmountRupees("");
        setBankId("");
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full transition-colors">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-500" />{" "}
                Request Payout
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount (₹)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="1"
                        required
                        className="w-full bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="e.g. 5000"
                        value={amountRupees}
                        onChange={(e) => setAmountRupees(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bank Account ID
                    </label>
                    <input
                        type="text"
                        required
                        className="w-full bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="ACCT_XXXX"
                        value={bankId}
                        onChange={(e) => setBankId(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2.5 rounded-lg font-medium text-white transition-colors ${
                        isSubmitting
                            ? "bg-blue-400 dark:bg-blue-500/50 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                    }`}
                >
                    {isSubmitting ? "Processing..." : "Withdraw Funds"}
                </button>
            </form>
        </div>
    );
}
