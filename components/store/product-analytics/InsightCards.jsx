"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowUpRight,
    Eye,
    Flame,
    IndianRupee,
    PackageX,
    ShoppingBag,
    Star,
    TrendingDown,
} from "lucide-react";

import InsightProductsDialog from "./InsightProductsDialog";

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },

    visible: (index) => ({
        opacity: 1,
        y: 0,

        transition: {
            duration: 0.4,
            delay: index * 0.07,
            ease: "easeOut",
        },
    }),
};

export default function InsightCards({
    analytics,
}) {
    const [activeInsight, setActiveInsight] =
        useState(null);

    const topSellingProducts =
        analytics?.topProducts || [];

    const mostViewedProducts = useMemo(() => {
        return [...topSellingProducts].sort(
            (a, b) =>
                Number(b.views || 0) -
                Number(a.views || 0)
        );
    }, [topSellingProducts]);

    const bestSeller =
        analytics?.highlights?.bestSeller;

    const mostViewed =
        analytics?.highlights?.mostViewedProduct;

    const lowStockProducts =
        analytics?.insightProducts
            ?.lowStockProducts || [];

    const outOfStockProducts =
        analytics?.insightProducts
            ?.outOfStockProducts || [];

    const highViewsLowSalesProducts =
        analytics?.insightProducts
            ?.highViewsLowSalesProducts || [];

    const lowRatedProducts =
        analytics?.insightProducts
            ?.lowRatedProducts || [];

    const bestSellerProducts = [
        ...topSellingProducts,
    ].sort(
        (a, b) =>
            Number(b.sold || 0) -
            Number(a.sold || 0)
    );

    const bestSellerConversion =
        bestSeller?.views > 0
            ? (
                (Number(bestSeller.sold || 0) /
                    Number(bestSeller.views)) *
                100
            ).toFixed(2)
            : "0.00";

    const mostViewedConversion =
        mostViewed?.views > 0
            ? (
                (Number(mostViewed.sold || 0) /
                    Number(mostViewed.views)) *
                100
            ).toFixed(2)
            : "0.00";

    const potentialRevenueLost =
        outOfStockProducts.reduce(
            (sum, product) =>
                sum +
                Number(product.sellerEarnings || 0),
            0
        );
        
    const lowestStockProduct =
        lowStockProducts.length > 0
            ? [...lowStockProducts].sort(
                (a, b) =>
                    Number(a.stock || 0) -
                    Number(b.stock || 0)
            )[0]
            : null;

    const lowestRatedProduct =
        lowRatedProducts.length > 0
            ? [...lowRatedProducts].sort(
                (a, b) =>
                    Number(a.rating || 0) -
                    Number(b.rating || 0)
            )[0]
            : null;

    const insights = [
        {
            id: "bestSeller",
            title: "Best Seller",
            badge: "Top performer",
            icon: Flame,
            accent: "orange",
            value: bestSeller?.name || "No sales yet",
            primaryLabel: "Units sold",
            primaryValue: bestSeller?.sold || 0,
            secondaryLabel: "Seller Earnings",

            secondaryValue: formatCurrency(
                bestSeller?.sellerEarnings
            ),
            footer: `${bestSellerConversion}% conversion`,
            products: bestSellerProducts,
            dialogTitle:
                "Top Selling Products",
            dialogDescription:
                "Products ranked by their actual sold quantity from completed and recorded order items.",
        },

        {
            id: "mostViewed",
            title: "Most Viewed Product",
            badge: "High visibility",
            icon: Eye,
            accent: "cyan",
            value:
                mostViewed?.name ||
                "No product views yet",
            primaryLabel: "Views",
            primaryValue: mostViewed?.views || 0,
            secondaryLabel: "Units sold",
            secondaryValue:
                mostViewed?.sold || 0,
            footer: `${mostViewedConversion}% conversion`,
            products: mostViewedProducts,
            dialogTitle:
                "Most Viewed Products",
            dialogDescription:
                "Products ranked by total customer views, along with sales and conversion performance.",
        },

        {
            id: "lowStock",
            title: "Low Stock",
            badge: "Needs restocking",
            icon: AlertTriangle,
            accent: "amber",
            value: `${lowStockProducts.length} products`,
            primaryLabel: "Lowest stock",
            primaryValue:
                lowestStockProduct?.stock ?? 0,
            secondaryLabel: "Product",
            secondaryValue:
                lowestStockProduct?.name ||
                "Inventory healthy",
            footer:
                lowStockProducts.length > 0
                    ? "Restock before demand increases"
                    : "All products have sufficient stock",
            products: lowStockProducts,
            dialogTitle:
                "Low Stock Products",
            dialogDescription:
                "Products with remaining inventory between 1 and 10 units.",
        },

        {
            id: "outOfStock",
            title: "Out of Stock",
            badge: "Action required",
            icon: PackageX,
            accent: "red",
            value: `${outOfStockProducts.length} products`,
            primaryLabel: "Unavailable",
            primaryValue:
                outOfStockProducts.length,
            secondaryLabel:
                "Previous revenue",
            secondaryValue: formatCurrency(
                potentialRevenueLost
            ),
            footer:
                outOfStockProducts.length > 0
                    ? "Restock to resume product sales"
                    : "No unavailable products",
            products: outOfStockProducts,
            dialogTitle:
                "Out of Stock Products",
            dialogDescription:
                "Products that currently have zero available inventory.",
        },

        {
            id: "highViewsLowSales",
            title: "High Views, Low Sales",
            badge: "Low conversion",
            icon: TrendingDown,
            accent: "violet",
            value: `${highViewsLowSalesProducts.length} products`,
            primaryLabel: "High interest",
            primaryValue:
                highViewsLowSalesProducts.reduce(
                    (sum, product) =>
                        sum +
                        Number(
                            product.views || 0
                        ),
                    0
                ),
            secondaryLabel: "Units sold",
            secondaryValue:
                highViewsLowSalesProducts.reduce(
                    (sum, product) =>
                        sum +
                        Number(
                            product.sales || 0
                        ),
                    0
                ),
            footer:
                "Review pricing, images and descriptions",
            products:
                highViewsLowSalesProducts,
            dialogTitle:
                "High Views but Low Sales",
            dialogDescription:
                "Products receiving strong customer attention but generating relatively few sales.",
        },

        {
            id: "lowRated",
            title: "Low Rated Products",
            badge: "Needs improvement",
            icon: Star,
            accent: "pink",
            value: `${lowRatedProducts.length} products`,
            primaryLabel: "Lowest rating",
            primaryValue: lowestRatedProduct
                ? `${Number(
                    lowestRatedProduct.rating
                ).toFixed(1)} ★`
                : "—",
            secondaryLabel: "Product",
            secondaryValue:
                lowestRatedProduct?.name ||
                "Ratings healthy",
            footer:
                lowRatedProducts.length > 0
                    ? "Review customer feedback"
                    : "No products below 3.5 rating",
            products: lowRatedProducts,
            dialogTitle:
                "Low Rated Products",
            dialogDescription:
                "Products with an average rating below 3.5 stars that may require quality or listing improvements.",
        },
    ];

    return (
        <>
            <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
                            <ShoppingBag className="h-4 w-4" />
                            Smart Insights
                        </div>

                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                            Products requiring your attention
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Discover sales opportunities,
                            inventory risks and products
                            that need improvement.
                        </p>
                    </div>

                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-400">
                        Click any card to explore
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {insights.map(
                        (insight, index) => (
                            <InsightCard
                                key={insight.id}
                                insight={insight}
                                index={index}
                                onClick={() =>
                                    setActiveInsight(
                                        insight
                                    )
                                }
                            />
                        )
                    )}
                </div>
            </section>

            <InsightProductsDialog
                isOpen={Boolean(activeInsight)}
                onClose={() =>
                    setActiveInsight(null)
                }
                title={
                    activeInsight?.dialogTitle || ""
                }
                description={
                    activeInsight?.dialogDescription ||
                    ""
                }
                type={activeInsight?.id}
                products={
                    activeInsight?.products || []
                }
            />
        </>
    );
}

