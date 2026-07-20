"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowUpRight,
    Eye,
    Flame,
    IndianRupee,
    Package,
    ShoppingBag,
    Star,
    X,
} from "lucide-react";

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const getStockStyles = (stock) => {
    if (stock === 0) {
        return "border-red-500/20 bg-red-500/10 text-red-300";
    }

    if (stock <= 5) {
        return "border-orange-500/20 bg-orange-500/10 text-orange-300";
    }

    if (stock <= 10) {
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
    }

    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
};

const getIcon = (type) => {
    const iconClassName = "h-5 w-5";

    switch (type) {
        case "bestSeller":
            return <Flame className={iconClassName} />;

        case "mostViewed":
            return <Eye className={iconClassName} />;

        case "lowStock":
            return <AlertTriangle className={iconClassName} />;

        case "outOfStock":
            return <Package className={iconClassName} />;

        case "highViewsLowSales":
            return <ShoppingBag className={iconClassName} />;

        case "lowRated":
            return <Star className={iconClassName} />;

        default:
            return <Package className={iconClassName} />;
    }
};

export default function InsightProductsDialog({
    isOpen,
    onClose,
    title,
    description,
    type,
    products = [],
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
                    onMouseDown={onClose}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.94,
                            y: 30,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.96,
                            y: 20,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                        className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#090d1b] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
                    >
                        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

                        {/* Header */}

                        <div className="relative flex items-start justify-between gap-5 border-b border-white/10 px-6 py-6 sm:px-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15 text-violet-300 shadow-lg shadow-violet-500/10">
                                    {getIcon(type)}
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-white sm:text-2xl">
                                        {title}
                                    </h2>

                                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Products */}

                        <div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
                            {products.length === 0 ? (
                                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.05] text-slate-400">
                                        <Package className="h-8 w-8" />
                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold text-white">
                                        No products found
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                                        There are currently no
                                        products matching this
                                        insight.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {products.map(
                                        (product, index) => {
                                            const conversion =
                                                product.views > 0
                                                    ? (
                                                        (Number(
                                                            product.sales ??
                                                            product.sold ??
                                                            0
                                                        ) /
                                                            Number(
                                                                product.views
                                                            )) *
                                                        100
                                                    ).toFixed(
                                                        2
                                                    )
                                                    : "0.00";

                                            return (
                                                <motion.div
                                                    key={
                                                        product.id ||
                                                        index
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 12,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            index *
                                                            0.035,
                                                    }}
                                                    className="group grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-violet-400/25 hover:bg-white/[0.055] lg:grid-cols-[minmax(260px,1.5fr)_repeat(5,minmax(85px,0.6fr))_42px] lg:items-center"
                                                >
                                                    {/* Product */}

                                                    <div className="flex min-w-0 items-center gap-4">
                                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                                                            {product.image ? (
                                                                <img
                                                                    src={
                                                                        product.image
                                                                    }
                                                                    alt={
                                                                        product.name
                                                                    }
                                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-slate-500">
                                                                    <Package className="h-6 w-6" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-white">
                                                                {
                                                                    product.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                                {product.category ||
                                                                    "Uncategorized"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Metric
                                                        label="Units sold"
                                                        value={
                                                            product.sales ??
                                                            product.sold ??
                                                            0
                                                        }
                                                        icon={
                                                            ShoppingBag
                                                        }
                                                    />

                                                    <Metric
                                                        label="Views"
                                                        value={
                                                            product.views ??
                                                            0
                                                        }
                                                        icon={Eye}
                                                    />

                                                    <Metric
                                                        label="Revenue"
                                                        value={formatCurrency(
                                                            product.revenue
                                                        )}
                                                        icon={
                                                            IndianRupee
                                                        }
                                                    />

                                                    <div>
                                                        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                                                            Stock
                                                        </p>

                                                        <span
                                                            className={`mt-1.5 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStockStyles(
                                                                Number(
                                                                    product.stock ??
                                                                    0
                                                                )
                                                            )}`}
                                                        >
                                                            {Number(
                                                                product.stock ??
                                                                0
                                                            )}{" "}
                                                            left
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                                                            Rating
                                                        </p>

                                                        <div className="mt-1.5 flex items-center gap-1 text-sm font-medium text-white">
                                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

                                                            {Number(
                                                                product.rating ??
                                                                0
                                                            ).toFixed(
                                                                1
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 lg:hidden">
                                                            Conversion
                                                        </p>

                                                        <div className="mt-1 text-sm font-semibold text-cyan-300 lg:text-center">
                                                            {
                                                                conversion
                                                            }
                                                            %
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        title="View product"
                                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                                                    >
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </button>
                                                </motion.div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative flex items-center justify-between border-t border-white/10 bg-black/10 px-6 py-4 sm:px-8">
                            <p className="text-sm text-slate-500">
                                {products.length} product
                                {products.length === 1
                                    ? ""
                                    : "s"}{" "}
                                found
                            </p>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.09]"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Metric({ label, value, icon: Icon }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                {label}
            </p>

            <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-white">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                {value}
            </div>
        </div>
    );
}