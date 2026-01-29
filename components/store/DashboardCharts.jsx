'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts"

export default function DashboardCharts({ earningsData, ordersData, canceledOrdersData, topProducts }) {
  // Orders vs Canceled chart
  const chartData = ordersData.map((item, i) => ({
    name: item.name,
    Orders: item.value,
    Canceled: canceledOrdersData[i]?.value || 0
  }))

  // Top products chart
  const topProductsData = topProducts.map(product => ({
    name: product.name,
    Sold: product.sold
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

      {/* Earnings Overview */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Earnings Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders vs Canceled */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Orders vs Canceled</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Orders" fill="#0f172a" radius={[6,6,0,0]} />
              <Bar dataKey="Canceled" fill="#dc2626" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Top Products</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={topProductsData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="Sold" fill="#3b82f6" radius={[6,6,6,6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
