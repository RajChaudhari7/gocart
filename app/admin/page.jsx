'use client'

import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StoreIcon,
  TagsIcon,
  XCircleIcon
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import toast from "react-hot-toast"
import { motion, useMotionValue, useTransform } from "framer-motion"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const { getToken } = useAuth()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        canceledOrders: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasketIcon, color: 'bg-blue-100 text-blue-600' },
        { title: 'Total Revenue', value: currency + dashboardData.revenue, icon: CircleDollarSignIcon, color: 'bg-green-100 text-green-600' },
        { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon, color: 'bg-indigo-100 text-indigo-600' },
        { title: 'Total Stores', value: dashboardData.stores, icon: StoreIcon, color: 'bg-orange-100 text-orange-600' },
        { title: 'Canceled Orders', value: dashboardData.canceledOrders, icon: XCircleIcon, color: 'bg-red-100 text-red-600' },
    ]

    const fetchDashboardData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setDashboardData(data.dashboardData)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />


    // 3D Tilt Card Component
    const TiltCard = ({ card }) => {
        const cardRef = useRef(null)
        const x = useMotionValue(0)
        const y = useMotionValue(0)
        const rotateX = useTransform(y, [-50, 50], [15, -15])
        const rotateY = useTransform(x, [-50, 50], [-15, 15])

        const handleMouseMove = (e) => {
            const rect = cardRef.current.getBoundingClientRect()
            const px = e.clientX - rect.left - rect.width / 2
            const py = e.clientY - rect.top - rect.height / 2
            x.set(px / 2)
            y.set(py / 2)
        }

        const handleMouseLeave = () => {
            x.set(0)
            y.set(0)
        }

        return (
            <motion.div
                ref={cardRef}
                className={`flex items-center justify-between p-6 rounded-xl shadow-2xl ${card.color} cursor-pointer perspective`}
                style={{ rotateX, rotateY }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.05 }}
            >
                <div className="flex flex-col">
                    <p className="text-sm font-medium">{card.title}</p>
                    <b className="text-2xl md:text-3xl font-semibold">{card.value}</b>
                </div>
                <card.icon size={50} className="opacity-80" />
            </motion.div>
        )
    }

    return (
        <div className="text-slate-500 p-6">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">
                Admin <span className="text-indigo-600">Dashboard</span>
            </h1>

            {/* 3D Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
                {dashboardCardsData.map((card, index) => (
                    <TiltCard key={index} card={card} />
                ))}
            </div>

            {/* Orders Area Chart */}
            <motion.div
                className="bg-white p-6 rounded-xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-xl font-semibold mb-4">Orders Overview</h2>
                <OrdersAreaChart allOrders={dashboardData.allOrders} />
            </motion.div>

            {/* Recent Orders Table */}
            <motion.div
                className="mt-10 bg-white p-6 rounded-xl shadow-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-sm font-medium">Order ID</th>
                                <th className="py-2 px-4 text-sm font-medium">Customer</th>
                                <th className="py-2 px-4 text-sm font-medium">Amount</th>
                                <th className="py-2 px-4 text-sm font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.allOrders.map(order => (
                                <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="py-2 px-4">{order.id}</td>
                                    <td className="py-2 px-4">{order.customerName}</td>
                                    <td className="py-2 px-4">{currency}{order.amount}</td>
                                    <td className={`py-2 px-4 font-semibold ${order.status === 'CANCELED' ? 'text-red-600' : 'text-green-600'}`}>
                                        {order.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
