"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
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
import AnalyticsFilters from "@/components/store/product-analytics/AnalyticsFilters";
import { DEFAULT_ANALYTICS_FILTERS, } from "@/components/store/product-analytics/constants";


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

    const [filters, setFilters] = useState(DEFAULT_ANALYTICS_FILTERS);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();

        params.set("range", filters.range);
        params.set("sort", filters.sort);
        params.set("stock", filters.stock);

        if (filters.search.trim()) {
            params.set("search", filters.search.trim());
        }

        if (filters.category !== "all") {
            params.set("category", filters.category);
        }

        if (filters.featured) {
            params.set("featured", "true");
        }

        return params.toString();
    }, [filters]);

    const fetchAnalytics = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/store/product-analytics-filter?${queryString}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error ||
                        "Unable to load analytics"
                    );
                }

                setAnalytics(result);
            } catch (error) {
                console.error(error);

                setError(
                    error.message ||
                    "Unable to load analytics"
                );
            } finally {
                setLoading(false);
            }
        },
        [queryString]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchAnalytics();
        }, 350);

        return () => clearTimeout(timeout);
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

    const categories = useMemo(() => {
        const categorySet = new Set();

        analytics?.topProducts?.forEach(
            (product) => {
                if (product.category) {
                    categorySet.add(
                        product.category
                    );
                }
            }
        );

        analytics?.charts?.salesByCategory?.forEach(
            (item) => {
                if (item.category) {
                    categorySet.add(
                        item.category
                    );
                }
            }
        );

        return Array.from(categorySet).sort(
            (a, b) => a.localeCompare(b)
        );
    }, [analytics]);

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

                <AnalyticsFilters
                    filters={filters}
                    categories={categories}
                    loading={loading}
                    onChange={setFilters}
                    onReset={() =>
                        setFilters(
                            DEFAULT_ANALYTICS_FILTERS
                        )
                    }
                />

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