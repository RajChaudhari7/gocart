'use client'

import { useEffect, useState } from "react"
import { User, Phone, CarFront, Hash } from "lucide-react"

export default function DriverProfile() {
    const [driver, setDriver] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedDriver = localStorage.getItem("driver")
        if (storedDriver) {
            setDriver(JSON.parse(storedDriver))
        }
        setIsLoading(false)
    }, [])

    // Generate initials for the avatar placeholder
    const getInitials = (name) => {
        if (!name) return 'D'
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading profile...</p>
            </div>
        )
    }

    if (!driver) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Profile Not Found</h2>
                    <p className="text-gray-500 mt-2 text-sm">Could not load your driver details. Please try logging in again.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">

                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Driver Profile
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage your personal and vehicle information
                    </p>
                </header>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-400 h-32 relative"></div>

                    <div className="px-6 sm:px-10 pb-10">

                        {/* Avatar & Status Badge */}
                        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-md">
                                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center text-green-700 text-4xl font-bold tracking-tight">
                                    {getInitials(driver.name)}
                                </div>
                            </div>

                            <span className={`self-start sm:self-auto mb-2 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border ${driver.isActive
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : "bg-red-50 border-red-200 text-red-700"
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${driver.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                                {driver.isActive ? "Active Status" : "Inactive"}
                            </span>
                        </div>

                        {/* Profile Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-6">

                            {/* Personal Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                    Personal Details
                                </h3>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Full Name</p>
                                        <p className="text-gray-900 font-medium text-lg">{driver.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                        <Phone className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                                        <p className="text-gray-900 font-medium text-lg">{driver.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                                    Vehicle Details
                                </h3>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                        <CarFront className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Vehicle Model</p>
                                        <p className="text-gray-900 font-medium text-lg">{driver.vehicle}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                        <Hash className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">License Plate</p>
                                        <div className="inline-block mt-0.5 px-3 py-1 bg-yellow-100/50 border border-yellow-400 text-gray-900 font-mono font-bold rounded">
                                            {driver.vehicleNo}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}