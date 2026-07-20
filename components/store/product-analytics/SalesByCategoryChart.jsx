"use client";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
    "#8b5cf6",
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#a855f7",
    "#84cc16",
];

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(
        Number(value || 0)
    );

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) {
        return null;
    }

    const data = payload[0].payload;

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
            <p className="font-bold text-white">
                {data.name}
            </p>

            <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                        Sales
                    </span>

                    <span className="font-bold text-white">
                        {formatNumber(data.sales)}
                    </span>
                </div>

                <div className="flex justify-between gap-6">
                    <span className="text-slate-400">
                        Percentage
                    </span>

                    <span className="font-bold text-cyan-300">
                        {data.percentage}%
                    </span>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
                <PieChartIcon
                    className="text-cyan-400"
                    size={30}
                />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
                No category sales
            </h3>

            <p className="mt-2 max-w-sm text-center text-sm leading-6 text-slate-400">
                Category-wise sales distribution
                will appear once orders start
                coming in.
            </p>
        </div>
    );
}

export default function SalesByCategoryChart({
    data = [],
}) {
    const totalSales = data.reduce(
        (sum, item) =>
            sum +
            Number(
                item.sales ??
                item.value ??
                0
            ),
        0
    );

    const normalizedData = data.map(
        (item) => ({
            name:
                item.name ||
                item.category ||
                "Unknown",

            sales: Number(
                item.sales ??
                item.value ??
                0
            ),

            percentage:
                totalSales > 0
                    ? (
                        (Number(
                            item.sales ??
                            item.value ??
                            0
                        ) /
                            totalSales) *
                        100
                    ).toFixed(1)
                    : "0.0",
        })
    );

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl shadow-black/20">

            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative mb-6 flex items-start justify-between">

                <div className="flex gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">

                        <PieChartIcon
                            size={22}
                            className="text-cyan-400"
                        />

                    </div>

                    <div>

                        <h2 className="text-xl font-black text-white">
                            Sales by Category
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Distribution of product
                            sales across all
                            categories.
                        </p>

                    </div>

                </div>

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    Category Analysis
                </span>

            </div>

            <div className="h-[360px]">

                {normalizedData.length > 0 ? (

                    <ResponsiveContainer>

                        <PieChart>

                            <Pie
                                data={normalizedData}
                                dataKey="sales"
                                nameKey="name"
                                innerRadius={70}
                                outerRadius={120}
                                paddingAngle={4}
                            >

                                {normalizedData.map(
                                    (_, index) => (
                                        <Cell
                                            key={index}
                                            fill={
                                                COLORS[
                                                index %
                                                COLORS.length
                                                ]
                                            }
                                        />
                                    )
                                )}

                            </Pie>

                            <Tooltip
                                content={
                                    <CustomTooltip />
                                }
                            />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                ) : (

                    <EmptyState />

                )}

            </div>

        </section>
    );
}