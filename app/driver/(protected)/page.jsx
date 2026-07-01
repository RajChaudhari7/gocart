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
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 text-white rounded-b-3xl shadow-lg">

                <div className="max-w-7xl mx-auto p-8">

                    <div className="flex justify-between items-center">

                        <div>
                            <h1 className="text-3xl font-bold">
                                {JSON.parse(localStorage.getItem("driver"))?.name
                                    ? `Welcome, ${JSON.parse(localStorage.getItem("driver")).name} 👋`
                                    : "Welcome Driver 👋"}
                            </h1>

                            <p className="text-blue-100 mt-2">
                                Ready for today's deliveries?
                            </p>
                        </div>

                        <div className="bg-green-500 px-5 py-2 rounded-full font-semibold flex items-center gap-2">
                            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                            Online
                        </div>

                    </div>

                </div>

            </div>

            <div className="max-w-7xl mx-auto p-6">

                {/* Stats */}

                <div className="grid md:grid-cols-4 gap-6 -mt-12">

                    <div className="bg-white rounded-2xl shadow-lg p-6">

                        <h2 className="text-gray-500 text-sm">
                            Today's Earnings
                        </h2>

                        <p className="text-3xl font-bold mt-3 text-green-600">
                            ₹{dashboard?.todayRevenue || 0}
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">

                        <h2 className="text-gray-500 text-sm">
                            Today's Deliveries
                        </h2>

                        <p className="text-3xl font-bold mt-3 text-blue-600">
                            {dashboard?.todayDeliveries || 0}
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">

                        <h2 className="text-gray-500 text-sm">
                            Yesterday Earnings
                        </h2>

                        <p className="text-3xl font-bold mt-3 text-orange-600">
                            ₹{dashboard?.yesterdayRevenue || 0}
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">

                        <h2 className="text-gray-500 text-sm">
                            Monthly Earnings
                        </h2>

                        <p className="text-3xl font-bold mt-3 text-purple-600">
                            ₹{dashboard?.selectedRevenue || 0}
                        </p>

                    </div>

                </div>

                {/* Earnings Filter */}

                <div className="bg-white rounded-2xl shadow-lg p-5 mt-8 flex flex-wrap gap-4">

                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border rounded-lg px-4 py-2"
                    >

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

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border rounded-lg px-4 py-2"
                    >

                        {[2024, 2025, 2026].map((y) => (
                            <option key={y}>
                                {y}
                            </option>
                        ))}

                    </select>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                    />

                </div>

                {/* Quick Stats */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">

                    <Link
                        href="/driver/orders"
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
                    >
                        <Package className="text-blue-600 w-10 h-10" />

                        <h2 className="font-semibold text-lg mt-4">
                            Assigned Orders
                        </h2>

                        <p className="text-gray-500 text-sm mt-2">
                            View Active Orders
                        </p>
                    </Link>

                    <div className="bg-white rounded-2xl shadow-lg p-6">

                        <Truck className="text-orange-500 w-10 h-10" />

                        <h2 className="font-semibold text-lg mt-4">
                            Active Orders
                        </h2>

                        <p className="text-3xl font-bold text-orange-600 mt-2">
                            {dashboard?.activeOrders || 0}
                        </p>

                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">

                        <Bike className="text-green-600 w-10 h-10" />

                        <h2 className="font-semibold text-lg mt-4">
                            Total Delivered
                        </h2>

                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {dashboard?.totalDelivered || 0}
                        </p>

                    </div>

                    <Link
                        href="/driver/profile"
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
                    >
                        <User className="text-purple-600 w-10 h-10" />

                        <h2 className="font-semibold text-lg mt-4">
                            Profile
                        </h2>

                        <p className="text-gray-500 text-sm mt-2">
                            Manage Account
                        </p>

                    </Link>

                </div>

                {/* Recent Deliveries */}

                <div className="bg-white mt-8 rounded-2xl shadow-lg">

                    <div className="p-5 border-b">

                        <h2 className="text-xl font-bold">
                            Recent Deliveries
                        </h2>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="text-left p-4">Order</th>
                                    <th className="text-left p-4">Customer</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Earning</th>

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

                <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50">

                    <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white p-5">

                        <h2 className="font-bold text-lg">
                            🚚 New Delivery Request
                        </h2>

                    </div>

                    <div className="p-5">

                        <p>
                            <strong>Store:</strong>{" "}
                            {incomingOrder.store.name}
                        </p>

                        <p className="mt-2">
                            Time Remaining :
                            <span className="font-bold text-red-500">
                                {" "}
                                {countdown}s
                            </span>
                        </p>

                        <div className="flex gap-3 mt-5">

                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-green-600 hover:bg-green-700 transition rounded-lg py-3 text-white font-semibold"
                            >
                                Accept
                            </button>

                            <button
                                onClick={handleDecline}
                                className="flex-1 bg-red-600 hover:bg-red-700 transition rounded-lg py-3 text-white font-semibold"
                            >
                                Decline
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}