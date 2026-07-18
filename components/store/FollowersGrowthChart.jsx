"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { Loader2, Users } from "lucide-react";

const ranges = [
    {
        label: "7 Days",
        value: "7d",
    },
    {
        label: "30 Days",
        value: "30d",
    },
    {
        label: "12 Months",
        value: "12m",
    },
];

export default function FollowersGrowthChart({
    data = [],
    range,
    onRangeChange,
    loading = false,
}) {
    return (
        <div
            className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-5
        sm:p-6
      "
        >
            <div
                className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-5
          mb-8
        "
            >
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Followers Growth
                    </h2>

                    <p className="text-slate-400 text-sm mt-1">
                        Track new followers over time
                    </p>
                </div>

                <div
                    className="
            flex
            items-center
            gap-1
            rounded-xl
            bg-black/20
            border
            border-white/10
            p-1
            overflow-x-auto
          "
                >
                    {ranges.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() =>
                                onRangeChange(item.value)
                            }
                            disabled={loading}
                            className={`
                whitespace-nowrap
                px-4
                py-2
                rounded-lg
                text-xs
                sm:text-sm
                font-medium
                transition-all
                duration-200

                ${range === item.value
                                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                                }

                disabled:cursor-not-allowed
                disabled:opacity-60
              `}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[320px] sm:h-[360px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2
                            size={30}
                            className="animate-spin text-emerald-400"
                        />
                    </div>
                ) : data.length === 0 ? (
                    <div
                        className="
              h-full
              rounded-2xl
              border
              border-dashed
              border-white/10
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
                    >
                        <Users
                            size={40}
                            className="text-white/20"
                        />

                        <p className="text-white/50 mt-4 font-medium">
                            No follower activity
                        </p>

                        <p className="text-white/30 text-sm mt-1">
                            New follower growth will appear here.
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <LineChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="rgba(255,255,255,0.08)"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="label"
                                stroke="#64748b"
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                                tickLine={false}
                                axisLine={false}
                                interval={
                                    range === "30d"
                                        ? 4
                                        : 0
                                }
                            />

                            <YAxis
                                allowDecimals={false}
                                stroke="#64748b"
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                }}
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip
                                cursor={{
                                    stroke:
                                        "rgba(16,185,129,0.25)",
                                    strokeWidth: 1,
                                }}
                                contentStyle={{
                                    backgroundColor: "#020617",
                                    border:
                                        "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "14px",
                                    boxShadow:
                                        "0 20px 50px rgba(0,0,0,0.4)",
                                }}
                                labelStyle={{
                                    color: "#94a3b8",
                                    marginBottom: "4px",
                                }}
                                itemStyle={{
                                    color: "#34d399",
                                }}
                                formatter={(value) => [
                                    value,
                                    value === 1
                                        ? "New follower"
                                        : "New followers",
                                ]}
                            />

                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{
                                    r: range === "30d" ? 2 : 4,
                                    fill: "#10b981",
                                    stroke: "#020617",
                                    strokeWidth: 2,
                                }}
                                activeDot={{
                                    r: 7,
                                    fill: "#34d399",
                                    stroke: "#020617",
                                    strokeWidth: 3,
                                }}
                                animationDuration={700}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}