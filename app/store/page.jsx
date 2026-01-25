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
    { title: "Products", value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
    { title: "Earnings", value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
    { title: "Orders", value: dashboardData.totalOrders, icon: TagsIcon },
    { title: "Reviews", value: dashboardData.ratings.length, icon: StarIcon },
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
    <div className="px-4 sm:px-6 lg:px-10 pb-28 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your store performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-slate-500">{item.title}</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {item.value}
              </p>
            </div>

            <item.icon className="w-5 h-5 text-slate-400" />
          </div>
        ))}
      </div>

      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-900">
          Recent Reviews
        </h2>
        <span className="text-xs text-slate-500">
          {dashboardData.ratings.length} total
        </span>
      </div>

      {/* Reviews */}
      <div className="space-y-4 max-w-4xl">
        {dashboardData.ratings.map((review, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded-lg p-4 bg-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

              {/* Left */}
              <div className="flex gap-3">
                <Image
                  src={review.user.image}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {review.user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.createdAt).toDateString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 max-w-md leading-6">
                    {review.review}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex sm:flex-col sm:items-end gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {review.product?.category}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {review.product?.name}
                  </p>

                  <div className="flex justify-end mt-1">
                    {Array(5).fill("").map((_, i) => (
                      <StarIcon
                        key={i}
                        size={14}
                        fill={review.rating >= i + 1 ? "#16A34A" : "#E5E7EB"}
                        className="text-transparent"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/product/${review.product.id}`)}
                  className="text-xs px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-100 transition"
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
