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

  // ... fetchSellerInfo and fetchOrdersCount stay the same ...
  const fetchSellerInfo = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/store/is-seller', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsSeller(data.isSeller)
      setStoreInfo(data.storeInfo)
    } catch (error) { console.error(error) }
  }

  const fetchOrdersCount = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/store/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const pending = data.orders.filter(order => order.status === "PENDING").length
      setPendingOrdersCount(pending)
    } catch (error) { console.error(error) }
  }

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchSellerInfo(), fetchOrdersCount()])
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loading /></div>
  
  if (!isSeller) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl font-semibold text-slate-700">Not authorized</h1>
      <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-6 py-2 transition hover:bg-slate-800">
        Go home <ArrowRightIcon size={16} />
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar: Stays at the very top */}
      <div className="sticky top-0 z-[100] w-full bg-white border-b border-slate-200">
        <SellerNavbar />
      </div>

      <div className="flex flex-1">
        {/* Sidebar: Fixed width, no overflow. 
            lg:flex ensures it is visible from Large screens up */}
        <aside className="hidden lg:flex w-72 flex-col fixed left-0 h-[calc(100vh-64px)]">
          <SellerSidebar 
            storeInfo={storeInfo} 
            pendingOrdersCount={pendingOrdersCount} 
          />
        </aside>

        {/* Main Content Area: 
            ml-72 ensures content starts AFTER the sidebar on desktop.
            w-full and min-h-screen keeps the white background consistent. */}
        <main className="flex-1 w-full lg:ml-72 min-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
          
          {/* Mobile padding to prevent floating dock from covering content */}
          <div className="h-24 lg:hidden" />
        </main>
      </div>
    </div>
  )
}

export default StoreLayout