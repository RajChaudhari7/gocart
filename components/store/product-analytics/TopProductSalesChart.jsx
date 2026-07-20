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

import {
    BadgeIndianRupee,
    Trophy,
} from "lucide-react";

import TopProductSalesTooltip from "./TopProductSalesTooltip";

const formatCurrencyAxis = (value) =>
    new Intl.NumberFormat("en-IN", {
        notation:
            Number(value || 0) >= 10000
                ? "compact"
                : "standard",
        maximumFractionDigits: 1,
    }).format(Number(value || 0));

export default function TopProductSalesChart({
    data = [],
}) {
    const normalizedData = data
        .map((item) => ({
            id: item.id,

            name:
                item.name ||
                item.productName ||
                "Unnamed Product",

            sales: Number(
                item.sales ??
                item.totalSales ??
                item.unitsSold ??
                0
            ),

            grossRevenue: Number(
                item.grossRevenue ??
                item.revenue ??
                0
            ),

            commissionAmount: Number(
                item.commissionAmount ??
                item.commission ??
                0
            ),

            sellerEarnings: Number(
                item.sellerEarnings ??
                item.revenue ??
                0
            ),
        }))
        .sort(
            (firstProduct, secondProduct) =>
                secondProduct.sellerEarnings -
                firstProduct.sellerEarnings
        )
        .slice(0, 10);

    const hasData = normalizedData.some(
        (item) =>
            item.sellerEarnings > 0 ||
            item.grossRevenue > 0 ||
            item.sales > 0
    );

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-xl shadow-black/20 md:p-6">
            {/* Background glow */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

            {/* Header */}

            <div className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                        <Trophy
                            size={22}
                            className="text-amber-400"
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-black text-white md:text-xl">
                            Top Product Sales
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Compare gross revenue,
                            platform commission and
                            seller earnings for your
                            best-performing products.
                        </p>
                    </div>
                </div>

                <span className="w-fit shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                    Top 10 Products
                </span>
            </div>

            {/* Chart */}

            <div className="relative h-[440px] w-full">
                {hasData ? (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={normalizedData}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 0,
                                bottom: 70,
                            }}
                            barGap={4}
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
                                height={95}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                                tickFormatter={(value) =>
                                    String(value).length >
                                        17
                                        ? `${String(
                                            value
                                        ).slice(
                                            0,
                                            17
                                        )}...`
                                        : value
                                }
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                width={65}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                                tickFormatter={
                                    formatCurrencyAxis
                                }
                            />

                            <Tooltip
                                cursor={{
                                    fill: "rgba(148, 163, 184, 0.06)",
                                }}
                                content={
                                    <TopProductSalesTooltip />
                                }
                            />

                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{
                                    paddingBottom:
                                        "22px",
                                    fontSize: "12px",
                                }}
                            />

                            <Bar
                                dataKey="grossRevenue"
                                name="Gross Revenue"
                                fill="#3b82f6"
                                radius={[7, 7, 0, 0]}
                                maxBarSize={28}
                            />

                            <Bar
                                dataKey="commissionAmount"
                                name="Commission"
                                fill="#f59e0b"
                                radius={[7, 7, 0, 0]}
                                maxBarSize={28}
                            />

                            <Bar
                                dataKey="sellerEarnings"
                                name="Seller Earnings"
                                fill="#10b981"
                                radius={[7, 7, 0, 0]}
                                maxBarSize={28}
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <BadgeIndianRupee
                    size={31}
                    className="text-amber-400"
                />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
                No product revenue data
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Product earnings and commission
                information will appear here after
                customers place successful orders.
            </p>
        </div>
    );
}