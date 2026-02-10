'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { ArrowRightIcon } from "lucide-react"
import { useAuth } from "@clerk/nextjs"

import Loading from "../Loading"
import StoreSidebar from "./StoreSidebar"

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
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!isSeller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-semibold">
          You are not authorized
        </h1>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-black text-white px-6 py-2 text-sm"
        >
          Go home <ArrowRightIcon size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* SIDEBAR (DESKTOP + MOBILE HANDLED INSIDE) */}
      <StoreSidebar
        storeInfo={storeInfo}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* PAGE CONTENT */}
      <main
        className="
          flex-1
          px-4 sm:px-6 lg:px-10
          py-6
          pb-28
        "
      >
        {children}
      </main>
    </div>
  )
}

export default StoreLayout
