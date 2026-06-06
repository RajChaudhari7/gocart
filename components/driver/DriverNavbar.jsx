'use client'

import { useEffect, useState } from "react"
import { LogOut, Truck } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function DriverNavbar() {

    const [driver, setDriver] = useState(null)
    const router = useRouter()

    useEffect(() => {

        const storedDriver = localStorage.getItem("driver")

        if (storedDriver) {
            setDriver(JSON.parse(storedDriver))
        }

    }, [])

    const logout = () => {

        localStorage.removeItem("driver")

        toast.success("Logged out successfully")

        router.replace("/driver/login")
    }

    const firstName =
        driver?.name?.split(" ")[0] || "Driver"

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200">

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                <div className="h-16 flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                            <Truck className="text-white h-6 w-6" />
                        </div>

                        <div>
                            <h1 className="font-bold text-slate-800 text-lg leading-none">
                                Nandurbar Bazar
                            </h1>

                            <p className="text-xs text-slate-500">
                                Driver App
                            </p>
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-4">

                        {/* Online Badge */}
                        <div className="hidden sm:flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">

                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>

                            <span className="text-sm font-medium text-green-700">
                                Online
                            </span>

                        </div>

                        {/* Driver Name */}
                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold shadow">

                                {firstName.charAt(0).toUpperCase()}

                            </div>

                            <div className="hidden sm:block">
                                <p className="text-sm text-slate-500">
                                    Welcome
                                </p>

                                <p className="font-semibold text-slate-800">
                                    {firstName}
                                </p>
                            </div>

                        </div>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition shadow-sm"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:block">
                                Logout
                            </span>
                        </button>

                    </div>

                </div>

            </div>

        </nav>
    )
}