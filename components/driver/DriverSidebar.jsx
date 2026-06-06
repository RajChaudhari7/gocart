'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Package,
    Clock3,
    User
} from "lucide-react"

export default function DriverSidebar() {

    const pathname = usePathname()

    const links = [
        {
            name: "Dashboard",
            href: "/driver",
            icon: Home
        },
        {
            name: "Orders",
            href: "/driver/orders",
            icon: Package
        },
        {
            name: "History",
            href: "/driver/history",
            icon: Clock3
        },
        {
            name: "Profile",
            href: "/driver/profile",
            icon: User
        }
    ]

    return (
        <aside className="w-64 h-screen border-r bg-white">

            <h1 className="p-5 text-xl font-bold">
                Driver Panel
            </h1>

            {links.map(link => {

                const Icon = link.icon

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-5 py-3
                        ${pathname === link.href
                                ? "bg-green-100 text-green-700"
                                : ""
                            }`}
                    >
                        <Icon size={18} />
                        {link.name}
                    </Link>
                )

            })}
        </aside>
    )
}