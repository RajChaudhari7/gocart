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
  earningsData = [],
  ordersData = [],
  canceledOrdersData = [],
  topProducts = []
}) {

  /* ---------------- TOP PRODUCTS (SAFE + FILTERED) ---------------- */
  const topProducts3D = Array.isArray(topProducts)
    ? topProducts
        .map(p => ({
          name:
            p.name?.length > 14
              ? p.name.slice(0, 14) + "…"
              : p.name || "Unknown",
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
        .filter(p => p.sold > 0)        // 🔑 remove zero sales
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5)                    // 🔥 TOP 5 ONLY
    : []

  return (
    <div className="space-y-8 mb-12">

      {/* ---------------- 2D CHARTS ---------------- */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ================= EARNINGS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">
            Monthly Earnings
          </h3>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ================= ORDERS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">
            Monthly Orders
          </h3>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ================= CANCELED ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">
            Canceled Orders
          </h3>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={canceledOrdersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* ---------------- 3D TOP PRODUCTS ---------------- */}
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
