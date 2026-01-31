'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function OrdersAreaChart({ allOrders }) {

    // Group orders by date
    const ordersPerDay = allOrders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {})

    // Convert to array and sort
    const chartData = Object.entries(ordersPerDay)
        .map(([date, count]) => ({ date, orders: count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-2xl border border-slate-200 text-slate-800 text-sm">
                    <p className="font-medium">{label}</p>
                    <p className="text-indigo-600 font-semibold">{payload[0].value} Orders</p>
                </div>
            )
        }
        return null
    }

    // 3D tilt setup
    const containerRef = useRef(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-50, 50], [15, -15])
    const rotateY = useTransform(x, [-50, 50], [-15, 15])

    const handleMouseMove = (e) => {
        const rect = containerRef.current.getBoundingClientRect()
        const px = e.clientX - rect.left - rect.width / 2
        const py = e.clientY - rect.top - rect.height / 2
        x.set(px / 15)
        y.set(py / 15)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={containerRef}
            className="w-full max-w-5xl h-[380px] bg-white p-6 rounded-2xl shadow-2xl perspective cursor-grab"
            style={{ rotateX, rotateY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.02 }}
        >
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pt-2 text-right">
                <span className="text-slate-500">Orders /</span> Day
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                    {/* Grid */}
                    <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                    
                    {/* Axes */}
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} label={{ value: 'Orders', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }} />

                    {/* Tooltip */}
                    <Tooltip content={<CustomTooltip />} />

                    {/* Gradient Fill */}
                    <defs>
                        <linearGradient id="ordersGradient3D" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>

                    {/* Animated Area */}
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                    >
                        <Area
                            type="monotone"
                            dataKey="orders"
                            stroke="#4f46e5"
                            fill="url(#ordersGradient3D)"
                            strokeWidth={3}
                            animationDuration={1500}
                            dot={{ r: 4, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }}
                        />
                    </motion.g>
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    )
}
