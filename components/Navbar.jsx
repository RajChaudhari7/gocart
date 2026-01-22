'use client'

import {
  PackageIcon,
  Search,
  ShoppingCart,
  Menu,
  X,
  HomeIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useUser, useClerk, UserButton, Protect } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'

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

/* ================= NAVBAR ================= */

const Navbar = () => {
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const router = useRouter()
  const pathname = usePathname()

  const cartCount = useSelector((state) => state.cart.total)

  const prevCartCount = useRef(cartCount)
  const [pulse, setPulse] = useState(false)

  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href) => pathname === href

  /* ===== CART PULSE ===== */
  useEffect(() => {
    if (cartCount !== prevCartCount.current) {
      setPulse(true)
      prevCartCount.current = cartCount
      const timer = setTimeout(() => setPulse(false), 400)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/shop?search=${search}`)
    setMenuOpen(false)
  }

  const desktopLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Orders', href: '/orders' },
  ]

  const mobileLinks = [
    { id: 'home', href: '/', icon: <HomeIcon size={18} />, label: 'Home' },
    { id: 'shop', href: '/shop', icon: <Search size={18} />, label: 'Shop' },
    { id: 'orders', href: '/orders', icon: <PackageIcon size={18} />, label: 'Orders' },
    { id: 'cart', href: '/cart', icon: <ShoppingCart size={18} />, label: 'Cart' },
  ]

  return (
    <>
      {/* ================= MOBILE TOP NAV ================= */}
      <nav className="sm:hidden sticky top-0 z-50
        bg-black/70 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">

          {/* LOGO */}
          <Link href="/" className="text-lg font-semibold text-white">
            <span className="text-cyan-400">Global</span>Mart
            <span className="text-cyan-400">.</span>
          </Link>

          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full"
          >
            <Search size={14} />
            <input
              className="bg-transparent outline-none text-sm w-24
              text-white placeholder-white/50"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* AUTH */}
          {!user ? (
            <button
              onClick={openSignIn}
              className="text-sm px-3 py-1.5 rounded-full
              bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
            >
              Login
            </button>
          ) : (
            <UserButton />
          )}
        </div>
      </nav>

      {/* ================= DESKTOP NAV ================= */}
      <nav className="hidden sm:block backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="relative text-2xl font-semibold text-white">
            <span className="text-cyan-400">Global</span>Mart
            <span className="text-cyan-400">.</span>
            <Protect plan="prime">
              <span
                className="absolute -top-2 -right-10 text-xs px-2 py-0.5
                bg-gradient-to-r from-cyan-400 to-emerald-400 text-black rounded-full"
              >
                prime
              </span>
            </Protect>
          </Link>

          {/* MENU */}
          <div className="flex items-center gap-6 text-white/70">

            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-2 py-1 transition
                ${isActive(link.href)
                    ? 'text-cyan-400'
                    : 'hover:text-cyan-400'
                  }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 w-full h-[2px]
                    bg-cyan-400 rounded"
                  />
                )}
              </Link>
            ))}

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center gap-2
              bg-white/10 px-4 py-2 rounded-full"
            >
              <Search size={16} />
              <input
                className="bg-transparent outline-none text-sm
                text-white placeholder-white/50"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* CART */}
            <Link href="/cart" className="relative">
              <motion.div
                variants={cartPulse}
                animate={pulse ? 'active' : 'idle'}
                className="flex items-center gap-1"
              >
                <ShoppingCart size={18} />
                Cart
              </motion.div>

              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="absolute -top-2 -right-3 text-xs px-1.5 rounded-full
                    bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* AUTH */}
            {!user ? (
              <button
                onClick={openSignIn}
                className="px-5 py-2 rounded-full
                bg-gradient-to-r from-cyan-400 to-emerald-400
                text-black font-medium"
              >
                Login
              </button>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </nav>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div
        className="sm:hidden fixed bottom-0 inset-x-0 z-50
        bg-black/70 backdrop-blur-xl border-t border-white/10"
      >
        <div className="flex justify-around py-2 text-xs">
          {mobileLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`relative flex flex-col items-center gap-1
              ${isActive(link.href)
                  ? 'text-cyan-400'
                  : 'text-white/70'
                }`}
            >
              {isActive(link.href) && (
                <motion.span
                  layoutId="mobile-active"
                  className="absolute -top-1 w-8 h-1 rounded-full
                  bg-gradient-to-r from-cyan-400 to-emerald-400"
                />
              )}

              <motion.div
                variants={cartPulse}
                animate={link.id === 'cart' && pulse ? 'active' : 'idle'}
              >
                {link.icon}
              </motion.div>

              {link.label}

              <AnimatePresence>
                {link.id === 'cart' && cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 right-2 text-[10px]
                    px-1 rounded-full
                    bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
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

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              className="fixed top-0 right-0 h-full w-72
              bg-black/90 backdrop-blur-xl z-50 p-6"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between mb-6">
                <h3 className="text-lg text-white font-semibold">Menu</h3>
                <button onClick={() => setMenuOpen(false)}>
                  <X size={22} className="text-white" />
                </button>
              </div>

              <div className="flex flex-col gap-5 text-white/70">
                {desktopLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
