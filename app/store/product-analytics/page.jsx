"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
    AlertCircle,
    BarChart3,
    Box,
    Eye,
    RefreshCw,
    ShoppingCart,
    Star,
    TrendingUp,
} from "lucide-react";

const initialStats = {
    totalProducts: 0,
    totalViews: 0,
    totalSales: 0,
    averageRating: 0,
};

const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const kpiConfig = [
    {
        key: "totalProducts",
        title: "Total Products",
        description: "Active products in your store",
        icon: Box,
        iconClassName:
            "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/20",
        glowClassName: "bg-blue-500/10",
        valueFormatter: formatNumber,
    },
    {
        key: "totalViews",
        title: "Total Views",
        description: "Combined product page views",
        icon: Eye,
        iconClassName:
            "bg-gradient-to-br from-violet-500 to-purple-500 shadow-violet-500/20",
        glowClassName: "bg-violet-500/10",
        valueFormatter: formatNumber,
    },
    {
        key: "totalSales",
        title: "Total Sales",
        description: "Products sold across your store",
        icon: ShoppingCart,
        iconClassName:
            "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/20",
        glowClassName: "bg-emerald-500/10",
        valueFormatter: formatNumber,
    },
    {
        key: "averageRating",
        title: "Average Rating",
        description: "Average rating of rated products",
        icon: Star,
        iconClassName:
            "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/20",
        glowClassName: "bg-yellow-500/10",
        valueFormatter: (value) => Number(value || 0).toFixed(1),
        suffix: "/5",
    },
];

function ProductAnalyticsSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <div className="h-10 w-72 animate-pulse rounded-xl bg-white/10" />

                <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded-lg bg-white/5" />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="
              min-h-[190px]
              animate-pulse
              rounded-3xl
              border
              border-white/10
              bg-white/5
              p-6
            "
                    >
                        <div className="flex items-start justify-between">
                            <div className="h-14 w-14 rounded-2xl bg-white/10" />

                            <div className="h-7 w-20 rounded-full bg-white/5" />
                        </div>

                        <div className="mt-8 h-9 w-28 rounded-lg bg-white/10" />

                        <div className="mt-3 h-4 w-44 rounded bg-white/5" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function KpiCard({
    title,
    description,
    value,
    icon: Icon,
    iconClassName,
    glowClassName,
    suffix,
    index,
}) {
    return (
        <motion.div
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
        min-h-[190px]
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-gradient-to-br
        from-white/[0.08]
        via-white/[0.04]
        to-transparent
        p-6
        shadow-xl
        shadow-black/10
        backdrop-blur-xl
        transition-colors
        duration-300
        hover:border-white/20
      "
        >
            <div
                className={`
          pointer-events-none
          absolute
          -right-14
          -top-14
          h-40
          w-40
          rounded-full
          blur-3xl
          transition-transform
          duration-500
          group-hover:scale-125
          ${glowClassName}
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
            ${iconClassName}
          `}
                >
                    <Icon
                        size={25}
                        className="text-white"
                    />
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
            font-semibold
            text-emerald-300
          "
                >
                    <TrendingUp size={13} />

                    Live
                </div>
            </div>

            <div className="relative mt-7">
                <div className="flex items-end gap-1.5">
                    <h2 className="text-3xl font-black tracking-tight text-white">
                        {value}
                    </h2>

                    {suffix && (
                        <span className="mb-1 text-sm font-semibold text-slate-400">
                            {suffix}
                        </span>
                    )}
                </div>

                <h3 className="mt-2 text-sm font-bold text-slate-200">
                    {title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </motion.div>
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
                "Unable to load product analytics."
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
            <div className="space-y-8">
                <PageHeader
                    refreshing={refreshing}
                    onRefresh={() => fetchAnalytics(true)}
                />

                <div
                    className="
            flex
            min-h-[320px]
            flex-col
            items-center
            justify-center
            rounded-3xl
            border
            border-red-500/20
            bg-red-500/5
            px-6
            text-center
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
                        <AlertCircle
                            size={30}
                            className="text-red-400"
                        />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-white">
                        Failed to load analytics
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => fetchAnalytics()}
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
            "
                    >
                        <RefreshCw size={16} />

                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const stats = analytics?.stats || initialStats;

    return (
        <div className="space-y-8">
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
                    <AlertCircle
                        size={18}
                        className="shrink-0"
                    />

                    {error}
                </div>
            )}

            <section>
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Performance Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            A quick summary of your current product performance.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {kpiConfig.map((item, index) => (
                        <KpiCard
                            key={item.key}
                            index={index}
                            title={item.title}
                            description={item.description}
                            value={item.valueFormatter(stats[item.key])}
                            icon={item.icon}
                            iconClassName={item.iconClassName}
                            glowClassName={item.glowClassName}
                            suffix={item.suffix}
                        />
                    ))}
                </div>
            </section>

            {/* Next section will be added here:
          Top Performing Products Table
      */}
        </div>
    );
}

function PageHeader({ refreshing, onRefresh }) {
    return (
        <div
            className="
        flex
        flex-col
        gap-5
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
                    <BarChart3
                        size={26}
                        className="text-white"
                    />
                </div>

                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                        Product Analytics
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                        Track product views, sales, ratings and inventory
                        performance from one place.
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
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-4
          py-2.5
          text-sm
          font-semibold
          text-slate-200
          transition
          hover:border-white/20
          hover:bg-white/10
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
            >
                <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
            </button>
        </div>
    );
}