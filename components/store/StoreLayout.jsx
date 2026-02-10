'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { ArrowRightIcon } from "lucide-react"
import { useAuth } from "@clerk/nextjs"

import Loading from "../Loading"
import SellerSidebar from "./StoreSidebar"

const StoreLayout = ({ children }) => {
  const { getToken } = useAuth()

  const [isSeller, setIsSeller] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storeInfo, setStoreInfo] = useState(null)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getToken()

        const [sellerRes, ordersRes] = await Promise.all([
          axios.get('/api/store/is-seller', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/store/orders', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        setIsSeller(sellerRes.data.isSeller)
        setStoreInfo(sellerRes.data.storeInfo)

        const pending = ordersRes.data.orders.filter(
          o => o.status === "PENDING"
        ).length

        setPendingOrdersCount(pending)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading />
      </div>
    )
  }

  if (!isSeller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-700">
          You are not authorized to access this page
        </h1>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-6 py-2 text-sm"
        >
          Go to home <ArrowRightIcon size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-black">
        <SellerSidebar
          storeInfo={storeInfo}
          pendingOrdersCount={pendingOrdersCount}
        />
      </aside>

      {/* Page Content */}
      <main
        className="
          flex-1
          px-4 sm:px-6 lg:px-10
          py-6
          pb-24 
        "
      >
        {children}
      </main>

      {/* Mobile Bottom Sidebar */}
      <div className="lg:hidden">
        <SellerSidebar
          storeInfo={storeInfo}
          pendingOrdersCount={pendingOrdersCount}
        />
      </div>
    </div>
  )
}

export default StoreLayout
