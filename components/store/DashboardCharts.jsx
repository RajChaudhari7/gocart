"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { motion } from "framer-motion"
import TopProducts3DChart from "@/components/charts/TopProducts3DChart"

const premiumCard =
  "bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"

export default function DashboardCharts({
  earningsData = [],
  ordersData = [],
  canceledOrdersData = [],
  topProducts = []
}) {

  /* ---------------- TOP PRODUCTS SAFE MAP ---------------- */
  const topProducts3D = Array.isArray(topProducts)
    ? topProducts.map(p => ({
        name: p.name?.length > 14 ? p.name.slice(0, 14) + "…" : p.name || "Unknown",
        sold: Number(
          p.totalSold ??
          p.sold ??
          p.quantitySold ??
          p.totalOrders ??
          p.count ??
          p._count?.orders ??
          0
        )
      }))
    : []

  const earningsFull = earningsData
  const ordersFull = ordersData
  const canceledFull = canceledOrdersData

  return (
    <div className="space-y-10 mb-12">

      {/* ---------------- PREMIUM CHART GRID ---------------- */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* ================= EARNINGS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${premiumCard} p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-slate-700">
              Monthly Earnings
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              Revenue
            </span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={earningsFull}>
              <defs>
                <linearGradient id="earningsGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />

              {/* Depth shadow */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#166534"
                strokeWidth={8}
                dot={false}
                opacity={0.12}
              />

              {/* Main glow line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={3}
                filter="url(#glow)"
                animationDuration={1400}
                dot={{ r: 4, fill: "#22c55e" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ================= ORDERS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${premiumCard} p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-slate-700">
              Monthly Orders
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              Volume
            </span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ordersFull}>
              <defs>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />

              {/* Depth bar */}
              <Bar
                dataKey="value"
                fill="#1e3a8a"
                radius={[12, 12, 0, 0]}
                opacity={0.15}
              />

              {/* Main bar */}
              <Bar
                dataKey="value"
                fill="url(#ordersGrad)"
                radius={[12, 12, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ================= CANCELED ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${premiumCard} p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-slate-700">
              Canceled Orders
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
              Risk
            </span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={canceledFull}>
              <defs>
                <linearGradient id="cancelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />

              {/* Depth */}
              <Bar
                dataKey="value"
                fill="#7f1d1d"
                radius={[12, 12, 0, 0]}
                opacity={0.15}
              />

              {/* Main */}
              <Bar
                dataKey="value"
                fill="url(#cancelGrad)"
                radius={[12, 12, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* ---------------- TOP PRODUCTS ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${premiumCard} p-6`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold tracking-wide text-slate-700">
            Top Products
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
            Performance
          </span>
        </div>

        <TopProducts3DChart data={topProducts3D} />

        <p className="text-xs text-slate-500 text-center mt-3">
          Hover / tap bars to view product performance
        </p>
      </motion.div>

    </div>
  )
}