function InsightCard({
    insight,
    index,
    onClick,
}) {
    const Icon = insight.icon;

    const accentStyles = {
        orange: {
            icon: "border-orange-400/20 bg-orange-500/15 text-orange-300",
            glow: "from-orange-500/20",
            badge: "border-orange-400/20 bg-orange-500/10 text-orange-300",
        },

        cyan: {
            icon: "border-cyan-400/20 bg-cyan-500/15 text-cyan-300",
            glow: "from-cyan-500/20",
            badge: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
        },

        amber: {
            icon: "border-amber-400/20 bg-amber-500/15 text-amber-300",
            glow: "from-amber-500/20",
            badge: "border-amber-400/20 bg-amber-500/10 text-amber-300",
        },

        red: {
            icon: "border-red-400/20 bg-red-500/15 text-red-300",
            glow: "from-red-500/20",
            badge: "border-red-400/20 bg-red-500/10 text-red-300",
        },

        violet: {
            icon: "border-violet-400/20 bg-violet-500/15 text-violet-300",
            glow: "from-violet-500/20",
            badge: "border-violet-400/20 bg-violet-500/10 text-violet-300",
        },

        pink: {
            icon: "border-pink-400/20 bg-pink-500/15 text-pink-300",
            glow: "from-pink-500/20",
            badge: "border-pink-400/20 bg-pink-500/10 text-pink-300",
        },
    };

    const styles =
        accentStyles[insight.accent];

    return (
        <motion.button
            type="button"
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
                y: -5,
                scale: 1.01,
            }}
            whileTap={{
                scale: 0.99,
            }}
            onClick={onClick}
            className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0c1122] p-5 text-left shadow-[0_16px_50px_rgba(0,0,0,0.28)] transition hover:border-white/[0.16]"
        >
            <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${styles.glow} to-transparent opacity-50 transition duration-300 group-hover:opacity-80`}
            />

            <div className="relative">
                <div className="flex items-start justify-between gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${styles.icon}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>

                    <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles.badge}`}
                    >
                        {insight.badge}
                    </span>
                </div>

                <div className="mt-5">
                    <p className="text-sm font-medium text-slate-400">
                        {insight.title}
                    </p>

                    <h3 className="mt-2 truncate text-xl font-semibold text-white">
                        {insight.value}
                    </h3>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-3">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                            {insight.primaryLabel}
                        </p>

                        <p className="mt-1.5 truncate text-sm font-semibold text-white">
                            {insight.primaryValue}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-3">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                            {
                                insight.secondaryLabel
                            }
                        </p>

                        <p className="mt-1.5 truncate text-sm font-semibold text-white">
                            {
                                insight.secondaryValue
                            }
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
                    <p className="truncate text-xs text-slate-500">
                        {insight.footer}
                    </p>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition group-hover:border-violet-400/30 group-hover:bg-violet-500/10 group-hover:text-violet-300">
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </motion.button>
    );
}