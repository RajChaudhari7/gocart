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
  Cell,
} from "recharts"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-white/10 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{label}</p>
        {payload.map((pld, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color }} />
            <p className="text-sm font-semibold text-white">
              {pld.name}: <span className="text-zinc-400">{pld.value}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardCharts({ earningsData, ordersData, canceledOrdersData, topProducts }) {
  const chartData = ordersData.map((item, i) => ({
    name: item.name,
    Orders: item.value,
    Canceled: canceledOrdersData[i]?.value || 0
  }))

  const topProductsData = topProducts.map(product => ({
    name: product.name,
    Sold: product.sold
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 px-4 sm:px-0">

      {/* Earnings Overview - Area Chart for smoother feel */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <div className="flex flex-col mb-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Revenue</h3>
          <p className="text-xl font-bold text-white">Earnings Overview</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#71717a', fontSize: 10}} 
                dy={10}
              />
              <YAxis hide={true} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders vs Canceled - Slim Bar Chart */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <div className="flex flex-col mb-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Performance</h3>
          <p className="text-xl font-bold text-white">Orders Activity</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#71717a', fontSize: 10}} 
                dy={10}
              />
              <YAxis hide={true} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Bar dataKey="Orders" fill="#ffffff" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="Canceled" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products - Minimalist Vertical Bar */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <div className="flex flex-col mb-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Inventory</h3>
          <p className="text-xl font-bold text-white">Top Sellers</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={topProductsData} margin={{ left: -20 }}>
              <XAxis type="number" hide={true} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#a1a1aa', fontSize: 11}} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
              <Bar dataKey="Sold" radius={[0, 4, 4, 0]} barSize={15}>
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#27272a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}