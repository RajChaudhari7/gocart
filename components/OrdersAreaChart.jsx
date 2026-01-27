'use client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function OrdersAreaChart({ allOrders = [] }) {

  // ⛔ Guard: no orders
  if (!Array.isArray(allOrders) || allOrders.length === 0) {
    return (
      <div className="w-full max-w-4xl h-[300px] flex items-center justify-center text-sm text-slate-400">
        No order data available
      </div>
    )
  }

  // Group orders by date
  const ordersPerDay = allOrders.reduce((acc, order) => {
    if (!order.createdAt) return acc

    const date = new Date(order.createdAt)
      .toISOString()
      .split('T')[0] // YYYY-MM-DD

    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  // Convert to array + SORT BY DATE
  const chartData = Object.entries(ordersPerDay)
    .map(([date, count]) => ({
      date,
      orders: count,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <div className="w-full max-w-4xl h-[300px] text-xs">
      <h3 className="text-lg font-medium text-slate-800 mb-4 pt-2 text-right">
        <span className="text-slate-500">Orders /</span> Day
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })
            }
          />

          <YAxis
            allowDecimals={false}
            label={{ value: 'Orders', angle: -90, position: 'insideLeft' }}
          />

          <Tooltip
            labelFormatter={(date) =>
              new Date(date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            }
          />

          <Area
            type="monotone"
            dataKey="orders"
            stroke="#4f46e5"
            fill="#c7d2fe"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
