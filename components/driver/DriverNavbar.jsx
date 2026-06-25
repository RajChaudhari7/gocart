'use client'

import { useEffect, useState } from "react"
import { LogOut, Truck, Download } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"


export default function DriverNavbar() {

    const [driver, setDriver] = useState(null)
    const [isOnline, setIsOnline] = useState(false)
    const [isTWA, setIsTWA] = useState(false)
    const router = useRouter()

    useEffect(() => {

        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true

        const twa =
            document.referrer.includes("android-app://")

        setIsTWA(standalone || twa)

    }, [])

    useEffect(() => {

        const loadDriver = async () => {

            const storedDriver = localStorage.getItem("driver")

            if (!storedDriver) return

            const driverData = JSON.parse(storedDriver)

            try {

                const { data } = await axios.get(
                    `/api/driver/profile?driverId=${driverData.id}`
                )

                setDriver(data.driver)
                setIsOnline(data.driver.isOnline)

            } catch (error) {
                console.log(error)
            }

        }

        loadDriver()

    }, [])

    useEffect(() => {

        const loadDriver = async () => {

            const storedDriver = localStorage.getItem("driver")

            if (!storedDriver) return

            const driverData = JSON.parse(storedDriver)

            try {

                const { data } = await axios.get(
                    `/api/driver/profile?driverId=${driverData.id}`
                )

                setDriver(data.driver)
                setIsOnline(data.driver.isOnline)

            } catch (error) {
                console.log(error)
            }

        }

        loadDriver()

    }, [])

    const logout = async () => {

        try {

            if (driver?.id) {

                await axios.post(
                    "/api/driver/logout",
                    {
                        driverId: driver.id
                    }
                )
            }

        } catch (error) { }

        localStorage.removeItem("driver")

        toast.success("Logged out successfully")

        router.replace("/driver/login")
    }

    useEffect(() => {

        const storedDriver = localStorage.getItem("driver")

        if (!storedDriver) return

        const driver = JSON.parse(storedDriver)

        const updateLocation = () => {

            navigator.geolocation.getCurrentPosition(

                async (position) => {

                    try {

                        await axios.post(
                            "/api/driver/update-location",
                            {
                                driverId: driver.id,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude
                            }
                        )

                    } catch (error) {
                        console.log(error)
                    }

                }

            )

        }

        updateLocation()

        const interval = setInterval(
            updateLocation,
            30000 // every 30 seconds
        )

        return () => clearInterval(interval)

    }, [])

    const toggleStatus = async () => {

        try {

            const { data } = await axios.post(
                "/api/driver/toggle-status",
                {
                    driverId: driver.id
                }
            )

            setIsOnline(data.isOnline)

            toast.success(
                data.isOnline
                    ? "You are now Online"
                    : "You are now Offline"
            )

        } catch (error) {

            toast.error("Failed to update status")

        }

    }

    const firstName =
        driver?.name?.split(" ")[0] || "Driver"

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200">

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                <div className="h-16 flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                                className="relative w-12 h-12"
                            >
                                <Image
                                    src="/driver.png"
                                    alt="Driver Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>
                        </Link>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-4">

                        {
                            !isTWA && (

                                <a
                                    href="/apk/nandurbar-bazar-driver.apk"
                                    download
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
                                >
                                    <Download size={16} />

                                    <span className="hidden sm:block">
                                        Download App
                                    </span>

                                </a>
                            )
                        }

                        {/* Online Badge */}
                        <button
                            onClick={toggleStatus}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all shadow-sm border
                                        ${isOnline
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                        >

                            <span
                                className={`w-2 h-2 rounded-full
                                        ${isOnline
                                        ? "bg-green-500 animate-pulse"
                                        : "bg-red-500"
                                    }`}
                            />

                            <span className="text-xs sm:text-sm font-medium">
                                {isOnline ? "Online" : "Offline"}
                            </span>

                        </button>

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