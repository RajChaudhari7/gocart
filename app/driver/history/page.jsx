'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

export default function DriverHistory() {

    const [orders, setOrders] = useState([])

    const fetchHistory = async () => {

        try {

            const driver = JSON.parse(
                localStorage.getItem("driver")
            )

            const { data } = await axios.get(
                `/api/driver/history?driverId=${driver.id}`
            )

            setOrders(data.orders)

        } catch (error) {

            toast.error("Failed to load history")

        }

    }

    useEffect(() => {
        fetchHistory()
    }, [])

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Delivery History
            </h1>

            <div className="space-y-4">

                {orders.map(order => (

                    <div
                        key={order.id}
                        className="bg-white rounded-xl shadow p-5"
                    >

                        <div className="flex justify-between">

                            <div>

                                <h2 className="font-semibold">
                                    {order.user?.name}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {order.address?.city}
                                </p>

                            </div>

                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                Delivered
                            </span>

                        </div>

                        <div className="mt-3 text-sm">

                            <p>
                                Total: ₹{order.total}
                            </p>

                            <p>
                                Date: {new Date(order.createdAt)
                                    .toLocaleString()}
                            </p>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    )
}