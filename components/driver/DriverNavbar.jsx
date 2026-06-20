'use client'

import { useEffect, useState } from "react"
import { LogOut, Truck } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import axios from "axios"
import InstallButton from "../InstallButton"

export default function DriverNavbar() {
    const [driver, setDriver] = useState(null)
    const [isOnline, setIsOnline] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const loadDriver = async () => {
            const storedDriver = localStorage.getItem("driver")
            if (!storedDriver) return
            const driverData = JSON.parse(storedDriver)
            try {
                const { data } = await axios.get(`/api/driver/profile?driverId=${driverData.id}`)
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
                await axios.post("/api/driver/logout", { driverId: driver.id })
            }
        } catch (error) { }
        localStorage.removeItem("driver")
        toast.success("Logged out successfully")
        router.replace("/driver/login")
    }

    const toggleStatus = async () => {
        try {
            const { data } = await axios.post("/api/driver/toggle-status", { driverId: driver.id })
            setIsOnline(data.isOnline)
            toast.success(data.isOnline ? "You are now Online" : "You are now Offline")
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const firstName = driver?.name?.split(" ")[0] || "Driver"

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                            <Truck className="text-white h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg leading-none">Nandurbar Bazar</h1>
                            <p className="text-xs text-slate-500">Driver App</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <InstallButton />
                        <button
                            onClick={toggleStatus}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full border ${isOnline ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                        >
                            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-xs font-medium">{isOnline ? "Online" : "Offline"}</span>
                        </button>
                        <button onClick={logout} className="p-2 bg-red-500 text-white rounded-xl">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}