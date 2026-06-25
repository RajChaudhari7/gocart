'use client'

import {
  PackageIcon,
  ShoppingCart,
  Menu,
  X,
  HomeIcon,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useUser, useClerk, UserButton, Protect } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

/* ================= ANIMATION VARIANTS ================= */
const cartPulse = {
  idle: { scale: 1 },
  active: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.4 },
  },
}

const drawerVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 25 },
  },
  exit: { x: '100%', transition: { duration: 0.2 } },
}

const Navbar = () => {
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const pathname = usePathname()

  const cartCount = useSelector(
    (state) => state.cart?.total || state.cart?.items?.length || 0
  )

  const prevCartCount = useRef(cartCount)

  const [pulse, setPulse] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isTWA, setIsTWA] = useState(false)

  /* ================= PWA ================= */
  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true

      const twa =
        document.referrer.includes('android-app://')

      setIsInstalled(standalone)
      setIsTWA(twa || standalone)
    }

    checkInstalled()

    /* USER APP SERVICE WORKER */
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.log('SW Error:', err))
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const installedHandler = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    window.addEventListener('focus', checkInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
      window.removeEventListener('focus', checkInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) {
      alert('Use browser menu ⋮ and tap Install App')
      return
    }

    deferredPrompt.prompt()

    const result = await deferredPrompt.userChoice

    if (result.outcome === 'accepted') {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
  }

  const isActive = (href) => pathname === href

  /* ================= CART PULSE ================= */
  useEffect(() => {
    if (cartCount !== prevCartCount.current) {
      setPulse(true)
      prevCartCount.current = cartCount

      const timer = setTimeout(() => setPulse(false), 400)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  const desktopLinks = [
    { name: 'Home', href: '/' },
    { name: 'Product', href: '/product' },
    { name: 'Shop', href: '/shop' },
    // { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Orders', href: '/orders' },
  ]

  const mobileLinks = [
    { id: 'home', href: '/', icon: <HomeIcon size={18} />, label: 'Home' },
    { id: 'product', href: '/product', icon: <Search size={18} />, label: 'Product' },
    { id: 'shop', href: '/shop', icon: <Search size={18} />, label: 'Shop' },
    { id: 'orders', href: '/orders', icon: <PackageIcon size={18} />, label: 'Orders' },
    { id: 'cart', href: '/cart', icon: <ShoppingCart size={18} />, label: 'Cart' },
  ]

  return (
    <>
      {/* MOBILE TOP NAV */}
      <nav className="sm:hidden fixed top-0 inset-x-0 z-50 bg-black/70 backdrop-blur-2xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/app.png"
              alt="Nandurbar Bazar Logo"
              width={65}
              height={65}
              className="object-contain"
              priority
            />
          </Link>

          {!isTWA && (
            <a
              href="/apk/nandurbar-bazar.apk"
              download
              className="text-xs px-3 py-1 rounded-full bg-cyan-400 text-black font-medium"
            >
              Download App
            </a>
          )}

          {!user ? (
            <button
              onClick={openSignIn}
              className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
            >
              Login
            </button>
          ) : (
            <UserButton
              appearance={{
                elements: {
                  // This targets the avatar box itself
                  userButtonAvatarBox: "w-20 h-20 sm:w-20 sm:h-20 border-2 border-cyan-400/30",
                }
              }}
            />
          )}
        </div>
      </nav>

      {/* DESKTOP NAV */}

      <nav className="hidden sm:block fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="relative flex items-center">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16">
              <Image
                src="/app.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* The Prime badge positioning adjusted for the larger logo */}
            <Protect plan="prime">
              <span className="absolute -top-1 -right-4 text-[10px] px-2 py-0.5 bg-cyan-400 text-black rounded-full font-bold">
                prime
              </span>
            </Protect>
          </Link>

          <div className="flex items-center gap-6 text-white/70">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${isActive(link.href) ? 'text-cyan-400' : 'hover:text-cyan-400'}`}
              >
                {link.name}
              </Link>
            ))}

            <Link href="/cart" className="relative">
              <motion.div
                variants={cartPulse}
                animate={pulse ? 'active' : 'idle'}
                className="flex items-center gap-1"
              >
                <ShoppingCart size={18} />
                Cart
              </motion.div>

              {cartCount > 0 && (
                <span className="absolute -top-3 -right-4 text-xs px-2 py-0.5 rounded-full bg-cyan-400 text-black font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isTWA && (
              <a
                href="/apk/nandurbar-bazar.apk"
                download
                className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-medium"
              >
                Download App
              </a>
            )}

            {!user ? (
              <button
                onClick={openSignIn}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
              >
                Login
              </button>
            ) : (
              <div className="ml-2">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-20 h-20 sm:w-20 sm:h-20 border-2 border-cyan-400/30",
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-black/70 backdrop-blur-2xl border-t border-white/10">
        <div className="flex justify-around py-2 text-xs">
          {mobileLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`flex flex-col items-center gap-1 ${isActive(link.href) ? 'text-cyan-400' : 'text-white/70'
                }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <Menu size={18} />
            Menu
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60]"
            />

            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-72 bg-black z-[70] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg text-white">Menu</h2>
                <button onClick={() => setMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-white/80">
                {desktopLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                <Link href="/cart" onClick={() => setMenuOpen(false)}>
                  Cart ({cartCount})
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar