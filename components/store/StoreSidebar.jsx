'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const StoreSidebar = ({ storeInfo }) => {
    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ]

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <div className="hidden sm:inline-flex h-full flex-col gap-5 border-r border-slate-200 min-w-60 p-3">
                <div className="flex flex-col gap-3 justify-center items-center pt-8">
                    <Image
                        src={storeInfo?.logo}
                        alt=""
                        width={80}
                        height={80}
                        className="w-14 h-14 rounded-full shadow-md"
                    />
                    <p className="text-slate-700">{storeInfo?.name}</p>
                </div>

                <div className="mt-6 flex flex-col gap-1">
                    {sidebarLinks.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition
                                ${pathname === link.href ? 'bg-slate-100 text-slate-600' : ''}`}
                        >
                            <link.icon size={18} />
                            <p>{link.name}</p>
                            {pathname === link.href && (
                                <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 rounded-l"></span>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* MOBILE BOTTOM SIDEBAR */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-black/70 backdrop-blur-xl border-t border-white/10">
                <div className="flex justify-around py-2 text-xs">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center gap-1 text-white/70 ${pathname === link.href ? 'text-cyan-400' : ''}`}
                        >
                            <link.icon size={18} />
                            <span>{link.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}

export default StoreSidebar
