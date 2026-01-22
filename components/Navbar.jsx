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

const navVariants = {
  hidden: { y: -100 },
  visible: {
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

export default function Navbar() {
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const cartCount = useSelector(state => state.cart.total)

  const [showNav, setShowNav] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const lastScroll = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      if (current > lastScroll.current && current > 80) {
        setShowNav(false)
      } else {
        setShowNav(true)
      }
      lastScroll.current = current
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (value) => {
    if (!value.trim()) return
    router.push(`/shop?search=${value}`)
    setSearch('')
    setSearchOpen(false)
  }

  return (
    <>
      {/* ================= TOP NAV ================= */}
      <motion.nav
        variants={navVariants}
        initial="visible"
        animate={showNav ? 'visible' : 'hidden'}
        className="fixed top-0 inset-x-0 z-50
        bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4
        flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="relative text-2xl font-semibold">
            <span className="text-cyan-400">Global</span>Mart
            <span className="text-cyan-400">.</span>

            <Protect plan="prime">
              <span className="absolute -top-2 -right-10 text-xs px-2 py-0.5
              bg-gradient-to-r from-cyan-400 to-emerald-400
              text-black rounded-full">
                prime
              </span>
            </Protect>
          </Link>

          {/* DESKTOP SEARCH */}
          <div className="hidden md:block relative w-80">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full px-4 py-2 rounded-full
              bg-white/10 text-white
              placeholder-white/40
              caret-cyan-400
              outline-none"
            />
          </div>

          {/* AUTH */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 text-xs
                bg-cyan-400 text-black px-1.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

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
      </motion.nav>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50
      bg-black/90 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-around py-2 text-xs">

          {[
            { href: '/', icon: <HomeIcon size={18} />, label: 'Home' },
            { icon: <Search size={18} />, label: 'Search', action: () => setSearchOpen(true) },
            { href: '/cart', icon: <ShoppingCart size={18} />, label: 'Cart' },
          ].map((item, i) =>
            item.href ? (
              <Link
                key={i}
                href={item.href}
                className={`relative flex flex-col items-center gap-1
                ${pathname === item.href ? 'text-cyan-400' : 'text-white/70'}`}
              >
                {item.icon}
                {item.label}
                {item.label === 'Cart' && cartCount > 0 && (
                  <span className="absolute -top-1 right-2 text-[10px]
                  bg-cyan-400 text-black px-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : (
              <button
                key={i}
                onClick={item.action}
                className="flex flex-col items-center gap-1 text-white/70"
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <Menu size={18} />
            Menu
          </button>
        </div>
      </div>

      {/* ================= MOBILE SEARCH ================= */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 p-6"
          >
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-3 rounded-xl
              bg-white/10 text-white
              placeholder-white/40 outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
