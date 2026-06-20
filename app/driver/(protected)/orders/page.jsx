'use client'
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"

export default function DriverOrders() {
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otpOrder, setOtpOrder] = useState(null)
    const [otp, setOtp] = useState("")

    const [incomingOrder, setIncomingOrder] = useState(null)
    const [ignoredOrders, setIgnoredOrders] = useState([])
    const [countdown, setCountdown] = useState(60)

    const ignoredOrdersRef = useRef([])
    const router = useRouter()

    const getDriverId = () => {
        const driver = JSON.parse(localStorage.getItem("driver"))
        return driver?.id || null
    }

    const handleAccept = async () => {
        if (!incomingOrder) return
        try {
            await axios.post(
                "/api/driver/accept-order",
                { orderId: incomingOrder.id }
            )
            setIgnoredOrders(prev => prev.filter(id => id !== incomingOrder.id))
            setIncomingOrder(null)
            await fetchOrders()
            toast.success("Order accepted")
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to accept order")
        }
    }

    const handleDecline = async () => {
        if (!incomingOrder) return
        const orderId = incomingOrder.id
        const driverId = incomingOrder.driverId
        setIncomingOrder(null)
        setCountdown(60)

        try {
            await axios.post(
                "/api/driver/reassign-order",
                { orderId, currentDriverId: driverId }
            )
            toast.success("Order reassigned")
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to reassign")
        }
    }

    useEffect(() => {
        const driverId = getDriverId()
        if (!driverId) return

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                try {
                    await axios.post(
                        "/api/driver/update-location",
                        {
                            driverId,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    )
                } catch (error) {
                    console.error(error)
                }
            },
            (error) => {
                console.error(error)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    const fetchOrders = async () => {
        try {
            const driverId = getDriverId()
            if (!driverId) {
                toast.error("Driver not logged in")
                setIsLoading(false)
                return
            }

            const { data } = await axios.get(`/api/driver/orders?driverId=${driverId}`)
            setOrders(data.orders)
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.error || "Failed to load orders")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
        const interval = setInterval(fetchOrders, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const interval = setInterval(async () => {
            const driver = JSON.parse(localStorage.getItem("driver"))
            if (!driver?.id) return

            ignoredOrdersRef.current = ignoredOrders

            try {
                const { data } = await axios.get(`/api/driver/pending-order?driverId=${driver.id}`)

                if (data.order && !incomingOrder && !ignoredOrders.includes(data.order.id)) {
                    setIncomingOrder(data.order)
                    setIgnoredOrders(prev => [...prev, data.order.id])
                    setCountdown(60)
                    toast.success("New Delivery Request")
                }
            } catch (error) {
                console.error(error)
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [ignoredOrders, incomingOrder])

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

    const verifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error("Enter a valid 6-digit OTP")
            return
        }

        try {
            await axios.post("/api/driver/verify-otp", {
                orderId: otpOrder.id,
                otp,
                driverId: getDriverId()
            })

            toast.success("Order Delivered Successfully! 🎉")
            setShowOtpModal(false)
            setOtp("")
            setOtpOrder(null)
            fetchOrders()
        } catch (error) {
            toast.error(error?.response?.data?.error || "Verification failed")
        }
    }

    const updateStatus = async (orderId, status) => {
        try {
            const driverId = getDriverId()
            await axios.post("/api/driver/update-order-status", {
                orderId,
                status,
                driverId
            })

            if (status === "DELIVERY_INITIATED") {
                await axios.post("/api/order/send-otp", { orderId })
                toast.success("OTP sent to customer")
            } else {
                toast.success("Status Updated")
            }

            fetchOrders()
        } catch (error) {
            console.error(error?.response?.data)
            toast.error(error?.response?.data?.error || "Failed to update status")
        }
    }

    const canReachShop = async (order) => {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat1 = position.coords.latitude
                    const lon1 = position.coords.longitude
                    const lat2 = order.store.latitude
                    const lon2 = order.store.longitude
                    const R = 6371e3
                    const φ1 = lat1 * Math.PI / 180
                    const φ2 = lat2 * Math.PI / 180
                    const Δφ = (lat2 - lat1) * Math.PI / 180
                    const Δλ = (lon2 - lon1) * Math.PI / 180

                    const a =
                        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                        Math.cos(φ1) * Math.cos(φ2) *
                        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                    const distance = R * c

                    resolve(distance <= 100)
                },
                () => resolve(false)
            )
        })
    }

    const StatusBadge = ({ status }) => {
        const styles = {
            DRIVER_ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
            REACHED_SHOP: "bg-indigo-100 text-indigo-700 border-indigo-200",
            PICKED_UP: "bg-orange-100 text-orange-700 border-orange-200",
            OUT_FOR_DELIVERY: "bg-yellow-100 text-yellow-700 border-yellow-200",
            DELIVERY_INITIATED: "bg-green-100 text-green-700 border-green-200",
        }
        const formatStatus = (s) => s.replace(/_/g, ' ')
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {formatStatus(status)}
            </span>
        )
    }

    // NEW: Helper to highlight the last 4 digits of the order ID
    const HighlightOrderId = ({ id }) => {
        if (!id) return null;
        const start = id.slice(0, -4);
        const end = id.slice(-4);
        return (
            <div className="flex items-center text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200 mb-4 shadow-sm">
                <span>#{start}</span>
                <span className="text-indigo-700 font-bold text-base tracking-widest bg-indigo-100 px-1 rounded ml-[1px]">
                    {end}
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Delivery Dashboard
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Manage your active assignments</p>
                        </div>
                        <button
                            onClick={fetchOrders}
                            className="p-2 bg-white border shadow-sm rounded-full hover:bg-gray-50 transition"
                            title="Refresh Orders"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                    </header>

                    {incomingOrder && (
                        <div className="fixed top-6 right-6 z-50 bg-white shadow-2xl border border-gray-100 rounded-2xl p-5 w-80 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                </div>
                                <h2 className="font-bold text-lg text-gray-900">
                                    New Delivery Request
                                </h2>
                            </div>
                            
                            {/* Inserted Highlighted Order ID here */}
                            <HighlightOrderId id={incomingOrder.id} />

                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Store</span>
                                    <span className="font-medium text-gray-900 text-right truncate max-w-[150px]" title={incomingOrder.store?.name}>
                                        {incomingOrder.store?.name}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Distance to Store</span>
                                    <span className="font-semibold text-blue-600">
                                        {incomingOrder.distanceToStore
                                            ? `${incomingOrder.distanceToStore.toFixed(1)} km`
                                            : "Calculating..."}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Store to Customer</span>
                                    <span className="font-semibold text-blue-600">
                                        {incomingOrder.distanceToCustomer
                                            ? `${incomingOrder.distanceToCustomer.toFixed(1)} km`
                                            : "Calculating..."}
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Time to Accept</span>
                                    <span className={`font-bold ${countdown <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                                        {countdown}s
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition shadow-sm shadow-green-200"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-xl transition"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-gray-500 font-medium">Loading orders...</p>
                            </div>
                        )}

                        {!isLoading && orders.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                                <div className="relative flex justify-center items-center w-20 h-20 mb-6">
                                    <div className="absolute animate-ping inline-flex h-full w-full rounded-full bg-blue-200 opacity-60"></div>
                                    <div className="relative inline-flex rounded-full h-10 w-10 bg-blue-600 items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Searching for new orders...</h2>
                                <p className="text-gray-500 max-w-sm">Stay on this screen. New delivery assignments will appear here automatically once you are matched.</p>
                            </div>
                        )}

                        {!isLoading && orders.map(order => (
                            <div key={order.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 md:p-6">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <h2 className="text-lg font-bold text-gray-900">{order.user?.name}</h2>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        
                                        {/* Inserted Highlighted Order ID here */}
                                        <HighlightOrderId id={order.id} />

                                        <p className="text-xl font-bold text-gray-900 mb-4">₹{order.total}</p>

                                        <div className="flex items-start gap-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            <div>
                                                {["DRIVER_ASSIGNED", "REACHED_SHOP"].includes(order.status) ? (
                                                    <>
                                                        <p className="font-medium text-gray-900">
                                                            Store: {order.store?.name}
                                                        </p>
                                                        <p>
                                                            {order.store?.address}
                                                        </p>
                                                        <p className="text-blue-600 font-semibold">
                                                            {order.distanceToStore
                                                                ? `${order.distanceToStore.toFixed(2)} km away`
                                                                : "Calculating distance..."}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-medium text-gray-900">
                                                            {order.address?.street}
                                                        </p>
                                                        <p>
                                                            {order.address?.city},
                                                            {order.address?.state}
                                                        </p>
                                                        <p className="text-blue-600 font-semibold">
                                                            {order.distanceToCustomer
                                                                ? `${order.distanceToCustomer.toFixed(2)} km away`
                                                                : "Calculating distance..."}
                                                        </p>
                                                        <p className="mt-1 font-medium text-blue-600">
                                                            {order.address?.phone}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                                    {order.status === "DRIVER_ASSIGNED" && (
                                        <div className="flex gap-3 w-full">
                                            <a
                                                href={`https://maps.google.com/?q=${order.store?.latitude},${order.store?.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2.5 rounded-xl text-center font-medium transition-colors"
                                            >
                                                Navigate
                                            </a>

                                            <button
                                                disabled={!order.distanceToStore || order.distanceToStore > 0.1}
                                                onClick={() => updateStatus(order.id, "REACHED_SHOP")}
                                                className={`flex-1 py-2.5 rounded-xl text-white font-medium transition-colors ${order.distanceToStore <= 0.1
                                                    ? "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200"
                                                    : "bg-gray-400 cursor-not-allowed"
                                                }`}
                                            >
                                                Reached Shop
                                            </button>
                                        </div>
                                    )}

                                    {order.status === "REACHED_SHOP" && (
                                        <button
                                            onClick={() => updateStatus(order.id, "PICKED_UP")}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm shadow-indigo-200"
                                        >
                                            Confirm Pick Up
                                        </button>
                                    )}

                                    {order.status === "PICKED_UP" && (
                                        <button
                                            onClick={() => updateStatus(order.id, "OUT_FOR_DELIVERY")}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm shadow-orange-200"
                                        >
                                            Start Journey
                                        </button>
                                    )}

                                    {order.status === "OUT_FOR_DELIVERY" && (
                                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                                            <a
                                                href={`https://maps.google.com/?q=${order.address?.latitude},${order.address?.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-4 py-2.5 rounded-xl transition-colors"
                                            >
                                                Navigate
                                            </a>

                                            <button
                                                onClick={() => updateStatus(order.id, "DELIVERY_INITIATED")}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm shadow-green-200"
                                            >
                                                Arrived At Location
                                            </button>
                                        </div>
                                    )}

                                    {order.status === "DELIVERY_INITIATED" && (
                                        <div className="flex flex-col sm:flex-row w-full gap-3">
                                            <a
                                                href={`https://maps.google.com/?q=${order.address?.latitude},${order.address?.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-4 py-2.5 rounded-xl transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                                                Navigate
                                            </a>
                                            <button
                                                onClick={() => { setOtpOrder(order); setShowOtpModal(true); }}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm shadow-green-200"
                                            >
                                                Verify Delivery OTP
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await axios.post("/api/order/resend-otp", { orderId: order.id })
                                                        toast.success("OTP resent successfully")
                                                    } catch (error) {
                                                        toast.error(error?.response?.data?.error || "Failed to resend OTP")
                                                    }
                                                }}
                                                className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition"
                                            >
                                                Resend OTP
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {showOtpModal && otpOrder && (
                        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Delivery</h2>
                                <p className="text-gray-500 text-sm mb-6">Ask the customer for the 6-digit OTP sent to their phone.</p>

                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full border-2 border-gray-200 focus:border-blue-600 focus:ring-0 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono mb-6 outline-none transition"
                                    placeholder="000000"
                                    autoFocus
                                />

                                <div className="flex gap-3">
                                    <button onClick={() => { setShowOtpModal(false); setOtp(""); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition">
                                        Cancel
                                    </button>
                                    <button onClick={verifyOtp} disabled={otp.length !== 6} className="flex-1 bg-green-600 disabled:bg-green-400 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition">
                                        Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}