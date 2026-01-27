'use client'

import Loading from "@/components/Loading"
import DashboardCharts from "@/components/store/DashboardCharts"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import toast from "react-hot-toast"

export default function Dashboard() {

  const { getToken } = useAuth()
  const router = useRouter()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    ratings: [],
    earningsChart: [],
    ordersChart: [],
    orders: []
  })

  /* -------------------- FETCH DASHBOARD -------------------- */
  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/store/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDashboardData(data.dashboardData)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  /* -------------------- STATS -------------------- */
  const stats = [
    { title: "Products", value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
    { 
      title: "Earnings", 
      value: `${currency}${dashboardData.orders.reduce((acc, order) => {
        return acc + (order.status === 'CANCELLED' ? -order.total : order.total)
      }, 0)}`, 
      icon: CircleDollarSignIcon 
    },
    { title: "Orders", value: dashboardData.totalOrders, icon: TagsIcon },
    { title: "Reviews", value: dashboardData.ratings.length, icon: StarIcon },
  ]

  /* -------------------- CHART DATA -------------------- */
  const earningsData = useMemo(() => {
    if (!dashboardData.orders?.length) return []

    // Group earnings by month
    const monthsMap = {}
    dashboardData.orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
      const amount = order.status === 'CANCELLED' ? -order.total : order.total
      monthsMap[month] = (monthsMap[month] || 0) + amount
    })

    return Object.entries(monthsMap).map(([name, value]) => ({ name, value }))
  }, [dashboardData.orders])

  const ordersData = useMemo(() => {
    if (!dashboardData.orders?.length) return []

    // Count orders by month
    const monthsMap = {}
    dashboardData.orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
      monthsMap[month] = (monthsMap[month] || 0) + 1
    })

    return Object.entries(monthsMap).map(([name, value]) => ({ name, value }))
  }, [dashboardData.orders])

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto pb-28 px-4 lg:px-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your business performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">{item.title}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xl font-semibold text-slate-900">{item.value}</p>
              <item.icon className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        earningsData={earningsData}
        ordersData={ordersData}
      />

      {/* Recent Orders */}
      <div className="mt-10">
        <h2 className="text-lg font-medium text-slate-900 mb-4">Recent Orders</h2>
        <div className="space-y-4 max-w-4xl">
          {dashboardData.orders.slice(0, 5).map((order, index) => (
            <div key={order.id} className={`bg-white border rounded-xl p-4 flex justify-between items-center ${order.status === 'CANCELLED' ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
              <div>
                <p className="text-sm font-medium text-slate-900">{order.user?.name}</p>
                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                <p className={`mt-1 font-semibold ${order.status === 'CANCELLED' ? 'text-red-600' : 'text-slate-900'}`}>
                  {order.status === 'CANCELLED' ? `-₹${order.total}` : `₹${order.total}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
