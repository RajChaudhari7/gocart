'use client'
import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"

const StoreNavbar = () => {
    const { user } = useUser()

    return (
        <div className="flex items-center justify-between px-4 sm:px-12 py-2 sm:py-3 border-b border-slate-200 backdrop-blur-xl bg-black/60">
            <Link href="/" className="relative text-2xl sm:text-4xl font-semibold text-slate-700">
                <span className="text-cyan-400">Global</span>Mart
                <span className="text-cyan-400 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-cyan-500">
                    Store
                </p>
            </Link>

            <div className="flex items-center gap-3">
                <p className="text-white/80 hidden sm:block">Hi, {user?.firstName}</p>
                <UserButton />
            </div>
        </div>
    )
}

export default StoreNavbar
