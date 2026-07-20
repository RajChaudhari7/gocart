"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle } from "lucide-react";

import PageHeader from "@/components/store/product-analytics/PageHeader";
import AnalyticsStats from "@/components/store/product-analytics/AnalyticsStats";
import InsightCards from "@/components/store/product-analytics/InsightCards";
import ViewsVsSalesChart from "@/components/store/product-analytics/ViewsVsSalesChart";
import SalesByCategoryChart from "@/components/store/product-analytics/SalesByCategoryChart";
import TopProductSalesChart from "@/components/store/product-analytics/TopProductSalesChart";
import MonthlySalesChart from "@/components/store/product-analytics/MonthlySalesChart";
import TopProductsTable from "@/components/store/product-analytics/TopProductsTable";
import ProductAnalyticsSkeleton from "@/components/store/product-analytics/ProductAnalyticsSkeleton";
import ErrorState from "@/components/store/product-analytics/ErrorState";

const initialStats = {
    totalProducts: 0,
    totalViews: 0,
    totalSales: 0,

    grossRevenue: 0,
    commission: 0,
    sellerEarnings: 0,

    averageRating: 0,
};

export default function ProductAnalyticsPage() {
    const [analytics, setAnalytics] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const fetchAnalytics = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await axios.get(
                    "/api/store/product-analytics"
                );

                setAnalytics(response.data);
            } catch (error) {
                console.error(
                    "Failed to fetch product analytics:",
                    error
                );

                setError(
                    error?.response?.data?.error ||
                    "Unable to load product analytics. Please try again."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

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
                onRetry={() =>
                    fetchAnalytics(true)
                }
            />
        );
    }

    const stats = {
        ...initialStats,
        ...(analytics?.stats || {}),
    };

    const viewsVsSalesData =
        analytics?.charts?.viewsVsSales || [];

    const salesByCategoryData =
        analytics?.charts?.salesByCategory || [];

    const topProductSalesData =
        analytics?.charts?.topProductSales || [];

    const monthlySalesData =
        analytics?.charts?.monthlySales || [];

    const topProducts =
        analytics?.topProducts || [];

    return (
        <main className="min-h-screen bg-[#020617] p-4 text-white md:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-8">

                {/* Page heading and refresh */}

                <PageHeader
                    refreshing={refreshing}
                    onRefresh={() =>
                        fetchAnalytics(true)
                    }
                />

                {/* Non-blocking refresh error */}

                {error && analytics && (
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        <AlertCircle
                            size={18}
                            className="shrink-0"
                        />

                        <span>{error}</span>
                    </div>
                )}

                {/* KPI cards */}

                <AnalyticsStats
                    stats={stats}
                />

                {/* Smart insight cards */}

                <InsightCards
                    analytics={analytics}
                />

                {/* Views and category charts */}

                <div className="grid gap-6 xl:grid-cols-2">
                    <ViewsVsSalesChart
                        data={viewsVsSalesData}
                    />

                    <SalesByCategoryChart
                        data={salesByCategoryData}
                    />
                </div>

                {/* Product sales chart */}

                <TopProductSalesChart
                    data={topProductSalesData}
                />

                {/* Monthly analytics */}

                <MonthlySalesChart
                    data={monthlySalesData}
                />

                {/* Top products table */}

                <TopProductsTable
                    products={topProducts}
                />
            </div>
        </main>
    );
}