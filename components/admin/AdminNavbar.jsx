'use client'
import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"

const AdminNavbar = () => {
    const { user } = useUser()

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/" className="group flex items-center gap-2">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Global<span className="text-emerald-600">Mart</span>
                    </h1>
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            Administrative Portal
                        </span>
                    </div>
                </div>
            </Link>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6">
                {/* Status Indicator (Optional but Premium) */}
                <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                   <p className="text-sm font-medium text-slate-600">
                        <span className="text-slate-400 font-normal">System:</span> <span className="text-emerald-600">Optimal</span>
                   </p>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 leading-none">
                            {user?.firstName || 'Admin'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                    
                    <div className="p-0.5 rounded-full border-2 border-emerald-100 hover:border-emerald-500 transition-colors">
                        <UserButton 
                            afterSignOutUrl="/" 
                            appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9"
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default AdminNavbar