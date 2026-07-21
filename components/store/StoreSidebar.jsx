'use client'

import { usePathname } from "next/navigation"
import {
  BarChart3Icon,
  HomeIcon,
  LayoutListIcon,
  SquarePenIcon,
  SquarePlusIcon,
  TruckIcon,
  UsersIcon,

} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const StoreSidebar = ({ storeInfo, pendingOrdersCount = 0 }) => {
  const pathname = usePathname()

  const sidebarLinks = [
    { name: 'Dashboard', href: '/store', icon: HomeIcon },
    { name: "Followers", href: "/store/followers", icon: UsersIcon, },
    { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
    { name: 'Manage Products', href: '/store/manage-product', icon: SquarePenIcon },
    { name: "Product Analytics", href: "/store/product-analytics", icon: BarChart3Icon },
    { name: 'Pending Orders', href: '/store/orders', icon: LayoutListIcon, badge: pendingOrdersCount },
    { name: 'Delivered Orders', href: '/store/delivered-orders', icon: TruckIcon },
  ]

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden h-full w-64 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-black sm:flex">

        <div className="shrink-0 border-b border-white/10 py-8">
          <div className="flex flex-col items-center gap-3">
            <Image
              src={storeInfo?.logo || "/placeholder.png"}
              alt="Store logo"
              width={64}
              height={64}
              className="rounded-full border border-white/20"
            />

            <p className="text-sm font-medium text-white">
              {storeInfo?.name}
            </p>

            <span className="text-xs text-white/50">
              Seller Panel
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
            group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
            transition-all duration-200
            ${active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                  }
          `}
              >
                <Icon size={18} />

                <span className="flex-1">
                  {link.name}
                </span>

                {link.badge > 0 && (
                  <span className="min-w-[20px] rounded-full bg-emerald-500 px-1.5 py-0.5 text-center text-xs font-medium text-black">
                    {link.badge}
                  </span>
                )}

                {active && (
                  <span className="ml-2 h-6 w-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-black border-t border-white/10">
        <div className="flex justify-around py-2">

          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center gap-1 px-2 relative"
              >

                {/* ICON */}
                <div
                  className={`
              relative flex items-center justify-center w-10 h-10 rounded-full transition
              ${active
                      ? 'bg-emerald-500 text-black'
                      : 'text-white/60'}
            `}
                >
                  <Icon size={20} />

                  {/* BADGE */}
                  {link.badge > 0 && (
                    <span className="
                absolute -top-1 -right-1
                min-w-[18px] px-1 text-[10px] font-bold
                rounded-full bg-red-500 text-white text-center
              ">
                      {link.badge}
                    </span>
                  )}
                </div>

                {/* LABEL */}
                <span
                  className={`
              text-[10px] font-medium
              ${active ? 'text-emerald-400' : 'text-white/60'}
            `}
                >
                  {link.name}
                </span>

                {/* ACTIVE DOT */}
                {active && (
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5" />
                )}
              </Link>
            )
          })}

        </div>
      </div>


    </>
  )
}

export default StoreSidebar
