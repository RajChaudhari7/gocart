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

export default function DashboardCharts({
  earningsData,
  ordersData,
  canceledOrdersData,
  topProducts
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

  return (
    <div className="space-y-8 mb-12">

      {/* ---------------- 2D CHARTS ---------------- */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ================= EARNINGS (LINE / 3D FEEL) ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">
            Monthly Earnings
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={earningsData}>
              <defs>
                {/* Gradient for 3D depth */}
                <linearGradient id="earningsLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              {/* Shadow line (depth illusion) */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#166534"
                strokeWidth={6}
                dot={false}
                opacity={0.15}
              />

              {/* Main animated line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={3}
                fill="url(#earningsLine)"
                animationDuration={1400}
                animationEasing="ease-out"
                dot={{
                  r: 4,
                  fill: "#22c55e",
                  strokeWidth: 2,
                  stroke: "#ffffff"
                }}
                activeDot={{
                  r: 7,
                  fill: "#22c55e",
                  stroke: "#ffffff",
                  strokeWidth: 3
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ================= ORDERS (BAR) ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">
            Monthly Orders
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ================= CANCELED (BAR) ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">
            Canceled Orders
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={canceledOrdersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* ---------------- 3D TOP PRODUCTS (UNCHANGED) ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold mb-2">
          Top Products (3D Analytics)
        </h3>

        <TopProducts3DChart data={topProducts3D} />

        <p className="text-xs text-slate-500 text-center mt-2">
          Hover / tap bars to view product performance
        </p>
      </motion.div>

    </div>
  )
}
