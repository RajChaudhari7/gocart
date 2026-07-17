'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner";
import { CheckCircle2, MapPin, CalendarClock, Receipt } from "lucide-react"

export default function DriverHistory() {
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchHistory = async () => {
        try {
            const driverStr = localStorage.getItem("driver")
            if (!driverStr) {
                toast.error("Driver not logged in")
                setIsLoading(false)
                return
            }

            const driver = JSON.parse(driverStr)

            const { data } = await axios.get(
                `/api/driver/history?driverId=${driver.id}`
            )

            setOrders(data.orders)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load delivery history")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    // Helper to format the delivery time professionally
    const formatDeliveryTime = (order) => {
        // Ideally use the exact delivered timestamp if your backend sends it, 
        // otherwise fallback to updatedAt or createdAt
        const timeString = order.deliveredAt || order.updatedAt || order.createdAt

        if (!timeString) return "Unknown time"

        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(new Date(timeString))
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">

                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Delivery History
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View your successfully completed deliveries
                    </p>
                </header>

                <div className="space-y-4">

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-500 font-medium">Loading history...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && orders.length === 0 && (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                <CheckCircle2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">No deliveries yet</h2>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Once you complete delivery orders, they will appear here in your history.
                            </p>
                        </div>
                    )}

                    {/* Order List */}
                    {!isLoading && orders.map(order => (
                        <div
                            key={order.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 md:p-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                                {/* Customer & Location Info */}
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {order.user?.name || "Guest Customer"}
                                        </h2>
                                        <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">
                                            <CheckCircle2 size={14} />
                                            Delivered
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                                        <MapPin size={16} className="shrink-0 text-gray-400" />
                                        <p className="truncate">
                                            {order.address?.street ? `${order.address.street}, ` : ""}
                                            {order.address?.city}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Meta (Time & Amount) */}
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 gap-2">
                                    <div className="flex items-center gap-1.5 text-gray-600 text-sm md:text-right">
                                        <CalendarClock size={16} className="text-gray-400 md:hidden" />
                                        <p>
                                            <span className="hidden md:inline text-gray-400 mr-1">Delivered:</span>
                                            {formatDeliveryTime(order)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg md:bg-transparent md:px-0 md:py-0">
                                        <Receipt size={16} className="text-gray-400 md:hidden" />
                                        <p className="font-bold text-gray-900 text-lg">
                                            ₹{order.total}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}