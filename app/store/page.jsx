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
    ordersChart: []
  })

  /* -------------------- STATS -------------------- */
  const stats = [
    { title: "Products", value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
    { title: "Earnings", value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
    { title: "Orders", value: dashboardData.totalOrders, icon: TagsIcon },
    { title: "Reviews", value: dashboardData.ratings.length, icon: StarIcon },
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

  /* -------------------- CHART DATA (SAFE) -------------------- */
  const earningsData = useMemo(() => {
    if (dashboardData.earningsChart?.length) {
      return dashboardData.earningsChart.map(item => ({
        name: item.month || item.name || "—",
        value: item.total || item.amount || item.value || 0
      }))
    }

    // fallback demo data (UI never breaks)
    return [
      { name: "Jan", value: 1200 },
      { name: "Feb", value: 2200 },
      { name: "Mar", value: 1800 },
      { name: "Apr", value: 3100 },
    ]
  }, [dashboardData.earningsChart])

  const ordersData = useMemo(() => {
    if (dashboardData.ordersChart?.length) {
      return dashboardData.ordersChart.map(item => ({
        name: item.month || item.name || "—",
        value: item.count || item.total || item.value || 0
      }))
    }

    return [
      { name: "Jan", value: 2 },
      { name: "Feb", value: 5 },
      { name: "Mar", value: 3 },
      { name: "Apr", value: 6 },
    ]
  }, [dashboardData.ordersChart])

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
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-4"
          >
            <p className="text-xs text-slate-500">{item.title}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xl font-semibold text-slate-900">
                {item.value}
              </p>
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

      {/* Reviews */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-900">
          Recent Reviews
        </h2>
        <span className="text-xs text-slate-500">
          {dashboardData.ratings.length} total
        </span>
      </div>

      <div className="space-y-4 max-w-4xl">
        {dashboardData.ratings.map((review, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-between">

              <div className="flex gap-3">
                <Image
                  src={review.user.image}
                  alt=""
                  width={40}
                  height={20}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {review.user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.createdAt).toDateString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 max-w-md">
                    {review.review}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-slate-500">
                  {review.product?.category}
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {review.product?.name}
                </p>

                <div className="flex sm:justify-end mt-1">
                  {Array(5).fill("").map((_, i) => (
                    <StarIcon
                      key={i}
                      size={14}
                      fill={review.rating >= i + 1 ? "#16A34A" : "#E5E7EB"}
                      className="text-transparent"
                    />
                  ))}
                </div>

                <button
                  onClick={() => router.push(`/product/${review.product.id}`)}
                  className="mt-3 text-xs px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-100"
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
