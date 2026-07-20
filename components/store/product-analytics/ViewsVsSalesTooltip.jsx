"use client";

import { Eye, ShoppingBag, TrendingUp } from "lucide-react";

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(
        Number(value || 0)
    );

export default function ViewsVsSalesTooltip({
    active,
    payload,
    label,
}) {
    if (!active || !payload?.length) {
        return null;
    }

    const views =
        Number(
            payload.find(
                (item) => item.dataKey === "views"
            )?.value
        ) || 0;

    const sales =
        Number(
            payload.find(
                (item) => item.dataKey === "sales"
            )?.value
        ) || 0;

    const conversionRate =
        views > 0
            ? ((sales / views) * 100).toFixed(2)
            : "0.00";

    return (
        <div className="min-w-[230px] rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <p className="mb-4 border-b border-slate-800 pb-3 text-sm font-bold text-white">
                {label || "Product"}
            </p>

            <div className="space-y-3">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Eye
                            size={15}
                            className="text-violet-400"
                        />

                        Views
                    </div>

                    <span className="text-sm font-bold text-white">
                        {formatNumber(views)}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <ShoppingBag
                            size={15}
                            className="text-emerald-400"
                        />

                        Units Sold
                    </div>

                    <span className="text-sm font-bold text-white">
                        {formatNumber(sales)}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-6 border-t border-slate-800 pt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <TrendingUp
                            size={15}
                            className="text-cyan-400"
                        />

                        Conversion
                    </div>

                    <span className="text-sm font-bold text-cyan-300">
                        {conversionRate}%
                    </span>
                </div>
            </div>
        </div>
    );
}