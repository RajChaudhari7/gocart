'use client'

import Loading from "@/components/Loading"
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
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function Dashboard() {

  const { getToken } = useAuth()
  const router = useRouter()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    ratings: [],
  })

  const stats = [
    {
      title: "Products",
      value: dashboardData.totalProducts,
      icon: ShoppingBasketIcon,
      bg: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Earnings",
      value: currency + dashboardData.totalEarnings,
      icon: CircleDollarSignIcon,
      bg: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Orders",
      value: dashboardData.totalOrders,
      icon: TagsIcon,
      bg: "from-orange-500 to-orange-600"
    },
    {
      title: "Ratings",
      value: dashboardData.ratings.length,
      icon: StarIcon,
      bg: "from-pink-500 to-pink-600"
    }
  ]

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/store/dashboard', {
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 pb-24">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-slate-800">
          Seller Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Track your store performance & customer feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14">
        {stats.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="p-5 flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center`}>
                <item.icon className="text-white" size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">{item.title}</p>
                <h3 className="text-2xl font-semibold text-slate-800">
                  {item.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          Customer Reviews
        </h2>
        <span className="text-sm text-slate-500">
          {dashboardData.ratings.length} total
        </span>
      </div>

      {/* Reviews */}
      <div className="space-y-6 max-w-5xl">
        {dashboardData.ratings.map((review, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-between">

              {/* Left */}
              <div className="flex gap-4">
                <Image
                  src={review.user.image}
                  alt=""
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-slate-800">
                    {review.user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.createdAt).toDateString()}
                  </p>

                  <p className="mt-3 text-slate-600 text-sm leading-6 max-w-md">
                    {review.review}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex sm:flex-col justify-between gap-4 sm:items-end">
                <div className="text-sm text-right">
                  <p className="text-slate-400">
                    {review.product?.category}
                  </p>
                  <p className="font-medium text-slate-700">
                    {review.product?.name}
                  </p>

                  <div className="flex justify-end mt-1">
                    {Array(5).fill("").map((_, i) => (
                      <StarIcon
                        key={i}
                        size={16}
                        fill={review.rating >= i + 1 ? "#00C950" : "#D1D5DB"}
                        className="text-transparent"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/product/${review.product.id}`)}
                  className="text-sm px-5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  View Product
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
