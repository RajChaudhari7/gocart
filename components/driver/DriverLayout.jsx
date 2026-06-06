'use client'

import DriverNavbar from "./DriverNavbar"
import DriverSidebar from "./DriverSidebar"

export default function DriverLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">

            {/* Top Navbar */}
            <DriverNavbar />

            {/* Body */}
            <div className="flex">

                {/* Sidebar */}
                <DriverSidebar />

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>

            </div>

        </div>
    )
}