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

const Navbar = () => {
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const router = useRouter()
  const pathname = usePathname()

  const cartCount = useSelector(
    (state) => state.cart?.total || state.cart?.items?.length || 0
  )
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

  /* ===== SEARCH HANDLERS ===== */
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)

    if (value.trim() === '') {
      router.push('/shop') // show all products if empty
    } else {
      router.push(`/shop?search=${encodeURIComponent(value.trim())}`)
    }
  }

  const handleSearchSubmit = (e) => e.preventDefault() // prevent page reload

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
      <nav className="sm:hidden fixed top-0 inset-x-0 z-50 bg-black/70 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,255,255,0.2)]">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-white">
            <span className="text-cyan-400">She</span>Kart<span className="text-cyan-400">.</span>
          </Link>

          {/* MOBILE SEARCH */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 bg-white/10 focus-within:bg-white/20 px-3 py-1.5 rounded-full transition-colors duration-300"
          >
            <Search size={14} className="text-white/70" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={handleSearchChange}
              className="bg-transparent outline-none text-sm w-24 text-white placeholder-white/50
                focus:w-36 transition-all duration-300"
            />
          </form>

          {!user ? (
            <button
              onClick={openSignIn}
              className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.8)]"
            >
              Login
            </button>
          ) : (
            <UserButton />
          )}
        </div>
      </nav>

      {/* ================= DESKTOP NAV ================= */}
      <nav className="hidden sm:block fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/10 shadow-[0_10px_40px_rgba(0,255,255,0.15)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="relative text-2xl font-semibold text-white">
            <span className="text-cyan-400">She</span>Kart<span className="text-cyan-400">.</span>
            <Protect plan="prime">
              <span className="absolute -top-2 -right-10 text-xs px-2 py-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black rounded-full shadow-[0_0_15px_rgba(34,211,238,0.9)]">
                prime
              </span>
            </Protect>
          </Link>

          <div className="flex items-center gap-6 text-white/70">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-2 py-1 transition hover:-translate-y-[1px] hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] ${
                  isActive(link.href) ? 'text-cyan-400' : 'hover:text-cyan-400'
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-400 rounded shadow-[0_0_10px_rgba(34,211,238,1)]"
                  />
                )}
              </Link>
            ))}

            {/* DESKTOP SEARCH */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden xl:flex items-center gap-2 bg-white/10 focus-within:bg-white/20 px-4 py-2 rounded-full transition-colors duration-300 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
            >
              <Search size={16} className="text-white/70" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearchChange}
                className="bg-transparent outline-none text-sm text-white placeholder-white/50 focus:w-64 w-40 transition-all duration-300"
              />
            </form>

            {/* CART */}
            <Link href="/cart" className="relative">
              <motion.div
                variants={cartPulse}
                animate={pulse ? 'active' : 'idle'}
                className="flex items-center gap-1 hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]"
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
                    className="absolute -top-3 -right-4 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.9)] font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {!user ? (
              <button
                onClick={openSignIn}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-medium shadow-[0_0_20px_rgba(34,211,238,0.9)]"
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
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-black/70 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_30px_rgba(0,255,255,0.2)]">
        <div className="flex justify-around py-2 text-xs">
          {mobileLinks.map((link) => {
            const isCart = link.id === 'cart'
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`relative flex flex-col items-center gap-1 ${
                  isActive(link.href)
                    ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,1)]'
                    : 'text-white/70'
                }`}
              >
                {isCart ? (
                  <motion.div variants={cartPulse} animate={pulse ? 'active' : 'idle'} className="flex flex-col items-center gap-1">
                    {link.icon}
                    {link.label}
                  </motion.div>
                ) : (
                  <>
                    {link.icon}
                    {link.label}
                  </>
                )}
                {isCart && cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-2 text-[10px] px-1 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            )
          })}

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-white/70 hover:text-cyan-400"
          >
            <Menu size={18} />
            Menu
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER MENU ================= */}
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
              className="fixed top-0 right-0 h-full w-72 bg-black/90 backdrop-blur-2xl z-[70] border-l border-white/10 shadow-[-10px_0_40px_rgba(0,255,255,0.2)] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
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
                    className="py-2 px-3 rounded-lg hover:bg-white/10 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-white/10 hover:text-cyan-400 transition"
                >
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
