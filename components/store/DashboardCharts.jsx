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

      {/* ---------------- 3D STYLE 2D CHARTS ---------------- */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ================= EARNINGS (3D LINE) ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white border rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-3">
            Monthly Earnings
          </h3>

          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={earningsData}>
                <defs>
                  <linearGradient id="earningsGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                {/* Depth shadow line */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#166534"
                  strokeWidth={7}
                  dot={false}
                  opacity={0.15}
                />

                {/* Main line */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fill="url(#earningsGlow)"
                  animationDuration={1400}
                  dot={{ r: 4, fill: "#22c55e" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ================= ORDERS (3D BAR) ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-3">
            Monthly Orders
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ordersData}>
              <defs>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              {/* Back shadow bar */}
              <Bar
                dataKey="value"
                fill="#1e3a8a"
                radius={[10, 10, 0, 0]}
                opacity={0.18}
              />

              {/* Front bar */}
              <Bar
                dataKey="value"
                fill="url(#ordersGrad)"
                radius={[10, 10, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ================= CANCELED (3D BAR) ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border rounded-xl p-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-3">
            Canceled Orders
          </h3>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={canceledOrdersData}>
              <defs>
                <linearGradient id="cancelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              {/* Depth bar */}
              <Bar
                dataKey="value"
                fill="#7f1d1d"
                radius={[10, 10, 0, 0]}
                opacity={0.2}
              />

              {/* Main bar */}
              <Bar
                dataKey="value"
                fill="url(#cancelGrad)"
                radius={[10, 10, 0, 0]}
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
