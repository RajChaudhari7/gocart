"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { motion } from "framer-motion";
import {
    AlertCircle,
    BarChart3,
    Box,
    Eye,
    RefreshCw,
    ShoppingBag,
    Star,
    TrendingUp,
    Trophy,
    Medal,
    Award,
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ReferenceLine,
} from "recharts";

const initialStats = {
    totalProducts: 0,
    totalViews: 0,
    totalSales: 0,
    averageRating: 0,
};

const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(
        Number(value || 0)
    );
};

const kpiConfig = [
    {
        key: "totalProducts",
        title: "Total Products",
        description: "Active products available in your store",
        icon: Box,
        iconBackground:
            "bg-gradient-to-br from-blue-500 to-cyan-500",
        iconShadow: "shadow-blue-500/20",
        glow: "bg-blue-500/10",
        formatter: formatNumber,
    },
    {
        key: "totalViews",
        title: "Total Product Views",
        description: "Combined views across all your products",
        icon: Eye,
        iconBackground:
            "bg-gradient-to-br from-violet-500 to-purple-600",
        iconShadow: "shadow-violet-500/20",
        glow: "bg-violet-500/10",
        formatter: formatNumber,
    },
    {
        key: "totalSales",
        title: "Total Units Sold",
        description: "Total product quantities sold by your store",
        icon: ShoppingBag,
        iconBackground:
            "bg-gradient-to-br from-emerald-500 to-green-600",
        iconShadow: "shadow-emerald-500/20",
        glow: "bg-emerald-500/10",
        formatter: formatNumber,
    },
    {
        key: "averageRating",
        title: "Average Rating",
        description: "Average rating across your rated products",
        icon: Star,
        iconBackground:
            "bg-gradient-to-br from-yellow-400 to-orange-500",
        iconShadow: "shadow-yellow-500/20",
        glow: "bg-yellow-500/10",
        formatter: (value) => Number(value || 0).toFixed(1),
        suffix: "/5",
    },
];

