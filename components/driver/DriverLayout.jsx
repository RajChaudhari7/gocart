'use client'

import { usePathname, useRouter } from "next/navigation"
import DriverNavbar from "./DriverNavbar"
import DriverSidebar from "./DriverSidebar"
import { useEffect } from "react"

export default function DriverLayout({ children }) {

    const router = useRouter()

    useEffect(() => {

        const driver = localStorage.getItem("driver")

        if (!driver) {
            router.replace("/driver/login")
        }

    }, [])

    return (
        <div className="min-h-screen bg-slate-50">

            <DriverNavbar />

            <div className="flex">
                <DriverSidebar />

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>

        </div>
    )
}