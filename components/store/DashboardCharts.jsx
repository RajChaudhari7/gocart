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

export default function DashboardCharts({ earningsData, ordersData, canceledOrdersData }) {
  const chartData = ordersData.map((item, i) => ({
    name: item.name,
    Orders: item.value,
    Canceled: canceledOrdersData[i]?.value || 0
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

      {/* Earnings */}
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

      {/* Orders */}
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

    </div>
  )
}
