'use client'

import Link from "next/link"
import { Truck, Package, CheckCircle, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function DriverDashboard() {

    const [incomingOrder, setIncomingOrder] = useState(null)
    const [ignoredOrders, setIgnoredOrders] = useState([])

    const [countdown, setCountdown] = useState(10)
    const ignoredOrdersRef = useRef([])


    const router = useRouter()

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
                        setCountdown(10)

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

    return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">
                Driver Dashboard
            </h1>

            {incomingOrder && (

                <div className="fixed top-6 right-6 z-50 bg-white shadow-2xl border rounded-xl p-5 w-80">

                    <h2 className="font-bold text-lg">
                        New Delivery Request
                    </h2>

                    <p className="mt-2">
                        Store:
                        {" "}
                        {incomingOrder.store.name}
                    </p>

                    <p>
                        Time Left:
                        {" "}
                        {countdown}s
                    </p>

                    <div className="flex gap-2 mt-4">

                        <button
                            onClick={handleAccept}
                            className="flex-1 bg-green-600 text-white py-2 rounded"
                        >
                            Accept
                        </button>

                        <button
                            onClick={handleDecline}
                            className="flex-1 bg-red-600 text-white py-2 rounded"
                        >
                            Decline
                        </button>

                    </div>

                </div>

            )}

            <div className="grid md:grid-cols-4 gap-4">

                <Link
                    href="/driver/orders"
                    className="bg-white shadow rounded-xl p-5 border"
                >
                    <Package className="w-8 h-8 text-blue-600 mb-3" />
                    <h2 className="font-semibold">
                        Assigned Orders
                    </h2>
                </Link>

                <Link
                    href="/driver/history"
                    className="bg-white shadow rounded-xl p-5 border"
                >
                    <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                    <h2 className="font-semibold">
                        Delivery History
                    </h2>
                </Link>

                <Link
                    href="/driver/profile"
                    className="bg-white shadow rounded-xl p-5 border"
                >
                    <User className="w-8 h-8 text-purple-600 mb-3" />
                    <h2 className="font-semibold">
                        Profile
                    </h2>
                </Link>

                <div className="bg-white shadow rounded-xl p-5 border">
                    <Truck className="w-8 h-8 text-orange-600 mb-3" />
                    <h2 className="font-semibold">
                        Active Driver
                    </h2>
                </div>

            </div>

        </div>
    )
}