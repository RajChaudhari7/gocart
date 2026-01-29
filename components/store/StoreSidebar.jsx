'use client'

import { usePathname } from "next/navigation"
import { LayoutDashboard, PackagePlus, Settings2, ClipboardList } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "../../lib/utils"

const StoreSidebar = ({ storeInfo, pendingOrdersCount = 0 }) => {
  const pathname = usePathname()

  const sidebarLinks = [
    { name: 'Dashboard', href: '/store', icon: LayoutDashboard },
    { name: 'Add Product', href: '/store/add-product', icon: PackagePlus },
    { name: 'Products', href: '/store/manage-product', icon: Settings2 },
    { name: 'Orders', href: '/store/orders', icon: ClipboardList, badge: pendingOrdersCount },
  ]

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex h-screen w-72 flex-col bg-[#09090b] border-r border-white/5 sticky top-0 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={storeInfo?.logo || "/placeholder.png"}
                alt="Store logo"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col truncate">
              <h2 className="text-sm font-semibold text-white truncate">
                {storeInfo?.name || "Merchant Pro"}
              </h2>
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                Active Store
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  active ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{link.name}</span>
                {link.badge > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ================= MOBILE FLOATING DOCK ================= */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-[100] px-6">
        <nav className="mx-auto flex max-w-[280px] items-center justify-around bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex p-3 rounded-full transition-all",
                  active ? "text-emerald-400 bg-emerald-400/10" : "text-zinc-500"
                )}
              >
                <Icon size={22} />
                {link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-emerald-500 text-[9px] font-bold text-black rounded-full ring-2 ring-black">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export default StoreSidebar