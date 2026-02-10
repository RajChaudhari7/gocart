'use client'

import { usePathname } from "next/navigation"
import {
  HomeIcon,
  ShieldCheckIcon,
  StoreIcon,
  TicketPercentIcon
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

const AdminSidebar = () => {
  const { user } = useUser()
  const pathname = usePathname()

  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Stores', href: '/admin/stores', icon: StoreIcon },
    { name: 'Approve', href: '/admin/approve', icon: ShieldCheckIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon },
  ]

  if (!user) return null

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden sm:flex h-full min-w-60 flex-col gap-5 border-r border-slate-200">
        {/* ADMIN INFO */}
        <div className="flex flex-col gap-3 justify-center items-center pt-8">
          <Image
            className="w-14 h-14 rounded-full"
            src={user.imageUrl}
            alt="Admin"
            width={80}
            height={80}
          />
          <p className="text-slate-700 text-sm">
            Hi, {user.fullName}
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-4">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative flex items-center gap-3 p-2.5 text-sm transition
                  ${active
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-slate-500 hover:bg-slate-50'}
                `}
              >
                <Icon size={18} className="ml-5" />
                <span>{link.name}</span>

                {active && (
                  <span className="absolute right-0 top-1.5 bottom-1.5 w-1.5 bg-green-500 rounded-l" />
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200">
        <div className="flex justify-around py-2">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-1 px-3"
              >
                {/* ICON */}
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition
                    ${active
                      ? 'bg-green-100 text-green-600'
                      : 'text-slate-500'}
                  `}
                >
                  <Icon size={20} />
                </div>

                {/* LABEL */}
                <span
                  className={`
                    text-[11px] font-medium
                    ${active ? 'text-green-600' : 'text-slate-500'}
                  `}
                >
                  {link.name}
                </span>

                {/* ACTIVE DOT */}
                {active && (
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
