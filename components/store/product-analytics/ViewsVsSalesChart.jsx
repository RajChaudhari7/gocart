"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { BarChart3 } from "lucide-react";
import ViewsVsSalesTooltip from "./ViewsVsSalesTooltip";

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN", {
        notation:
            Number(value || 0) >= 10000
                ? "compact"
                : "standard",
        maximumFractionDigits: 1,
    }).format(Number(value || 0));

export default function ViewsVsSalesChart({
    data = [],
}) {
    const normalizedData = data.map((item) => ({
        name:
            item.name ||
            item.productName ||
            "Unnamed Product",

        views: Number(
            item.views ??
            item.totalViews ??
            0
        ),

        sales: Number(
            item.sales ??
            item.totalSales ??
            item.unitsSold ??
            0
        ),
    }));

    const hasData = normalizedData.some(
        (item) =>
            item.views > 0 ||
            item.sales > 0
    );

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-xl shadow-black/20 md:p-6">
            {/* Background glow */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

            {/* Header */}

            <div className="relative mb-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                        <BarChart3
                            size={21}
                            className="text-violet-400"
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-black text-white md:text-xl">
                            Views vs Sales
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Compare customer interest
                            with actual product sales.
                        </p>
                    </div>
                </div>

                <span className="shrink-0 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
                    Product Performance
                </span>
            </div>

            {/* Chart */}

            <div className="relative h-[360px] w-full">
                {hasData ? (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={normalizedData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -10,
                                bottom: 50,
                            }}
                            barGap={5}
                        >
                            <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="#1e293b"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                                height={80}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                                tickFormatter={(value) =>
                                    value.length > 15
                                        ? `${value.slice(
                                            0,
                                            15
                                        )}...`
                                        : value
                                }
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                width={60}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                                tickFormatter={
                                    formatNumber
                                }
                            />

                            <Tooltip
                                cursor={{
                                    fill: "rgba(148, 163, 184, 0.06)",
                                }}
                                content={
                                    <ViewsVsSalesTooltip />
                                }
                            />

                            <Legend
                                verticalAlign="top"
                                align="right"
                                wrapperStyle={{
                                    paddingBottom:
                                        "20px",
                                    fontSize: "12px",
                                }}
                            />

                            <Bar
                                dataKey="views"
                                name="Product Views"
                                fill="#8b5cf6"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={34}
                            />

                            <Bar
                                dataKey="sales"
                                name="Units Sold"
                                fill="#10b981"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={34}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChartState />
                )}
            </div>
        </section>
    );
}

function EmptyChartState() {
    return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                <BarChart3
                    size={30}
                    className="text-violet-400"
                />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
                No performance data yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Product views and sales will appear
                here once customers start viewing
                and purchasing your products.
            </p>
        </div>
    );
}