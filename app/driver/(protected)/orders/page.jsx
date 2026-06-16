'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

export default function DriverOrders() {

    const [orders, setOrders] = useState([])
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otpOrder, setOtpOrder] = useState(null)
    const [otp, setOtp] = useState("")

    const getDriverId = () => {
        const driver = JSON.parse(
            localStorage.getItem("driver")
        )

        return driver?.id || null
    }

    const fetchOrders = async () => {

        try {

            const driver = JSON.parse(
                localStorage.getItem("driver")
            )

            if (!driver?.id) {
                toast.error("Driver not logged in")
                return
            }

            const { data } = await axios.get(
                `/api/driver/orders?driverId=${driver.id}`
            )

            setOrders(data.orders)

        } catch (error) {

            console.error(error)

            toast.error(
                error?.response?.data?.error ||
                "Failed to load orders"
            )

        }

    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const verifyOtp = async () => {

        if (otp.length !== 6) {
            toast.error("Enter valid OTP")
            return
        }

        try {

            await axios.post(
                "/api/driver/verify-otp",
                {
                    orderId: otpOrder.id,
                    otp,
                    driverId: getDriverId()
                }
            )

            toast.success("Order Delivered")

            setShowOtpModal(false)
            setOtp("")
            setOtpOrder(null)

            fetchOrders()

        } catch (error) {

            toast.error(
                error?.response?.data?.error ||
                "Verification failed"
            )

        }
    }

    const updateStatus = async (orderId, status) => {

        try {

            const driverId = getDriverId()

            console.log({
                orderId,
                status,
                driverId
            })

            await axios.post(
                "/api/driver/update-order-status",
                {
                    orderId,
                    status,
                    driverId
                }
            )

            // Send OTP when order goes Out For Delivery
            if (status === "DELIVERY_INITIATED") {

                await axios.post(
                    "/api/order/send-otp",
                    {
                        orderId
                    }
                )

                toast.success("OTP sent to customer")
            }

            toast.success("Updated")

            fetchOrders()

        } catch (error) {

            console.error(error?.response?.data)

            toast.error(
                error?.response?.data?.error ||
                "Failed"
            )

        }
    }


    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Assigned Orders
            </h1>

            <div className="space-y-4">

                {orders.map(order => (

                    <div
                        key={order.id}
                        className="bg-white shadow rounded-xl p-5"
                    >

                        <div className="flex justify-between">

                            <div>
                                <h2 className="font-semibold">
                                    {order.user?.name}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    ₹{order.total}
                                </p>
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>{order.address?.street}</p>
                                    <p>
                                        {order.address?.city},
                                        {order.address?.state}
                                    </p>

                                    <p>
                                        {order.address?.phone}
                                    </p>
                                </div>
                            </div>

                            <span className="font-medium">
                                {order.status}
                            </span>

                        </div>

                        <div className="mt-4 flex gap-2">

                            {order.status === "DRIVER_ASSIGNED" && (
                                <button
                                    onClick={() =>
                                        updateStatus(order.id, "REACHED_SHOP")
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Reached Shop
                                </button>
                            )}

                            {order.status === "REACHED_SHOP" && (
                                <button
                                    onClick={() =>
                                        updateStatus(order.id, "PICKED_UP")
                                    }
                                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                                >
                                    Picked Up
                                </button>
                            )}

                            {order.status === "PICKED_UP" && (
                                <button
                                    onClick={() =>
                                        updateStatus(order.id, "OUT_FOR_DELIVERY")
                                    }
                                    className="bg-orange-600 text-white px-4 py-2 rounded"
                                >
                                    Out For Delivery
                                </button>
                            )}

                            {order.status === "OUT_FOR_DELIVERY" && (
                                <button
                                    onClick={() =>
                                        updateStatus(
                                            order.id,
                                            "DELIVERY_INITIATED"
                                        )
                                    }
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Start Delivery
                                </button>
                            )}

                            {order.status === "DELIVERY_INITIATED" && (
                                <>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.address?.latitude},${order.address?.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
                                    >
                                        Navigate
                                    </a>
                                    <button
                                        onClick={() => {
                                            setOtpOrder(order)
                                            setShowOtpModal(true)
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                                    >
                                        Verify Delivery OTP
                                    </button>

                                    <button
                                        onClick={async () => {
                                            try {

                                                await axios.post(
                                                    "/api/order/resend-otp",
                                                    {
                                                        orderId: order.id
                                                    }
                                                )

                                                toast.success("OTP resent successfully")

                                            } catch (error) {

                                                toast.error(
                                                    error?.response?.data?.error ||
                                                    "Failed to resend OTP"
                                                )

                                            }
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                                    >
                                        Resend OTP
                                    </button>
                                </>
                            )}
                        </div>

                    </div>



                ))}

                {showOtpModal && otpOrder && (

                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                        <div className="bg-white p-6 rounded-xl w-full max-w-sm">

                            <h2 className="text-lg font-semibold mb-4">
                                Verify Delivery OTP
                            </h2>

                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value.replace(/\D/g, "")
                                    )
                                }
                                className="w-full border rounded px-4 py-2 mb-4"
                                placeholder="Enter OTP"
                            />

                            <div className="flex gap-2">

                                <button
                                    onClick={() => {
                                        setShowOtpModal(false)
                                        setOtp("")
                                    }}
                                    className="flex-1 bg-gray-300 py-2 rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={verifyOtp}
                                    className="flex-1 bg-green-600 text-white py-2 rounded"
                                >
                                    Verify
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>
    )
}