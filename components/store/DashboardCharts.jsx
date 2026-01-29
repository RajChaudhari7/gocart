'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-white/20 p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">{label}</p>
        {payload.map((pld, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.fill || pld.color }} />
            <p className="text-xs font-semibold text-white">
              {pld.name}: <span className="text-zinc-400">{pld.value}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardCharts({ earningsData = [], ordersData = [], canceledOrdersData = [], topProducts = [] }) {
  
  const chartData = ordersData.map((item, i) => ({
    name: item?.name || '',
    Orders: item?.value || 0,
    Canceled: canceledOrdersData[i]?.value || 0
  }))

  // Add the color directly to the data objects to avoid using <Cell />
  const topProductsData = topProducts.map((product, index) => ({
    name: product?.name || '',
    Sold: product?.sold || 0,
    // Top item gets Emerald, others get Zinc
    fill: index === 0 ? '#10b981' : '#3f3f46' 
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 px-4">

      {/* 1. Revenue Chart */}
      <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 min-h-[350px]">
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Revenue</h3>
          <p className="text-lg font-bold text-white">Earnings Overview</p>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="fadeEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} dy={10} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#fadeEmerald)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Performance Chart */}
      <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 min-h-[350px]">
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Performance</h3>
          <p className="text-lg font-bold text-white">Orders Activity</p>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} dy={10} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Orders" fill="#ffffff" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="Canceled" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Top Sellers - Cell-free Implementation */}
      <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 min-h-[350px]">
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Inventory</h3>
          <p className="text-lg font-bold text-white">Top Sellers</p>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={topProductsData} margin={{ left: -20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 10}} />
              <Tooltip content={<CustomTooltip />} />
              {/* Note: We use dataKey="Sold" and Recharts automatically looks for the 'fill' property in topProductsData */}
              <Bar dataKey="Sold" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}