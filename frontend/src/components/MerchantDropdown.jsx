import { useRef, useEffect, useState } from "react";
import { ChevronDown, Check, User } from "lucide-react";

export default function MerchantDropdown({
    merchants,
    selectedId,
    onSelect,
    disabled,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const current = merchants.find((m) => m.id === selectedId);

    useEffect(() => {
        const close = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            )
                setIsOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex flex-col items-start bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all min-w-[200px] text-left hover:border-blue-500 dark:hover:border-blue-400 ${
                    disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                }`}
            >
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">
                    Merchant Account
                </span>
                <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {current?.name}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {merchants.map((m) => (
                            <button
                                key={m.id}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    selectedId === m.id
                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                                onClick={() => {
                                    onSelect(m.id);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <User className="w-3 h-3" />
                                    </div>
                                    {m.name}
                                </div>
                                {selectedId === m.id && (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
