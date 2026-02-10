'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const StoreSidebar = ({ storeInfo, pendingOrdersCount = 0 }) => {
  const pathname = usePathname()

  const sidebarLinks = [
    { name: 'Dashboard', href: '/store', icon: HomeIcon },
    { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
    { name: 'Manage Products', href: '/store/manage-product', icon: SquarePenIcon },
    { name: 'Orders', href: '/store/orders', icon: LayoutListIcon, badge: pendingOrdersCount },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
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
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                `}
              >
                <Icon size={18} />
                <span className="flex-1">{link.name}</span>
                {link.badge > 0 && (
                  <span className="min-w-[20px] px-1.5 py-0.5 text-xs font-medium rounded-full bg-emerald-500 text-black text-center">
                    {link.badge}
                  </span>
                )}
                {active && <span className="w-1.5 h-6 bg-emerald-400 rounded-full ml-2" />}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navbar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-around py-2">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center gap-1 text-xs transition ${active ? 'text-emerald-400' : 'text-white/60'}`}
              >
                <Icon size={18} />
                {link.badge > 0 && (
                  <span className="absolute -top-1 -right-3 bg-emerald-500 text-black text-[10px] px-1.5 rounded-full">
                    {link.badge}
                  </span>
                )}
                <span>{link.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default StoreSidebar
