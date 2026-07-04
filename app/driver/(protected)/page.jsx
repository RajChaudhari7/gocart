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
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
        const interval = setInterval(async () => {
            const driver = JSON.parse(localStorage.getItem("driver"));
            if (!driver?.id) return;

            // Get driver's location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        try {
                            const { data } = await axios.get(
                                `/api/driver/pending-order?driverId=${driver.id}&lat=${latitude}&lng=${longitude}`
                            );

                            if (
                                data.order &&
                                !incomingOrder &&
                                !ignoredOrders.includes(data.order.id)
                            ) {
                                setIncomingOrder(data.order);
                                setIgnoredOrders(prev => [...prev, data.order.id]);
                                setCountdown(60);
                                toast.success("New Delivery Request Nearby");
                            }
                        } catch (error) {
                            console.error("Error fetching order:", error);
                        }
                    },
                    (err) => console.error("Location access denied", err),
                    { enableHighAccuracy: true }
                );
            }
        }, 5000); // Increased interval to 5s to avoid excessive location pings

        return () => clearInterval(interval);
    }, [ignoredOrders, incomingOrder]);



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
        <div className="min-h-screen bg-slate-100 pb-20">
            {incomingOrder && (
                <div className="fixed top-4 inset-x-4 md:left-auto md:right-6 md:w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 z-[100] animate-in slide-in-from-top-10">
                    <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                        <span className="font-bold">🚚 New Delivery</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs font-mono">{countdown}s</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-slate-800">{incomingOrder.store.name}</p>
                            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-full">
                                {incomingOrder.distanceToStore || "Calculating..."} km away
                            </span>
                        </div>

                        <div className="border-t pt-2 mt-2">
                            <p className="text-xs text-slate-500">Delivery to:</p>
                            <p className="text-sm font-medium">{incomingOrder.address?.name || "Customer Location"}</p>
                            <p className="text-xs text-indigo-500 font-bold mt-1">
                                {incomingOrder.distanceToCustomer || "..."} km from store
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={handleAccept} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition">Accept</button>
                            <button onClick={handleDecline} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">Decline</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header - Sleek Dark Gradient */}
            <header className="bg-slate-900 text-white rounded-b-[2rem] shadow-xl">
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {JSON.parse(localStorage.getItem("driver"))?.name || "Driver"} 👋
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">Dashboard Overview</p>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 -mt-8 space-y-6">
                {/* Stats Grid - Responsive columns */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: "Today Earnings", val: `₹${dashboard?.todayRevenue || 0}`, color: "text-emerald-600" },
                        { title: "Deliveries", val: dashboard?.todayDeliveries || 0, color: "text-blue-600" },
                        { title: "Yesterday", val: `₹${dashboard?.yesterdayRevenue || 0}`, color: "text-orange-500" },
                        { title: "Month Total", val: `₹${dashboard?.selectedRevenue || 0}`, color: "text-indigo-600" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{stat.title}</p>
                            <p className={`text-xl font-extrabold mt-1 ${stat.color}`}>{stat.val}</p>
                        </div>
                    ))}
                </div>
                {/* Weekly Earnings Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800">Weekly Earnings</h3>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Last 7 Days</span>
                    </div>

                    <div className="h-48 w-full">
                        {dashboard?.weeklyData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboard.weeklyData}>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        tick={{ fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                                        {dashboard.weeklyData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={entry.revenue > 0 ? '#4f46e5' : '#e2e8f0'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                No data available
                            </div>
                        )}
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
                </div>
            </main>
        </div>
    )
}