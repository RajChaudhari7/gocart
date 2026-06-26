'use client'
import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { BellDot, Download } from "lucide-react"
import { useOrderStore } from "@/hooks/use-order-store"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

const StoreNavbar = () => {
  const { orderCount, fetchOrderCount } = useOrderStore()
  const [isTWA, setIsTWA] = useState(false)

  useEffect(() => {
    fetchOrderCount()
    const interval = setInterval(fetchOrderCount, 5000)
    return () => clearInterval(interval)
  }, [fetchOrderCount])

  useEffect(() => {
    const checkAppMode = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
      const twa = document.referrer.includes("android-app://")
      setIsTWA(standalone || twa)
    }
    checkAppMode()
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#050505]/85 backdrop-blur-2xl border-b border-white/5 shadow-[0_8px_30px_rgba(0,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        
        {/* UPDATED BRAND LOGO */}
        <Link href="/store/" className="group flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="relative h-14 w-14 sm:h-16 sm:w-16 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 shadow-lg"
          >
            <Image
              src="/seller.png"
              alt="Seller Logo"
              fill
              className="object-contain p-2 mix-blend-screen"
              priority
            />
          </motion.div>
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Download App */}
          {!isTWA && (
            <>
              <a href="/apk/nandurbar-bazar-seller.apk" download className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black text-sm font-semibold">
                <Download size={16} /> Download App
              </a>
              <a href="/apk/nandurbar-bazar-seller.apk" download className="sm:hidden h-10 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black flex items-center justify-center">
                <Download size={18} />
              </a>
            </>
          )}

          {/* ORDERS */}
          <Link href="/store/orders" className="relative group flex items-center">
            <BellDot size={26} className={orderCount > 0 ? "text-cyan-400 animate-pulse" : "text-white/60"} />
            {orderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-[10px] text-black font-black h-5 w-5 rounded-full flex items-center justify-center">
                {orderCount > 9 ? "9+" : orderCount}
              </span>
            )}
          </Link>

          {/* USER */}
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }} />
        </div>
      </div>
    </nav>
  )
}

export default StoreNavbar