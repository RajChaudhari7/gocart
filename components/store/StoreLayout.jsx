'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { ArrowRightIcon } from "lucide-react"
import { useAuth } from "@clerk/nextjs"

import Loading from "../Loading"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"

const StoreLayout = ({ children }) => {
  const { getToken } = useAuth()

  const [isSeller, setIsSeller] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storeInfo, setStoreInfo] = useState(null)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  /* ---------------- FETCH SELLER INFO ---------------- */
  const fetchSellerInfo = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.get('/api/store/is-seller', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setIsSeller(data.isSeller)
      setStoreInfo(data.storeInfo)

    } catch (error) {
      console.error(error)
    }
  }

  /* ---------------- FETCH ORDERS (BADGE) ---------------- */
  const fetchOrdersCount = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.get('/api/store/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const pending = data.orders.filter(
        order => order.status === "PENDING"
      ).length

      setPendingOrdersCount(pending)

    } catch (error) {
      console.error(error)
    }
  }

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchSellerInfo(),
        fetchOrdersCount()
      ])
      setLoading(false)
    }

    init()
  }, [])

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading />
      </div>
    )
  }

  /* ---------------- NOT SELLER ---------------- */
  if (!isSeller) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-700">
          You are not authorized to access this page
        </h1>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-6 py-2 text-sm hover:bg-slate-800 transition"
        >
          Go to home <ArrowRightIcon size={16} />
        </Link>
      </div>
    )
  }

  /* ---------------- LAYOUT ---------------- */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">

      {/* Top Navbar */}
      <SellerNavbar />

      {/* Body */}
      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-black">
          <SellerSidebar
            storeInfo={storeInfo}
            pendingOrdersCount={pendingOrdersCount}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6 pb-24 lg:pb-6" >
          {children}
        </main>
      </div>
    </div>
  )
}

export default StoreLayout
