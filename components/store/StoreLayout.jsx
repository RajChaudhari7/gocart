'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { ArrowRightIcon } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { usePathname, useRouter } from "next/navigation"

import Loading from "../Loading"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"

const StoreLayout = ({ children }) => {
  const { getToken } = useAuth()

  const [isSeller, setIsSeller] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storeInfo, setStoreInfo] = useState(null)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  const fetchSellerInfo = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.get(
        "/api/store/is-seller",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setIsSeller(data.isSeller)
      setStoreInfo(data.storeInfo)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchOrdersCount = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.get(
        "/api/store/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const pending = data.orders.filter(
        (order) => order.status === "PENDING"
      ).length

      setPendingOrdersCount(pending)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchSellerInfo(),
        fetchOrdersCount(),
      ])

      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loading />
      </div>
    )
  }

  if (!isSeller) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-700 sm:text-4xl">
          You are not authorized to access this page
        </h1>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2 text-sm text-white transition hover:bg-slate-800"
        >
          Go to home
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">

      <SellerNavbar />

      <div className="flex min-h-0 flex-1 overflow-hidden">

        <SellerSidebar
          storeInfo={storeInfo}
          pendingOrdersCount={pendingOrdersCount}
        />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 pb-20 sm:px-6 sm:pb-6 lg:px-10">
          {children}
        </main>

      </div>
    </div>
  )
}

export default StoreLayout