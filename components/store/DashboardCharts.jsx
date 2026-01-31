"use client"

import {
  BarChart,
  Bar,
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

  const topProducts3D = Array.isArray(topProducts)
    ? topProducts.map(p => ({
      name: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
      sold: Number(p.totalSold) || 0
    }))
    : []

  return (
    <div className="space-y-8 mb-12">

      {/* ---------------- 2D CHARTS ---------------- */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Canceled Orders */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border rounded-xl p-4"
        >
          <h3 className="text-sm font-semibold mb-3">Canceled Orders</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={canceledOrdersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
