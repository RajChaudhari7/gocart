'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

export default function DriverOrders() {

    const [orders, setOrders] = useState([])

    const fetchOrders = async () => {
        try {

            const { data } = await axios.get(
                "/api/driver/orders"
            )

            setOrders(data.orders)

        } catch (error) {
            toast.error("Failed to load orders")
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const updateStatus = async (orderId, status) => {

        try {

            await axios.post(
                "/api/driver/update-status",
                {
                    orderId,
                    status
                }
            )

            toast.success("Updated")

            fetchOrders()

        } catch (error) {

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
                            </div>

                            <span className="font-medium">
                                {order.status}
                            </span>

                        </div>

                        <div className="mt-4 flex gap-2">

                            {order.status === "OUT_FOR_DELIVERY" && (

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            order.id,
                                            "DELIVERY_INITIATED"
                                        )
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Start Delivery
                                </button>

                            )}

                            {order.status === "DELIVERY_INITIATED" && (

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            order.id,
                                            "DELIVERED"
                                        )
                                    }
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Mark Delivered
                                </button>

                            )}

                        </div>

                    </div>

                ))}

            </div>

        </div>
    )
}