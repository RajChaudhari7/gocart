'use client'

import {
  Search,
  ShoppingCart,
  HomeIcon,
  PackageIcon,
  Info,
  Phone,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useUser, useClerk, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const cartCount = useSelector(state => state.cart.total)

  const [search, setSearch] = useState('')

  const handleSearch = e => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/shop?search=${search}`)
      setSearch('')
    }
  }

  const breadcrumbMap = {
    shop: 'Shop',
    orders: 'Orders',
    about: 'About',
    contact: 'Contact',
  }

  return (
    <>
      {/* ================= TOP NAV ================= */}
      <nav className="fixed top-0 inset-x-0 z-50
        bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4
          flex items-center justify-between gap-4">

          {/* LOGO */}
          <Link href="/" className="text-2xl font-semibold text-white">
            <span className="text-cyan-400">Global</span>Mart
            <span className="text-cyan-400">.</span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <Link href="/" className="hover:text-cyan-400">Home</Link>
            <Link href="/shop" className="hover:text-cyan-400">Shop</Link>
            <Link href="/orders" className="hover:text-cyan-400">Orders</Link>
            <Link href="/about" className="hover:text-cyan-400">About</Link>
            <Link href="/contact" className="hover:text-cyan-400">Contact</Link>
          </div>

          {/* SEARCH */}
          <div className="relative hidden md:block w-72">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search products"
              className="w-full pl-10 pr-4 py-2 rounded-full
              bg-white/10 text-white placeholder-white/40 outline-none"
            />
          </div>

          {/* CART + AUTH */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative text-white">
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
                className="hidden sm:block px-5 py-2 rounded-full
                bg-gradient-to-r from-cyan-400 to-emerald-400
                text-black font-medium">
                Sign in
              </button>
            ) : (
              <UserButton />
            )}
          </div>
        </div>

        {/* BREADCRUMB */}
        {pathname !== '/' && (
          <div className="max-w-7xl mx-auto px-4 py-2
            text-sm text-white/50">
            <Link href="/" className="hover:text-cyan-400">
              Home
            </Link>
            {pathname.split('/').map((seg, i) =>
              seg && (
                <span key={i}>
                  {' / '}
                  <span className="text-white">
                    {breadcrumbMap[seg] || seg}
                  </span>
                </span>
              )
            )}
          </div>
        )}
      </nav>

      {/* ================= MOBILE TOP SEARCH ================= */}
      <div className="md:hidden fixed top-[72px] inset-x-0 z-40
        px-4 py-3 bg-black/80 backdrop-blur border-b border-white/10">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search products"
          className="w-full px-4 py-3 rounded-xl
          bg-white/10 text-white placeholder-white/40 outline-none"
        />
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50
        bg-black/90 backdrop-blur border-t border-white/10">
        <div className="flex justify-around py-2 text-xs text-white/70">

          <Link href="/" className="flex flex-col items-center gap-1">
            <HomeIcon size={18} />
            Home
          </Link>

          <Link href="/shop" className="flex flex-col items-center gap-1">
            <PackageIcon size={18} />
            Shop
          </Link>

          <Link href="/cart" className="relative flex flex-col items-center gap-1">
            <ShoppingCart size={18} />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1 right-3 text-[10px]
                bg-cyan-400 text-black px-1 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          <Link href="/orders" className="flex flex-col items-center gap-1">
            <PackageIcon size={18} />
            Orders
          </Link>
        </div>
      </div>

      {/* SPACERS */}
      <div className="h-[140px] md:h-[96px]" />
      <div className="md:hidden h-16" />
    </>
  )
}
