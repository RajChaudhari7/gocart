'use client'

import { PackageIcon, Search, ShoppingCart, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSelector } from "react-redux"
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"

const drawerVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 25,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

const Navbar = () => {
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  const cartCount = useSelector(state => state.cart.total)

  const handleSearch = (e) => {
    e.preventDefault()
    router.push(`/shop?search=${search}`)
    setMenuOpen(false)
  }

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="relative text-3xl font-semibold text-slate-700">
            <span className="text-green-600">Global</span>Mart
            <span className="text-green-600 text-4xl">.</span>

            <Protect plan="prime">
              <span className="absolute -top-2 -right-10 text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">
                prime
              </span>
            </Protect>
          </Link>

          {/* DESKTOP MENU */}
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
                className="bg-transparent outline-none"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <Link href="/cart" className="relative flex items-center gap-1">
              <ShoppingCart size={18} />
              Cart
              <span className="absolute -top-2 left-4 text-xs bg-black text-white rounded-full px-1">
                {cartCount}
              </span>
            </Link>

            {!user ? (
              <button
                onClick={openSignIn}
                className="px-6 py-2 bg-indigo-500 text-white rounded-full"
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

          {/* MOBILE MENU BUTTON */}
          <button
            className="sm:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* DRAWER */}
            <motion.div
              className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg flex flex-col"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="text-lg font-semibold">Menu</h3>
                <button onClick={() => setMenuOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              {/* LINKS */}
              <div className="flex flex-col gap-5 px-6 py-6 text-slate-700">
                <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
                <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
                <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>

                <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                  <Search size={16} />
                  <input
                    className="bg-transparent outline-none w-full"
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
                    className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-full"
                  >
                    Login
                  </button>
                ) : (
                  <UserButton />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
