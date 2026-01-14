'use client'

import { PackageIcon, Search, ShoppingCart, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSelector } from "react-redux"
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs"

const Navbar = () => {
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  const cartCount = useSelector((state) => state.cart.total)

  const handleSearch = (e) => {
    e.preventDefault()
    router.push(`/shop?search=${search}`)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="relative bg-white z-50">
        <div className="mx-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto py-4">

            {/* Logo */}
            <Link href="/" className="relative text-3xl font-semibold text-slate-700">
              <span className="text-green-600">Global</span>Mart
              <span className="text-green-600 text-4xl">.</span>

              <Protect plan="prime">
                <p className="absolute text-[10px] font-semibold -top-1 -right-8 px-3 py-0.5 rounded-full text-white bg-green-500">
                  prime
                </p>
              </Protect>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-6 text-slate-600">
              <Link href="/">Home</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>

              <form
                onSubmit={handleSearch}
                className="hidden xl:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full"
              >
                <Search size={18} />
                <input
                  className="bg-transparent outline-none text-sm"
                  placeholder="Search products"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>

              <Link href="/cart" className="relative flex items-center gap-2">
                <ShoppingCart size={18} />
                Cart
                <span className="absolute -top-1 left-3 text-[9px] text-white bg-slate-600 rounded-full px-1">
                  {cartCount}
                </span>
              </Link>

              {!user ? (
                <button
                  onClick={openSignIn}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full"
                >
                  Login
                </button>
              ) : (
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      labelIcon={<PackageIcon size={16} />}
                      label="My Orders"
                      onClick={() => router.push("/orders")}
                    />
                    <UserButton.Action
                      labelIcon={<ShoppingCart size={16} />}
                      label="Cart"
                      onClick={() => router.push("/cart")}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="sm:hidden"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
        <hr />
      </nav>

      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out
        ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Menu</h3>
          <button onClick={() => setMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-6 text-slate-700">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>

          <form onSubmit={handleSearch}>
            <input
              className="w-full border px-3 py-2 rounded-lg"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Cart ({cartCount})
          </Link>

          {!user ? (
            <button
              onClick={openSignIn}
              className="w-full py-2 bg-indigo-500 text-white rounded-lg"
            >
              Login
            </button>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
