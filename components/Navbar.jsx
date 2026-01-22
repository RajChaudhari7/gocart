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
  visible: { y: 0 },
  hidden: { y: '-100%' },
}

const Navbar = () => {
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

  /* ===== HIDE ON SCROLL ===== */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScroll.current && window.scrollY > 80) {
        setShowNav(false)
      } else {
        setShowNav(true)
      }
      lastScroll.current = window.scrollY
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

  const suggestions = [
    'Wireless Earbuds',
    'Smart Watch',
    'Hoodies',
    'Headphones',
    'Gaming Mouse',
  ]

  return (
    <>
      {/* ================= TOP NAV ================= */}
      <motion.nav
        variants={navVariants}
        animate={showNav ? 'visible' : 'hidden'}
        className="fixed top-0 inset-x-0 z-40
        bg-black/70 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

          {/* LOGO */}
          <Link href="/" className="relative text-2xl font-semibold text-white">
            <span className="text-cyan-400">Global</span>Mart
            <span className="text-cyan-400">.</span>
            <Protect plan="prime">
              <span className="absolute -top-2 -right-10 text-xs px-2 py-0.5
                bg-gradient-to-r from-cyan-400 to-emerald-400 text-black rounded-full">
                prime
              </span>
            </Protect>
          </Link>

          {/* DESKTOP SEARCH */}
          <div className="relative hidden md:block w-72">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full px-4 py-2 rounded-full
              bg-white/10 text-white outline-none"
            />

            {/* SUGGESTIONS */}
            {search.length > 1 && (
              <div className="absolute top-11 w-full bg-black/90
              border border-white/10 rounded-xl overflow-hidden">
                {suggestions
                  .filter(item =>
                    item.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(item => (
                    <button
                      key={item}
                      onClick={() => handleSearch(item)}
                      className="w-full text-left px-4 py-3 hover:bg-white/10"
                    >
                      {item}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* AUTH */}
          <div className="hidden sm:flex gap-4 items-center">
            {!user ? (
              <button
                onClick={openSignIn}
                className="px-5 py-2 rounded-full
                bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
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
        bg-black/80 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-around py-2 text-xs text-white/70">
          {[
            { id: 'home', href: '/', icon: <HomeIcon size={18} />, label: 'Home' },
            { id: 'search', icon: <Search size={18} />, label: 'Search' },
            { id: 'cart', href: '/cart', icon: <ShoppingCart size={18} />, label: 'Cart' },
          ].map(item =>
            item.href ? (
              <Link key={item.id} href={item.href}
                className={`flex flex-col items-center gap-1
                ${pathname === item.href ? 'text-cyan-400' : ''}`}>
                {item.icon}
                {item.label}
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="absolute top-1 right-4 text-[10px]
                  bg-cyan-400 text-black px-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => setSearchOpen(true)}
                className="flex flex-col items-center gap-1"
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}

          <button onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-1">
            <Menu size={18} />
            Menu
          </button>
        </div>
      </div>

      {/* ================= MOBILE SEARCH MODAL ================= */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 p-6"
          >
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-3 rounded-xl
              bg-white/10 text-white outline-none"
            />
            <div className="mt-4 space-y-2">
              {suggestions
                .filter(i => i.toLowerCase().includes(search.toLowerCase()))
                .map(i => (
                  <button
                    key={i}
                    onClick={() => handleSearch(i)}
                    className="block w-full text-left px-4 py-3
                    bg-white/5 rounded-lg"
                  >
                    {i}
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-72
            bg-black/90 z-50 p-6"
          >
            <button onClick={() => setMenuOpen(false)}>
              <X size={22} />
            </button>
            <div className="mt-6 flex flex-col gap-4">
              <Link href="/">Home</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/orders">Orders</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
