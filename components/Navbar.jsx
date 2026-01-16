'use client'

import {
    PackageIcon,
    Search,
    ShoppingCart,
    Menu,
    X,
    HomeIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useSelector } from "react-redux"
import { useUser, useClerk, UserButton, Protect } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"

const drawerVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 25 } },
    exit: { x: "100%", opacity: 0, transition: { duration: 0.2 } },
}

const Navbar = () => {
    const { user } = useUser()
    const { openSignIn } = useClerk()
    const router = useRouter()
    const pathname = usePathname() // For active tab

    const [search, setSearch] = useState("")
    const [menuOpen, setMenuOpen] = useState(false)

    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        if (!search.trim()) return
        router.push(`/shop?search=${search}`)
        setMenuOpen(false)
    }

    const desktopLinks = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Orders", href: "/orders" },
    ]

    const mobileLinks = [
        { id: "home", href: "/", icon: <HomeIcon size={18} />, label: "Home" },
        { id: "shop", href: "/shop", icon: <Search size={18} />, label: "Shop" },
        { id: "orders", href: "/orders", icon: <PackageIcon size={18} />, label: "Orders" },
        { id: "cart", href: "/cart", icon: <ShoppingCart size={18} />, label: "Cart" },
    ]

    return (
        <>
            {/* ================= DESKTOP NAVBAR ================= */}
            <nav className="hidden sm:block bg-white border-b">
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

                    {/* MENU */}
                    <div className="flex items-center gap-6 text-slate-600">
                        {desktopLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-2 py-1 ${pathname === link.href ? "text-green-600 font-semibold" : "hover:text-green-600"
                                    }`}
                            >
                                {link.name}
                                {pathname === link.href && (
                                    <motion.span
                                        layoutId="underline"
                                        className="absolute bottom-0 left-0 w-full h-[2px] bg-green-600 rounded"
                                    />
                                )}
                            </Link>
                        ))}

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
                            {cartCount > 0 && (
                                <span className="absolute -top-2 left-4 text-xs bg-black text-white rounded-full px-1">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {!user ? (
                            <button
                                onClick={openSignIn}
                                className="px-6 py-2 bg-indigo-500 text-white rounded-full"
                            >
                                Login
                            </button>
                        ) : (
                            <UserButton />
                        )}
                    </div>
                </div>
            </nav>

            {/* ================= MOBILE TOP NAV ================= */}
            <div className="sm:hidden sticky top-0 z-50 bg-white border-b">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* LOGO */}
                    <Link href="/" className="text-xl font-semibold text-slate-700">
                        <span className="text-green-600">Global</span>Mart
                        <span className="text-green-600">.</span>
                    </Link>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch} className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full">
                            <Search size={16} />
                            <input
                                className="bg-transparent outline-none w-24 text-sm"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>

                        {!user ? (
                            <button
                                onClick={openSignIn}
                                className="text-sm font-medium text-indigo-600"
                            >
                                Login
                            </button>
                        ) : (
                            <UserButton />
                        )}
                    </div>
                </div>
            </div>


            {/* ================= MOBILE BOTTOM NAV ================= */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t">
                <div className="flex justify-around items-center py-2 text-xs text-slate-600 relative">
                    {mobileLinks.map(link => (
                        <Link
                            key={link.id}
                            href={link.href}
                            className="flex flex-col items-center gap-1 relative text-slate-600"
                        >
                            {link.icon}
                            {link.label}
                            {pathname === link.href && (
                                <motion.span
                                    layoutId="mobileIndicator"
                                    className="absolute -top-1 h-1 w-6 bg-green-600 rounded"
                                />
                            )}
                            {link.id === "cart" && cartCount > 0 && (
                                <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    ))}

                    <button
                        onClick={() => setMenuOpen(true)}
                        className="flex flex-col items-center gap-1"
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
                            className="fixed inset-0 bg-black/40 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMenuOpen(false)}
                        />

                        <motion.div
                            className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg flex flex-col"
                            variants={drawerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b">
                                <h3 className="text-lg font-semibold">Menu</h3>
                                <button onClick={() => setMenuOpen(false)}>
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-5 px-6 py-6 text-slate-700">
                                {desktopLinks.map(link => (
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
