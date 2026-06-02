'use client'

import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { BellDot, Download } from "lucide-react"
import { useOrderStore } from "@/hooks/use-order-store"
import { useEffect, useState, useRef } from "react"
import toast from "react-hot-toast"

const StoreNavbar = () => {
  const { user } = useUser()
  const { orderCount, fetchOrderCount } = useOrderStore()

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const previousCountRef = useRef(0)
  const audioRef = useRef(null)

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().catch(() => { })
    }
  }, [])

  useEffect(() => {
    const previousCount = previousCountRef.current

    if (
      previousCount > 0 &&
      orderCount > previousCount
    ) {
      // Play sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0

        audioRef.current.play().catch((err) => {
          console.log("Audio blocked:", err)
        })
      }

      // Toast notification
      toast.success("🎉 New Order Received!", {
        duration: 5000,
      })

      // Browser notification
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const notification = new Notification(
          "New Order Received 🎉",
          {
            body: `You have ${orderCount} pending orders`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          }
        )

        notification.onclick = () => {
          window.focus()

          if (
            window.location.pathname !== "/store/orders"
          ) {
            window.location.href = "/store/orders"
          }

          notification.close()
        }
      }
    }

    previousCountRef.current = orderCount
  }, [orderCount])

  useEffect(() => {
    audioRef.current = new Audio("/sounds/new-order.mp3")
    audioRef.current.preload = "auto"
    audioRef.current.volume = 1

    const unlockAudio = () => {
      if (!audioRef.current) return

      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        })
        .catch(() => { })

      document.removeEventListener("touchstart", unlockAudio)
      document.removeEventListener("click", unlockAudio)
    }

    document.addEventListener("touchstart", unlockAudio)
    document.addEventListener("click", unlockAudio)

    return () => {
      document.removeEventListener("touchstart", unlockAudio)
      document.removeEventListener("click", unlockAudio)
    }
  }, [])

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    fetchOrderCount()

    const interval = setInterval(() => {
      fetchOrderCount()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchOrderCount])

  /* ================= PWA INSTALL ================= */
  useEffect(() => {
    const checkInstalled = () => {
      const installed =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true

      setIsInstalled(installed)
    }

    checkInstalled()

    /* REGISTER SELLER SERVICE WORKER */
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/store-sw.js", {
          scope: "/store/",
        })
        .then(() => console.log("Seller SW Registered"))
        .catch((err) => console.log("SW Error:", err))
    }

    /* IMPORTANT FIX */
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setCanInstall(false)
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    )

    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
      window.removeEventListener("appinstalled", handleInstalled)
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
      return
    }

    /* MOBILE FALLBACK */
    alert("Tap Chrome Menu ⋮ → Add to Home Screen")
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#050505]/85 backdrop-blur-2xl border-b border-white/5 shadow-[0_8px_30px_rgba(0,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">

        {/* BRAND */}
        <Link
          href="/store/"
          className="group flex items-center gap-3 select-none"
        >
          <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <span className="text-black font-black text-sm">NB</span>
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

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-5">

          {!isInstalled && (
            <button
              onClick={installApp}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black text-sm font-semibold"
            >
              <Download size={16} />
              Install App
            </button>
          )}

          {!isInstalled && (
            <button
              onClick={installApp}
              className="sm:hidden h-9 w-9 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black flex items-center justify-center"
            >
              <Download size={16} />
            </button>
          )}

          {/* ORDERS */}
          <Link href="/store/orders" className="relative group flex items-center">
            <BellDot
              size={24}
              className={
                orderCount > 0
                  ? "text-cyan-400 animate-pulse"
                  : "text-white/60"
              }
            />

            {orderCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-cyan-500 text-[10px] text-black font-black h-5 w-5 rounded-full flex items-center justify-center">
                {orderCount > 9 ? "9+" : orderCount}
              </span>
            )}
          </Link>

          {/* USER */}
          <UserButton />
        </div>
      </div>
    </nav>
  )
}

export default StoreNavbar