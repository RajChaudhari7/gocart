'use client'

import Link from "next/link"
import {
    Truck,
    Package,
    CheckCircle,
    User,
    IndianRupee,
    Bike,
    Calendar,
    Clock
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Loading from "@/components/Loading"

export default function DriverDashboard() {

    const [incomingOrder, setIncomingOrder] = useState(null)
    const [ignoredOrders, setIgnoredOrders] = useState([])

    const [countdown, setCountdown] = useState(60)
    const audioRef = useRef(null)
    const ignoredOrdersRef = useRef([])
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [dashboard, setDashboard] = useState(null)

    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [selectedDate, setSelectedDate] = useState("")

    // Initialize Audio
    useEffect(() => {
        audioRef.current = new Audio("/sounds/delivery.mp3")
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        const storedDriver = localStorage.getItem("driver")

        if (!storedDriver) {
            // If no driver found, redirect to login
            router.replace("/driver/login")
        } else {
            // If driver found, stop loading and show dashboard
            setIsLoading(false)
        }
    }, [router])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        if (incomingOrder) {
            audio.loop = true
            audio.play().catch(e => console.log("Playback blocked:", e))
        } else {
            audio.pause()
            audio.currentTime = 0
            audio.loop = false
        }
    }, [incomingOrder])

    const handleAccept = async () => {
        try {

            await axios.post(
                "/api/driver/accept-order",
                {
                    orderId: incomingOrder.id
                }
            )

            setIgnoredOrders(prev =>
                prev.filter(id => id !== incomingOrder.id)
            )

            setIncomingOrder(null)

            toast.success("Order accepted")

            router.push("/driver/orders")

        } catch (error) {
            toast.error(
                error?.response?.data?.error ||
                "Failed to accept order"
            )
        }
    }



    const handleDecline = async () => {

        if (!incomingOrder) return

        const orderId = incomingOrder.id
        const driverId = incomingOrder.driverId

        // remove popup immediately
        setIncomingOrder(null)
        setCountdown(10)

        try {

            await axios.post(
                "/api/driver/reassign-order",
                {
                    orderId,
                    currentDriverId: driverId
                }
            )

            toast.success("Order reassigned")

        } catch (error) {

            console.error(error)

            toast.error(
                error?.response?.data?.error ||
                "Failed to reassign"
            )
        }
    }

    const fetchDashboard = async () => {

        try {

            const driver =
                JSON.parse(localStorage.getItem("driver"))

            if (!driver) return

            const { data } = await axios.get(
                "/api/driver/dashboard",
                {
                    params: {
                        driverId: driver.id,
                        month,
                        year,
                        date: selectedDate
                    }
                }
            )

            setDashboard(data.dashboardData)

        } catch (error) {

            console.log(error)

        }

    }

    useEffect(() => {

        if (!isLoading) {
            fetchDashboard()
        }

    }, [isLoading, month, year, selectedDate])

    useEffect(() => {

        const interval = setInterval(() => {
            fetchDashboard()
        }, 30000)

        return () => clearInterval(interval)

    }, [month, year, selectedDate])

    useEffect(() => {

        const interval = setInterval(
            async () => {

                const driver =
                    JSON.parse(
                        localStorage.getItem("driver")
                    )

                if (!driver?.id) return

                ignoredOrdersRef.current = ignoredOrders

                try {

                    const { data } =
                        await axios.get(
                            `/api/driver/pending-order?driverId=${driver.id}`
                        )

                    if (
                        data.order &&
                        !incomingOrder &&
                        !ignoredOrders.includes(data.order.id)
                    ) {
                        setIncomingOrder(data.order)
                        setIgnoredOrders(prev => [
                            ...prev,
                            data.order.id
                        ])
                        setCountdown(60)

                        toast.success(
                            "New Delivery Request"
                        )
                    }

                } catch (error) {
                    console.error(error)
                }

            },
            2000
        )

        return () =>
            clearInterval(interval)

    }, [ignoredOrders])



    // COuntdown the orders waitig time to accept
    useEffect(() => {

        if (!incomingOrder) return

        const timer = setInterval(() => {

            setCountdown(prev => {

                if (prev <= 1) {

                    clearInterval(timer)

                    toast.error("Order request expired")

                    handleDecline()

                    return 0
                }

                return prev - 1

            })

        }, 1000)

        return () => clearInterval(timer)

    }, [incomingOrder])

    if (isLoading) {
        return <Loading />
    }



    return (
        <div className="min-h-screen bg-slate-100 pb-20"> {/* Added pb-20 to prevent overlap */}

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 text-white rounded-b-3xl shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold truncate">
                                {JSON.parse(localStorage.getItem("driver"))?.name
                                    ? `Welcome, ${JSON.parse(localStorage.getItem("driver")).name} 👋`
                                    : "Welcome Driver 👋"}
                            </h1>
                            <p className="text-blue-100 mt-1">Ready for today's deliveries?</p>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500/20 border border-green-400 px-4 py-2 rounded-full self-start sm:self-auto">
                            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Grid - Responsive columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 -mt-12">
                    {[
                        { title: "Today's Earnings", val: `₹${dashboard?.todayRevenue || 0}`, color: "text-green-600" },
                        { title: "Today's Deliveries", val: dashboard?.todayDeliveries || 0, color: "text-blue-600" },
                        { title: "Yesterday", val: `₹${dashboard?.yesterdayRevenue || 0}`, color: "text-orange-600" },
                        { title: "Monthly", val: `₹${dashboard?.selectedRevenue || 0}`, color: "text-purple-600" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-md p-4">
                            <h2 className="text-gray-500 text-[10px] md:text-sm uppercase font-semibold">{stat.title}</h2>
                            <p className={`text-lg md:text-3xl font-bold mt-1 ${stat.color}`}>{stat.val}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-md p-4 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
                        {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December"
                        ].map((m, index) => (
                            <option
                                key={index}
                                value={index + 1}
                            >
                                {m}
                            </option>
                        ))}

                    </select>

                    <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">

                        {[2024, 2025, 2026].map((y) => (
                            <option key={y}>
                                {y}
                            </option>
                        ))}

                    </select>

                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />

                </div>

                {/* Quick Stats */}

                {/* Quick Stats Links */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <Link href="/driver/orders" className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
                        <Package className="text-blue-600 w-8 h-8" />
                        <h2 className="font-bold mt-2">Active Orders</h2>
                    </Link>
                    <Link href="/driver/profile" className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition">
                        <User className="text-purple-600 w-8 h-8" />
                        <h2 className="font-bold mt-2">Profile</h2>
                    </Link>
                </div>

                {/* Recent Deliveries */}

                <div className="bg-white mt-6 rounded-2xl shadow-md overflow-hidden">
                    <div className="p-4 border-b font-bold">Recent Deliveries</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-3 text-left">Order</th>
                                    <th className="p-3 text-left">Customer</th>
                                    <th className="p-3 text-right">Earning</th>
                                </tr>
                            </thead>
                            <tbody>

                                <tr>

                                    <td className="p-4">No deliveries yet</td>

                                    <td>-</td>

                                    <td>-</td>

                                    <td>₹0</td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

            {/* Existing Incoming Order Popup */}

            {incomingOrder && (
                <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:w-96 bg-white rounded-2xl shadow-2xl border z-50 animate-in slide-in-from-bottom-10">
                    <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white p-4 rounded-t-2xl font-bold">
                        🚚 New Delivery Request
                    </div>
                    <div className="p-4">
                        <p className="text-sm"><strong>Store:</strong> {incomingOrder.store.name}</p>
                        <p className="text-sm mt-1">Time Remaining: <span className="font-bold text-red-500">{countdown}s</span></p>
                        <div className="flex gap-3 mt-4">
                            <button onClick={handleAccept} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold">Accept</button>
                            <button onClick={handleDecline} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold">Decline</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}