'use client'
import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { BellDot } from "lucide-react"
import { useOrderStore } from "@/hooks/use-order-store"

const StoreNavbar = () => {
    const { user } = useUser()
    const { orderCount } = useOrderStore()

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between">

                {/* Brand Logo */}
                <Link href="/" className="group relative flex items-center gap-1">
                    <div className="absolute -inset-2 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-white">
                        She<span className="text-cyan-400">Kart</span>
                        <span className="text-cyan-400">.</span>
                    </h1>
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter bg-cyan-500 text-black rounded-sm">
                        Store
                    </span>
                </Link>

                {/* Right Section */}
                <div className="flex items-center gap-6">

                    {/* 🔔 Order Notification */}
                    <Link 
                        href="/store/orders"
                        className="relative group flex items-center"
                    >
                        <BellDot 
                            size={24} 
                            className={orderCount > 0 
                                ? "text-cyan-400 animate-pulse" 
                                : "text-white/60"
                            } 
                        />

                        {orderCount > 0 && (
                            <>
                                {/* Badge */}
                                <span className="absolute -top-2 -right-2 bg-cyan-500 text-[10px] text-black font-black h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-[#0a0a0a]">
                                    {orderCount > 9 ? '9+' : orderCount}
                                </span>

                                {/* Pulse ring */}
                                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-cyan-400 opacity-30 animate-ping"></span>
                            </>
                        )}

                        {/* Tooltip */}
                        <div className="absolute top-8 right-0 hidden group-hover:block text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                            {orderCount > 0 ? "New Orders Available" : "No New Orders"}
                        </div>
                    </Link>

                    {/* User Profile */}
                    <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none mb-1">
                                Member
                            </span>
                            <p className="text-sm font-medium text-white/90">
                                {user?.firstName || 'Guest'}
                            </p>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-40 group-hover:opacity-100 blur transition duration-300"></div>
                            
                            <div className="relative">
                                <UserButton 
                                    appearance={{
                                        elements: {
                                            avatarBox: "h-9 w-9 border border-white/20 hover:border-cyan-500 transition-colors"
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    )
}

export default StoreNavbar