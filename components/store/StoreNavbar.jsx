'use client'

import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { BellDot, Download } from "lucide-react"
import { useOrderStore } from "@/hooks/use-order-store"
import { useEffect, useState } from "react"

const StoreNavbar = () => {
  const { user } = useUser()
  const { orderCount, fetchOrderCount } = useOrderStore()

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    fetchOrderCount()

    const interval = setInterval(() => {
      fetchOrderCount()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  /* ================= PWA DETECT ================= */
  useEffect(() => {
    const checkInstalled = () => {
      const installed =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://")

      setIsInstalled(installed)
    }

    checkInstalled()

    const ua = navigator.userAgent.toLowerCase()
    const ios =
      /iphone|ipad|ipod/.test(ua) &&
      !window.matchMedia("(display-mode: standalone)").matches

    setIsIOS(ios)

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler)

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    window.addEventListener("focus", checkInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("focus", checkInstalled)
    }
  }, [])

  /* ================= INSTALL APP ================= */
  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()

      const result = await deferredPrompt.userChoice

      if (result.outcome === "accepted") {
        setIsInstalled(true)
      }

      setDeferredPrompt(null)
    } else if (isIOS) {
      alert("Tap Share icon in Safari → Add to Home Screen")
    } else {
      alert("Open browser menu (⋮) → Install App")
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_8px_30px_rgba(0,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">

        {/* ================= BRAND ================= */}
        <Link
          href="/store"
          className="group flex items-center gap-3 select-none"
        >
          <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.35)] group-hover:scale-105 transition">
            <span className="text-black font-black text-sm">NB</span>
            <div className="absolute inset-0 rounded-2xl border border-white/20"></div>
          </div>

          <div className="leading-none">
            <h1 className="text-[16px] sm:text-[22px] font-bold tracking-tight text-white">
              <span className="text-cyan-400">Nandurbar</span> Bazar
            </h1>

            <span className="uppercase tracking-[0.28em] text-[8px] sm:text-[10px] text-white/60 font-medium">
              Seller Panel
            </span>
          </div>
        </Link>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* INSTALL BUTTON DESKTOP */}
          {!isInstalled && (
            <button
              onClick={installApp}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black text-sm font-semibold shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:scale-105 transition"
            >
              <Download size={16} />
              Install App
            </button>
          )}

          {/* INSTALL BUTTON MOBILE */}
          {!isInstalled && (
            <button
              onClick={installApp}
              className="sm:hidden h-9 w-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.35)]"
            >
              <Download size={16} />
            </button>
          )}

          {/* ORDERS */}
          <Link
            href="/store/orders"
            className="relative group flex items-center"
          >
            <BellDot
              size={24}
              className={
                orderCount > 0
                  ? "text-cyan-400 animate-pulse"
                  : "text-white/60"
              }
            />

            {orderCount > 0 && (
              <>
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-[10px] text-black font-black h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-[#050505]">
                  {orderCount > 9 ? "9+" : orderCount}
                </span>

                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-cyan-400 opacity-30 animate-ping"></span>
              </>
            )}

            <div className="absolute top-8 right-0 hidden group-hover:block text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
              {orderCount > 0 ? "New Orders" : "No Orders"}
            </div>
          </Link>

          {/* USER */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-5">

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none mb-1">
                Seller
              </span>

              <p className="text-sm font-medium text-white/90">
                {user?.firstName || "Guest"}
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-40 blur group-hover:opacity-100 transition"></div>

              <div className="relative">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "h-9 w-9 border border-white/20 hover:border-cyan-500 transition-colors",
                    },
                  }}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </nav>
  )
}

export default StoreNavbar