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
import { motion } from "framer-motion"

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
    canceledChart: [],
    orders: [],
    topProducts: []
  })

  /* ---------------- YEAR + MONTH FILTER ---------------- */
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

  const [filterYear, setFilterYear] = useState(currentYear)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth())

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

  /* -------------------- FILTERED ORDERS (KPIs) -------------------- */
  const filteredOrders = useMemo(() => {
    return dashboardData.orders.filter(o => {
      const d = new Date(o.createdAt)
      return d.getFullYear() === filterYear &&
             d.getMonth() === filterMonth
    })
  }, [dashboardData.orders, filterYear, filterMonth])

  const filteredEarnings = useMemo(() => {
    return filteredOrders
      .filter(o => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0)
  }, [filteredOrders])

  const filteredCanceled = useMemo(() => {
    return filteredOrders.filter(o => o.status === "CANCELLED").length
  }, [filteredOrders])

  const totalCanceledOrders = dashboardData.orders.filter(o => o.status === "CANCELLED").length

  const productsSoldPercent = dashboardData.totalOrders
    ? ((filteredOrders.length / dashboardData.totalOrders) * 100).toFixed(1)
    : 0

  const earningsPercent = dashboardData.totalEarnings
    ? ((filteredEarnings / dashboardData.totalEarnings) * 100).toFixed(1)
    : 0

  const canceledPercent = totalCanceledOrders
    ? ((filteredCanceled / totalCanceledOrders) * 100).toFixed(1)
    : 0

  const avgRating = dashboardData.ratings.length
    ? (
        dashboardData.ratings.reduce((a, b) => a + b.rating, 0) /
        dashboardData.ratings.length
      ).toFixed(1)
    : 0

  const stats = [
    { title: "Products", value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
    { title: "Earnings", value: currency + dashboardData.totalEarnings + ` (${earningsPercent}%)`, icon: CircleDollarSignIcon },
    { title: "Orders", value: dashboardData.totalOrders + ` (${productsSoldPercent}%)`, icon: TagsIcon },
    { title: "Avg Rating", value: avgRating + " ⭐", icon: StarIcon },
    { title: "Canceled", value: totalCanceledOrders + ` (${canceledPercent}%)`, icon: XCircleIcon },
  ]

  /* -------------------- CHART DATA -------------------- */
  const earningsData = useMemo(
    () => dashboardData.earningsChart.map(i => ({ name: i.name, value: i.value || 0 })),
    [dashboardData.earningsChart]
  )

  const ordersData = useMemo(
    () => dashboardData.ordersChart.map(i => ({ name: i.name, value: i.value || 0 })),
    [dashboardData.ordersChart]
  )

  const canceledOrdersData = useMemo(
    () => dashboardData.canceledChart.map(i => ({ name: i.name, value: i.value || 0 })),
    [dashboardData.canceledChart]
  )

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto pb-28 px-4 lg:px-6 space-y-10">

      {/* Header + Year Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor your business performance with analytics and insights
          </p>
        </motion.div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Year:</span>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-5 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {stats.map((item, i) => (
          <motion.div
            key={i}
            className="bg-white border rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">{item.title}</p>
                <p className="text-xl font-semibold mt-1">{item.value}</p>
              </div>
              <item.icon className="w-6 h-6 text-indigo-500" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <DashboardCharts
        earningsData={earningsData}
        ordersData={ordersData}
        canceledOrdersData={canceledOrdersData}
        topProducts={dashboardData.topProducts}
      />

      {/* Insights */}
      <motion.div
        className="bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUpIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold">Insights</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>📈 Earnings for {filterYear}: {currency}{dashboardData.totalEarnings}</li>
          <li>⭐ Average rating: {avgRating}</li>
          <li>❌ {totalCanceledOrders} total canceled orders</li>
        </ul>
      </motion.div>

      {/* Reviews */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Reviews</h2>
        <span className="text-sm text-slate-500">{dashboardData.ratings.length} total</span>
      </div>

      <motion.div
        className="space-y-5 max-w-4xl"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {dashboardData.ratings.map((review, index) => (
          <motion.div
            key={index}
            className="bg-white border rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div className="flex justify-between gap-6">
              {/* LEFT */}
              <div className="flex gap-4">
                {review.user?.image ? (
                  <Image
                    src={review.user.image}
                    alt={review.user.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover ring-2 ring-indigo-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg ring-2 ring-indigo-500">
                    {review.user?.name?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{review.user.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(review.createdAt).toDateString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">{review.review}</p>
                  {review.reply && (
                    <p className="text-xs text-green-600 mt-1">
                      Reply: {review.reply}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                <p className="text-xs text-slate-500">{review.product?.category}</p>
                <p className="text-sm font-semibold">{review.product?.name}</p>
                <div className="flex justify-end mt-1 space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <StarIcon
                      key={i}
                      size={16}
                      fill={review.rating >= i ? "#16A34A" : "#E5E7EB"}
                      className="text-transparent"
                    />
                  ))}
                </div>
                <button
                  onClick={() => router.push(`/product/${review.product.id}`)}
                  className="mt-3 text-xs px-4 py-2 border rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium transition"
                >
                  View product
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  )
}
