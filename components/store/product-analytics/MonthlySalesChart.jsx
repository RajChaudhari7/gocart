"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { TrendingUp } from "lucide-react";

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        notation: value >= 100000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(Number(value || 0));

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    const data = payload[0].payload;

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
            <p className="mb-3 border-b border-slate-800 pb-2 font-bold text-white">
                {label}
            </p>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                        Sales
                    </span>

                    <span className="font-bold text-emerald-300">
                        {formatCurrency(data.sales)}
                    </span>
                </div>

                <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                        Orders
                    </span>

                    <span className="font-bold text-white">
                        {data.orders}
                    </span>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <TrendingUp
                    size={30}
                    className="text-emerald-400"
                />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
                No monthly analytics
            </h3>

            <p className="mt-2 max-w-sm text-center text-sm leading-6 text-slate-400">
                Monthly sales trends will appear
                once orders are placed.
            </p>
        </div>
    );
}

export default function MonthlySalesChart({
    data = [],
}) {
    const normalizedData = data.map(
        (item) => ({
            month:
                item.month ||
                item.name ||
                "",

            sales: Number(
                item.sales ??
                item.revenue ??
                item.sellerEarnings ??
                0
            ),

            orders: Number(
                item.orders ??
                item.totalOrders ??
                0
            ),
        })
    );

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl shadow-black/20">

            <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative mb-6 flex items-start justify-between">

                <div className="flex gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

                        <TrendingUp
                            size={22}
                            className="text-emerald-400"
                        />

                    </div>

                    <div>

                        <h2 className="text-xl font-black text-white">
                            Monthly Sales Trend
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Track monthly sales
                            performance over time.
                        </p>

                    </div>

                </div>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    Trend Analysis
                </span>

            </div>

            <div className="h-[380px]">

                {normalizedData.length > 0 ? (

                    <ResponsiveContainer>

                        <AreaChart
                            data={normalizedData}
                        >

                            <defs>

                                <linearGradient
                                    id="monthlySalesGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >

                                    <stop
                                        offset="5%"
                                        stopColor="#10b981"
                                        stopOpacity={0.5}
                                    />

                                    <stop
                                        offset="95%"
                                        stopColor="#10b981"
                                        stopOpacity={0}
                                    />

                                </linearGradient>

                            </defs>

                            <CartesianGrid
                                stroke="#1e293b"
                                strokeDasharray="4 4"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 12,
                                }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatCurrency}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 12,
                                }}
                            />

                            <Tooltip
                                content={
                                    <CustomTooltip />
                                }
                            />

                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#10b981"
                                strokeWidth={3}
                                fill="url(#monthlySalesGradient)"
                            />

                        </AreaChart>

                    </ResponsiveContainer>

                ) : (

                    <EmptyState />

                )}

            </div>

        </section>
    );
}