function ProductAnalyticsSkeleton() {
    return (
        <div className="min-h-screen bg-[#020617] p-4 text-white md:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-8">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-800" />

                        <div className="flex-1">
                            <div className="h-9 w-72 max-w-full animate-pulse rounded-xl bg-slate-800" />

                            <div className="mt-3 h-5 w-[520px] max-w-full animate-pulse rounded-lg bg-slate-800/70" />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="mb-5">
                        <div className="h-7 w-52 animate-pulse rounded-lg bg-slate-800" />

                        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-800/70" />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="
                  min-h-[205px]
                  animate-pulse
                  rounded-3xl
                  border
                  border-slate-800
                  bg-slate-900
                  p-6
                "
                            >
                                <div className="flex items-start justify-between">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-800" />

                                    <div className="h-7 w-20 rounded-full bg-slate-800" />
                                </div>

                                <div className="mt-8 h-10 w-28 rounded-lg bg-slate-800" />

                                <div className="mt-3 h-5 w-36 rounded bg-slate-800" />

                                <div className="mt-2 h-4 w-48 max-w-full rounded bg-slate-800/70" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PageHeader({ refreshing, onRefresh }) {
    return (
        <section
            className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-gradient-to-br
        from-slate-900
        via-slate-900
        to-slate-950
        p-6
        shadow-2xl
        shadow-black/20
        md:p-8
      "
        >
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

            <div
                className="
          relative
          flex
          flex-col
          gap-6
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
            >
                <div className="flex items-start gap-4">
                    <div
                        className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-violet-500
              to-indigo-600
              shadow-lg
              shadow-violet-500/20
            "
                    >
                        <BarChart3 size={27} className="text-white" />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                                Product Analytics
                            </h1>

                            <span
                                className="
                  rounded-full
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                  px-3
                  py-1
                  text-xs
                  font-bold
                  text-emerald-300
                "
                            >
                                Live Performance
                            </span>
                        </div>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                            Track individual product sales, product views,
                            ratings, stock and your top-selling products from
                            one dashboard.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={refreshing}
                    onClick={onRefresh}
                    className="
            flex
            w-fit
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-4
            py-2.5
            text-sm
            font-bold
            text-white
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:border-slate-600
            hover:bg-slate-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />

                    {refreshing ? "Refreshing..." : "Refresh Data"}
                </button>
            </div>
        </section>
    );
}

function KpiCard({
    title,
    description,
    value,
    icon: Icon,
    iconBackground,
    iconShadow,
    glow,
    suffix,
    index,
}) {
    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
            }}
            whileHover={{
                y: -5,
            }}
            className="
        group
        relative
        min-h-[205px]
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-gradient-to-br
        from-slate-900
        via-slate-900
        to-slate-950
        p-6
        shadow-xl
        shadow-black/20
        transition-colors
        duration-300
        hover:border-slate-700
      "
        >
            <div
                className={`
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-44
          w-44
          rounded-full
          blur-3xl
          transition-transform
          duration-500
          group-hover:scale-125
          ${glow}
        `}
            />

            <div className="relative flex items-start justify-between gap-4">
                <div
                    className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            shadow-lg
            ${iconBackground}
            ${iconShadow}
          `}
                >
                    <Icon size={25} className="text-white" />
                </div>

                <div
                    className="
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-emerald-500/20
            bg-emerald-500/10
            px-2.5
            py-1
            text-xs
            font-bold
            text-emerald-300
          "
                >
                    <TrendingUp size={13} />

                    Live
                </div>
            </div>

            <div className="relative mt-7">
                <div className="flex items-end gap-1.5">
                    <p className="text-3xl font-black tracking-tight text-white md:text-4xl">
                        {value}
                    </p>

                    {suffix && (
                        <span className="mb-1 text-sm font-bold text-slate-400">
                            {suffix}
                        </span>
                    )}
                </div>

                <h2 className="mt-3 text-sm font-bold text-slate-100">
                    {title}
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                    {description}
                </p>
            </div>
        </motion.article>
    );
}

function ErrorState({ message, onRetry, refreshing }) {
    return (
        <div className="min-h-screen bg-[#020617] p-4 text-white md:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-8">
                <PageHeader
                    refreshing={refreshing}
                    onRefresh={onRetry}
                />

                <div
                    className="
            flex
            min-h-[340px]
            flex-col
            items-center
            justify-center
            rounded-3xl
            border
            border-red-500/20
            bg-slate-900
            px-6
            text-center
            shadow-xl
            shadow-black/20
          "
                >
                    <div
                        className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-red-500/10
            "
                    >
                        <AlertCircle size={30} className="text-red-400" />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-white">
                        Failed to load product analytics
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                        {message}
                    </p>

                    <button
                        type="button"
                        disabled={refreshing}
                        onClick={onRetry}
                        className="
              mt-6
              flex
              items-center
              gap-2
              rounded-xl
              bg-white
              px-5
              py-2.5
              text-sm
              font-bold
              text-slate-950
              transition
              hover:bg-slate-200
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        {refreshing ? "Retrying..." : "Try Again"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ViewsVsSalesTooltip({
    active,
    payload,
    label,
}) {
    if (!active || !payload?.length) {
        return null;
    }

    const viewsEntry = payload.find(
        (item) => item.dataKey === "views"
    );

    const salesEntry = payload.find(
        (item) => item.dataKey === "sales"
    );

    const views = Number(viewsEntry?.value || 0);
    const sales = Number(salesEntry?.value || 0);

    const conversion =
        views > 0
            ? ((sales / views) * 100).toFixed(1)
            : "0.0";

    return (
        <div
            className="
                min-w-[210px]
                rounded-2xl
                border
                border-slate-700
                bg-slate-950/95
                px-4
                py-3
                shadow-2xl
                backdrop-blur-xl
            "
        >
            <p className="max-w-[260px] truncate font-bold text-white">
                {label}
            </p>

            <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-6">
                    <span className="text-sm text-slate-400">
                        Views
                    </span>

                    <span className="font-bold text-sky-400">
                        {views.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-6">
                    <span className="text-sm text-slate-400">
                        Units sold
                    </span>

                    <span className="font-bold text-emerald-400">
                        {sales.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="border-t border-slate-800 pt-2">
                    <div className="flex items-center justify-between gap-6">
                        <span className="text-sm text-slate-400">
                            Conversion
                        </span>

                        <span className="font-bold text-violet-400">
                            {conversion}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ViewsVsSalesChart({
    data = [],
}) {
    const normalizedData = data.map((item) => ({
        ...item,
        views: Number(item.views || 0),
        sales: Number(item.sales || 0),
    }));

    const totalViews = normalizedData.reduce(
        (sum, item) => sum + item.views,
        0
    );

    const totalSales = normalizedData.reduce(
        (sum, item) => sum + item.sales,
        0
    );

    const averageSales =
        normalizedData.length > 0
            ? totalSales / normalizedData.length
            : 0;

    const conversionRate =
        totalViews > 0
            ? (totalSales / totalViews) * 100
            : 0;

    const bestProduct =
        normalizedData.length > 0
            ? normalizedData.reduce(
                (best, current) =>
                    current.sales > best.sales
                        ? current
                        : best,
                normalizedData[0]
            )
            : null;

    if (!normalizedData.length) {
        return (
            <section
                className="
                    rounded-3xl
                    border
                    border-slate-800
                    bg-gradient-to-br
                    from-slate-900
                    via-slate-900
                    to-slate-950
                    p-6
                    shadow-xl
                    shadow-black/20
                "
            >
                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-sky-500
                            to-blue-600
                        "
                    >
                        <TrendingUp
                            size={24}
                            className="text-white"
                        />
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-white">
                            Views vs Sales
                        </h2>

                        <p className="text-sm text-slate-400">
                            Compare customer interest with actual
                            purchases.
                        </p>
                    </div>
                </div>

                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <BarChart3
                            className="mx-auto mb-4 text-slate-600"
                            size={50}
                        />

                        <h3 className="text-lg font-semibold text-white">
                            No Product Activity Yet
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-slate-400">
                            Product views and sales analytics will
                            appear when customers interact with your
                            products.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            className="
                overflow-hidden
                rounded-3xl
                border
                border-slate-800
                bg-gradient-to-br
                from-slate-900
                via-slate-900
                to-slate-950
                p-5
                shadow-xl
                shadow-black/20
                md:p-6
            "
        >
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >
                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-sky-500
                            to-blue-600
                            shadow-lg
                            shadow-sky-500/20
                        "
                    >
                        <TrendingUp
                            size={24}
                            className="text-white"
                        />
                    </div>

                    <div>
                        <h2 className="text-xl font-black text-white md:text-2xl">
                            Views vs Sales
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Compare customer interest with actual
                            purchases.
                        </p>
                    </div>
                </div>

                {bestProduct && (
                    <div
                        className="
                            rounded-2xl
                            border
                            border-emerald-500/20
                            bg-emerald-500/10
                            px-4
                            py-3
                        "
                    >
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">
                            Best seller
                        </p>

                        <p className="mt-1 max-w-[240px] truncate text-sm font-bold text-white">
                            {bestProduct.product}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {bestProduct.sales.toLocaleString(
                                "en-IN"
                            )}{" "}
                            units sold
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Products
                    </p>

                    <p className="mt-2 text-2xl font-black text-white">
                        {normalizedData.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Views
                    </p>

                    <p className="mt-2 text-2xl font-black text-sky-400">
                        {totalViews.toLocaleString("en-IN")}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Units Sold
                    </p>

                    <p className="mt-2 text-2xl font-black text-emerald-400">
                        {totalSales.toLocaleString("en-IN")}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Conversion
                    </p>

                    <p className="mt-2 text-2xl font-black text-violet-400">
                        {conversionRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="mt-7 overflow-x-auto">
                <div
                    className="h-[430px]"
                    style={{
                        minWidth: Math.max(
                            700,
                            normalizedData.length * 145
                        ),
                    }}
                >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <LineChart
                            data={normalizedData}
                            margin={{
                                top: 25,
                                right: 30,
                                left: 5,
                                bottom: 65,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="viewsGradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#38bdf8"
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#3b82f6"
                                    />
                                </linearGradient>

                                <linearGradient
                                    id="salesGradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#34d399"
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#10b981"
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                stroke="#334155"
                                strokeDasharray="3 3"
                                vertical={false}
                                opacity={0.35}
                            />

                            <XAxis
                                dataKey="product"
                                angle={-22}
                                textAnchor="end"
                                height={90}
                                interval={0}
                                axisLine={{
                                    stroke: "#334155",
                                }}
                                tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                                tickFormatter={(value) =>
                                    value.length > 18
                                        ? `${value.slice(0, 18)}...`
                                        : value
                                }
                            />

                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 12,
                                }}
                            />

                            <Tooltip
                                content={
                                    <ViewsVsSalesTooltip />
                                }
                                cursor={{
                                    stroke: "#475569",
                                    strokeDasharray: "4 4",
                                }}
                            />

                            <Legend
                                iconType="circle"
                                iconSize={10}
                                verticalAlign="top"
                                align="right"
                                wrapperStyle={{
                                    color: "#ffffff",
                                    paddingBottom: 20,
                                    fontSize: 13,
                                }}
                            />

                            {averageSales > 0 && (
                                <ReferenceLine
                                    y={averageSales}
                                    stroke="#facc15"
                                    strokeDasharray="5 5"
                                    ifOverflow="extendDomain"
                                    label={{
                                        value: `Average sales: ${averageSales.toFixed(
                                            1
                                        )}`,
                                        fill: "#facc15",
                                        fontSize: 11,
                                        position: "insideTopRight",
                                    }}
                                />
                            )}

                            <Line
                                type="monotone"
                                dataKey="views"
                                name="Views"
                                stroke="url(#viewsGradient)"
                                strokeWidth={3}
                                connectNulls
                                dot={{
                                    r: 4,
                                    fill: "#38bdf8",
                                    stroke: "#ffffff",
                                    strokeWidth: 2,
                                }}
                                activeDot={{
                                    r: 7,
                                    fill: "#38bdf8",
                                    stroke: "#ffffff",
                                    strokeWidth: 3,
                                }}
                                animationDuration={1000}
                            />

                            <Line
                                type="monotone"
                                dataKey="sales"
                                name="Sales"
                                stroke="url(#salesGradient)"
                                strokeWidth={3}
                                connectNulls
                                dot={{
                                    r: 4,
                                    fill: "#10b981",
                                    stroke: "#ffffff",
                                    strokeWidth: 2,
                                }}
                                activeDot={{
                                    r: 7,
                                    fill: "#10b981",
                                    stroke: "#ffffff",
                                    strokeWidth: 3,
                                }}
                                animationDuration={1200}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-5 border-t border-slate-800 pt-4">
                <p className="text-xs leading-5 text-slate-500">
                    Tip: Products with high views but low sales
                    may need better pricing, improved images or a
                    stronger product description.
                </p>
            </div>
        </section>
    );
}

export default function ProductAnalyticsPage() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchAnalytics = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const { data } = await axios.get(
                "/api/store/product-analytics"
            );

            setAnalytics(data);
        } catch (error) {
            console.error(
                "Failed to fetch product analytics:",
                error
            );

            setError(
                error.response?.data?.error ||
                "Unable to load product analytics. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return <ProductAnalyticsSkeleton />;
    }

    if (error && !analytics) {
        return (
            <ErrorState
                message={error}
                refreshing={refreshing}
                onRetry={() => fetchAnalytics(true)}
            />
        );
    }

    const stats = analytics?.stats || initialStats;

    const viewsVsSalesData =
        analytics?.charts?.viewsVsSales || [];

    return (
        <main className="min-h-screen bg-[#020617] p-4 text-white md:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-8">
                <PageHeader
                    refreshing={refreshing}
                    onRefresh={() => fetchAnalytics(true)}
                />

                {error && (
                    <div
                        className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-500/10
              px-4
              py-3
              text-sm
              text-amber-200
            "
                    >
                        <AlertCircle size={18} className="shrink-0" />

                        {error}
                    </div>
                )}

                <section>
                    <div className="mb-5">
                        <h2 className="text-xl font-black text-white md:text-2xl">
                            Performance Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Current performance summary of all active products
                            in your store.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {kpiConfig.map((item, index) => (
                            <KpiCard
                                key={item.key}
                                index={index}
                                title={item.title}
                                description={item.description}
                                value={item.formatter(stats[item.key])}
                                icon={item.icon}
                                iconBackground={item.iconBackground}
                                iconShadow={item.iconShadow}
                                glow={item.glow}
                                suffix={item.suffix}
                            />
                        ))}
                    </div>
                </section>

                <div className="grid gap-6">

                    <ViewsVsSalesChart
                        data={viewsVsSalesData}
                    />

                </div>
                <section
                    className="
        rounded-3xl
        border
        border-slate-800
        bg-gradient-to-br
        from-slate-900
        via-slate-900
        to-slate-950
        shadow-xl
        shadow-black/20
        overflow-hidden
    "
                >

                    <div
                        className="
            flex
            items-center
            justify-between
            border-b
            border-slate-800
            px-6
            py-5
        "
                    >

                        <div>

                            <h2 className="text-2xl font-black text-white">
                                🏆 Top Selling Products
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Products ranked by total units sold.
                            </p>

                        </div>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                            <thead>

                                <tr className="border-b border-slate-800 text-left">

                                    <th className="px-6 py-4 text-slate-400">
                                        Rank
                                    </th>

                                    <th className="px-6 py-4 text-slate-400">
                                        Product
                                    </th>

                                    <th className="px-6 py-4 text-center text-slate-400">
                                        Sold
                                    </th>

                                    <th className="px-6 py-4 text-center text-slate-400">
                                        Views
                                    </th>

                                    <th className="px-6 py-4 text-center text-slate-400">
                                        Rating
                                    </th>

                                    <th className="px-6 py-4 text-center text-slate-400">
                                        Stock
                                    </th>

                                    <th className="px-6 py-4 text-right text-slate-400">
                                        Revenue
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {analytics.topProducts.map((product) => (

                                    <motion.tr

                                        key={product.id}

                                        initial={{
                                            opacity: 0,
                                            y: 15,
                                        }}

                                        whileInView={{
                                            opacity: 1,
                                            y: 0,
                                        }}

                                        viewport={{
                                            once: true,
                                        }}

                                        className="
                            border-b
                            border-slate-800
                            transition
                            hover:bg-slate-800/40
                        "
                                    >

                                        {/* Rank */}

                                        <td className="px-6 py-5">

                                            {product.rank === 1 && (

                                                <div className="flex items-center gap-2 font-bold text-yellow-400">

                                                    <Trophy size={20} />

                                                    #1

                                                </div>

                                            )}

                                            {product.rank === 2 && (

                                                <div className="flex items-center gap-2 font-bold text-slate-300">

                                                    <Medal size={20} />

                                                    #2

                                                </div>

                                            )}

                                            {product.rank === 3 && (

                                                <div className="flex items-center gap-2 font-bold text-orange-400">

                                                    <Award size={20} />

                                                    #3

                                                </div>

                                            )}

                                            {product.rank > 3 && (

                                                <span className="font-bold text-white">

                                                    #{product.rank}

                                                </span>

                                            )}

                                        </td>

                                        {/* Product */}

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-4">

                                                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-700">

                                                    <Image
                                                        src={
                                                            product.image ||
                                                            "/placeholder.png"
                                                        }
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />

                                                </div>

                                                <div>

                                                    <h3 className="font-semibold text-white">

                                                        {product.name}

                                                    </h3>

                                                    <p className="text-sm text-slate-400">

                                                        {product.category}

                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* Sold */}

                                        <td className="px-6 py-5 text-center">

                                            <div className="font-bold text-emerald-400 text-lg">

                                                {product.sold}

                                            </div>

                                            <p className="text-xs text-slate-500">

                                                Units

                                            </p>

                                        </td>

                                        {/* Views */}

                                        <td className="px-6 py-5 text-center">

                                            <div className="font-semibold text-white">

                                                {product.views.toLocaleString()}

                                            </div>

                                        </td>

                                        {/* Rating */}

                                        <td className="px-6 py-5 text-center">

                                            <div className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1">

                                                <Star
                                                    size={14}
                                                    className="fill-yellow-400 text-yellow-400"
                                                />

                                                <span className="font-semibold text-yellow-300">

                                                    {product.rating}

                                                </span>

                                            </div>

                                        </td>

                                        {/* Stock */}

                                        <td className="px-6 py-5 text-center">

                                            {product.stock === 0 ? (

                                                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">

                                                    Out of Stock

                                                </span>

                                            ) : product.stock <= 10 ? (

                                                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">

                                                    {product.stock} Left

                                                </span>

                                            ) : (

                                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">

                                                    {product.stock} In Stock

                                                </span>

                                            )}

                                        </td>

                                        {/* Revenue */}

                                        <td className="px-6 py-5 text-right">

                                            <div className="text-lg font-bold text-emerald-400">

                                                ₹{product.revenue.toLocaleString()}

                                            </div>

                                        </td>

                                    </motion.tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </section>
            </div>
        </main>
    );
}