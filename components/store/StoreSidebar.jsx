'use client'

import { usePathname } from "next/navigation"
import {
  HomeIcon,
  LayoutListIcon,
  SquarePenIcon,
  SquarePlusIcon,
  Menu,
  X
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const StoreSidebar = ({ storeInfo, pendingOrdersCount = 0 }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const sidebarLinks = [
    { name: 'Dashboard', href: '/store', icon: HomeIcon },
    { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
    { name: 'Manage Products', href: '/store/manage-product', icon: SquarePenIcon },
    {
      name: 'Orders',
      href: '/store/orders',
      icon: LayoutListIcon,
      badge: pendingOrdersCount
    },
  ]

  return (
    <>
      {/* ================= DESKTOP SIDEBAR (UNCHANGED) ================= */}
      <aside className="hidden sm:flex h-full w-64 flex-col bg-black border-r border-white/10">
        <div className="flex flex-col items-center gap-3 py-8 border-b border-white/10">
          <Image
            src={storeInfo?.logo || "/placeholder.png"}
            alt="Store logo"
            width={64}
            height={64}
            className="rounded-full border border-white/20"
          />
          <p className="text-sm font-medium text-white">{storeInfo?.name}</p>
          <span className="text-xs text-white/50">Seller Panel</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  ${active
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'}
                `}
              >
                <Icon size={18} />
                <span className="flex-1">{link.name}</span>

                {link.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-black">
                    {link.badge}
                  </span>
                )}

                {active && (
                  <span className="w-1.5 h-6 bg-emerald-400 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ================= MOBILE HAMBURGER ================= */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setOpen(true)}
          className="p-3 rounded-full bg-black text-white border border-white/10"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ================= MOBILE MENU DRAWER ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="sm:hidden fixed inset-0 z-50 bg-black"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Image
                  src={storeInfo?.logo || "/placeholder.png"}
                  alt="Store logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm text-white font-medium">
                    {storeInfo?.name}
                  </p>
                  <span className="text-xs text-white/50">Seller Panel</span>
                </div>
              </div>

              <button onClick={() => setOpen(false)}>
                <X size={22} className="text-white" />
              </button>
            </div>

            {/* Links */}
            <nav className="p-4 space-y-2">
              {sidebarLinks.map((link) => {
                const active = pathname === link.href
                const Icon = link.icon

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      ${active
                        ? 'bg-white/10 text-emerald-400'
                        : 'text-white/70 hover:bg-white/5'}
                    `}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{link.name}</span>

                    {link.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-black">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default StoreSidebar
