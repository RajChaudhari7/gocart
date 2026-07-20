"use client";

import {
    BadgeIndianRupee,
    PackageCheck,
    Percent,
    ShoppingBag,
} from "lucide-react";

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(
        Number(value || 0)
    );

export default function TopProductSalesTooltip({
    active,
    payload,
    label,
}) {
    if (!active || !payload?.length) {
        return null;
    }

    const product = payload[0]?.payload || {};

    const unitsSold = Number(
        product.sales ??
        product.totalSales ??
        product.unitsSold ??
        0
    );

    const grossRevenue = Number(
        product.grossRevenue ??
        product.revenue ??
        0
    );

    const commissionAmount = Number(
        product.commissionAmount ??
        product.commission ??
        0
    );

    const sellerEarnings = Number(
        product.sellerEarnings ??
        product.revenue ??
        0
    );

    return (
        <div className="min-w-[260px] rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <p className="mb-4 border-b border-slate-800 pb-3 text-sm font-bold text-white">
                {label || product.name || "Product"}
            </p>

            <div className="space-y-3">
                <TooltipRow
                    icon={ShoppingBag}
                    label="Units Sold"
                    value={formatNumber(unitsSold)}
                    iconClassName="text-violet-400"
                />

                <TooltipRow
                    icon={BadgeIndianRupee}
                    label="Gross Revenue"
                    value={formatCurrency(
                        grossRevenue
                    )}
                    iconClassName="text-blue-400"
                />

                <TooltipRow
                    icon={Percent}
                    label="Commission"
                    value={formatCurrency(
                        commissionAmount
                    )}
                    iconClassName="text-amber-400"
                />

                <div className="border-t border-slate-800 pt-3">
                    <TooltipRow
                        icon={PackageCheck}
                        label="Seller Earnings"
                        value={formatCurrency(
                            sellerEarnings
                        )}
                        iconClassName="text-emerald-400"
                        valueClassName="text-emerald-300"
                    />
                </div>
            </div>
        </div>
    );
}

function TooltipRow({
    icon: Icon,
    label,
    value,
    iconClassName = "",
    valueClassName = "text-white",
}) {
    return (
        <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Icon
                    size={15}
                    className={iconClassName}
                />

                <span>{label}</span>
            </div>

            <span
                className={`text-sm font-bold ${valueClassName}`}
            >
                {value}
            </span>
        </div>
    );
}