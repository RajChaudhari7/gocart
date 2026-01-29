'use client'

import Loading from "@/components/Loading"
import DashboardCharts from "@/components/store/DashboardCharts"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon,
  XCircleIcon,
  TrendingUpIcon
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

  /* -------------------- STATS -------------------- */
  const totalCanceledOrders = dashboardData.orders.filter(
    o => o.status === "CANCELLED"
  ).length

  const avgRating = dashboardData.ratings.length
    ? (
        dashboardData.ratings.reduce((a, b) => a + b.rating, 0) /
        dashboardData.ratings.length
      ).toFixed(1)
    : 0

  const stats = [
    { title: "Products", value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
    { title: "Earnings", value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
    { title: "Orders", value: dashboardData.totalOrders, icon: TagsIcon },
    { title: "Avg Rating", value: avgRating + " ⭐", icon: StarIcon },
    { title: "Canceled", value: totalCanceledOrders, icon: XCircleIcon },
  ]

  /* -------------------- FETCH -------------------- */
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

  /* -------------------- CHART DATA -------------------- */
  const earningsData = useMemo(
    () => dashboardData.earningsChart.map(i => ({ name: i.name, value: i.value || 0 })),
    [dashboardData.earningsChart]
  )

  const ordersData = useMemo(
    () => dashboardData.ordersChart.map(i => ({ name: i.name, value: i.value || 0 })),
    [dashboardData.ordersChart]
  )

  const canceledOrdersData = useMemo(() => {
    const map = {}
    dashboardData.orders.forEach(o => {
      if (o.status === 'CANCELLED') {
        const m = new Date(o.createdAt).toLocaleString('default', { month: 'short' })
        map[m] = (map[m] || 0) + 1
      }
    })
    return ordersData.map(m => ({ name: m.name, value: map[m.name] || 0 }))
  }, [dashboardData.orders, ordersData])

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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((item, i) => (
          <div key={i} className="bg-white border rounded-xl p-4">
            <p className="text-xs text-slate-500">{item.title}</p>
            <div className="flex justify-between mt-2">
              <p className="text-xl font-semibold">{item.value}</p>
              <item.icon className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        earningsData={earningsData}
        ordersData={ordersData}
        canceledOrdersData={canceledOrdersData}
      />

      {/* Insights */}
      <div className="bg-white border rounded-xl p-5 mb-10">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUpIcon className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-semibold">Insights</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>📈 Total earnings reached {currency}{dashboardData.totalEarnings}</li>
          <li>⭐ Average rating is {avgRating}</li>
          <li>❌ {totalCanceledOrders} orders were canceled</li>
        </ul>
      </div>

      {/* Reviews */}
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-medium">Recent Reviews</h2>
        <span className="text-xs text-slate-500">
          {dashboardData.ratings.length} total
        </span>
      </div>

      <div className="space-y-4 max-w-4xl">
        {dashboardData.ratings.map((review, index) => (
          <div key={index} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between gap-4">

              {/* LEFT */}
              <div className="flex gap-4">
                {review.user?.image ? (
                  <Image
                    src={review.user.image}
                    alt={review.user.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-semibold">
                    {review.user?.name?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{review.user.name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.createdAt).toDateString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{review.review}</p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                <p className="text-xs text-slate-500">{review.product?.category}</p>
                <p className="text-sm font-medium">{review.product?.name}</p>
                <div className="flex justify-end mt-1">
                  {[1,2,3,4,5].map(i => (
                    <StarIcon
                      key={i}
                      size={14}
                      fill={review.rating >= i ? "#16A34A" : "#E5E7EB"}
                      className="text-transparent"
                    />
                  ))}
                </div>
                <button
                  onClick={() => router.push(`/product/${review.product.id}`)}
                  className="mt-3 text-xs px-4 py-2 border rounded-md hover:bg-slate-100"
                >
                  View product
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
