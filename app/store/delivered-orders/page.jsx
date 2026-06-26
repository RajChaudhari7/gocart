'use client'

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Loading from "@/components/Loading"

export default function DeliveredOrders() {
    const { getToken } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDeliveredOrders()
    }, [])

    const fetchDeliveredOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/store/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter strictly for DELIVERED
            const delivered = data.orders.filter(o => o.status === "DELIVERED");
            setOrders(delivered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold mb-6">Delivered Orders</h1>
            {orders.length === 0 ? (
                <p className="text-gray-500">No delivered orders found.</p>
            ) : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                            <div>
                                <p className="font-bold">#{order.id.slice(-6)}</p>
                                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                DELIVERED
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}