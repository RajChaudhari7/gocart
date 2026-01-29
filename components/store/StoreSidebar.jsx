'use client'

import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PackagePlus,
  Settings2,
  ClipboardList,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const StoreSidebar = ({ storeInfo, pendingOrdersCount = 0 }) => {
  const pathname = usePathname()

  const sidebarLinks = [
    { name: 'Dashboard', href: '/store', icon: LayoutDashboard },
    { name: 'Add Product', href: '/store/add-product', icon: PackagePlus },
    { name: 'Products', href: '/store/manage-product', icon: Settings2 },
    {
      name: 'Orders',
      href: '/store/orders',
      icon: ClipboardList,
      badge: pendingOrdersCount
    },
  ]

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex h-screen w-72 flex-col bg-[#050505] border-r border-white/5 sticky top-0 left-0">
        
        {/* Brand/Store Header */}
        <div className="p-8">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <Image
                src={storeInfo?.logo || "/placeholder.png"}
                alt="Store logo"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
                {storeInfo?.name || "Merchant Pro"}
              </h2>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                Premium Store
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="flex-1 px-4 space-y-1.5">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300",
                  active 
                    ? "bg-white/[0.04] text-white" 
                    : "text-zinc-500 hover:text-white hover:bg-white/[0.02]"
                )}
              >
                <Icon 
                  size={20} 
                  className={cn(
                    "transition-all duration-300",
                    active ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "group-hover:text-zinc-300"
                  )} 
                />
                <span className="text-sm font-medium tracking-wide">{link.name}</span>

                {link.badge > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-black">
                    {link.badge}
                  </span>
                )}

                {active && (
                  <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Footer */}
        <div className="p-6">
          <div className="rounded-2xl bg-gradient-to-b from-zinc-900 to-black p-4 border border-white/5">
            <p className="text-[11px] text-zinc-500 text-center font-medium">
              Logged in as Admin
            </p>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE FLOATING DOCK ================= */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-50 px-4">
        <nav className="mx-auto flex max-w-sm items-center justify-between gap-1 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center py-2.5 rounded-[20px] transition-all duration-300",
                  active ? "text-emerald-400 bg-white/[0.05]" : "text-zinc-500"
                )}
              >
                <Icon 
                   size={22} 
                   strokeWidth={active ? 2.5 : 2} 
                   className={cn(active && "drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]")}
                />
                
                {link.badge > 0 && (
                  <span className="absolute top-1.5 right-1/4 translate-x-1 flex h-4 w-4 items-center justify-center bg-emerald-500 text-[9px] font-black text-black rounded-full ring-2 ring-black">
                    {link.badge}
                  </span>
                )}
                <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">
                  {link.name.split(' ')[0]} {/* Shortens "Add Product" to "Add" for mobile */}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Spacer to prevent content overlap */}
      <div className="md:hidden h-28" />
    </>
  )
}

export default StoreSidebar