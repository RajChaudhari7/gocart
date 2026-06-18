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
        <>
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-100 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40">

                <div className="p-6 mb-2">
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                        <span className="bg-green-600 text-white p-1.5 rounded-lg">
                            <Package size={20} strokeWidth={2.5} />
                        </span>
                        Driver<span className="text-green-600">App</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {links.map(link => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium
                                    ${isActive
                                        ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={isActive ? "text-white" : "text-gray-400"}
                                />
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation (Hidden on Desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)]">
                <div className="flex justify-around items-center h-16 px-2">
                    {links.map(link => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex flex-col items-center justify-center w-full h-full relative"
                            >
                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <span className="absolute top-0 w-8 h-1 bg-green-600 rounded-b-full"></span>
                                )}

                                <div className={`flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'translate-y-[-2px]' : ''}`}>
                                    <Icon
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={isActive ? "text-green-600" : "text-gray-400"}
                                    />
                                    <span className={`text-[10px] font-medium ${isActive ? "text-green-600" : "text-gray-500"}`}>
                                        {link.name}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}