'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"

const STATUS_FLOW = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"]

export default function StoreOrders() {
    const { getToken } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchOrders = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/orders', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setOrders(data.orders)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (order, newStatus) => {
        const currentIndex = STATUS_FLOW.indexOf(order.status)
        const newIndex = STATUS_FLOW.indexOf(newStatus)

        if (newIndex < currentIndex) {
            toast.error("Order status cannot go backward")
            return
        }

        try {
            const token = await getToken()
            await axios.post('/api/store/orders', {
                orderId: order.id,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setOrders(prev =>
                prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
            )
            toast.success("Order status updated")
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const cancelOrder = async (order) => {
        if (order.status === 'DELIVERED') return

        if (!confirm("Are you sure you want to cancel this order?")) return
        try {
            const token = await getToken()
            await axios.post('/api/orders/cancel', { orderId: order.id }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success("Order canceled successfully")
            fetchOrders()
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">
                Store <span className="text-slate-800 font-medium">Orders</span>
            </h1>

            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="overflow-x-auto max-w-4xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                                {["#", "Customer", "Total", "Payment", "Coupon", "Status", "Actions", "Date"].map(h => (
                                    <th key={h} className="px-4 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => openModal(order)}
                                >
                                    <td className="px-4">{index + 1}</td>
                                    <td className="px-4">{order.user?.name}</td>
                                    <td className="px-4 font-semibold">₹{order.total}</td>
                                    <td className="px-4">{order.paymentMethod}</td>
                                    <td className="px-4">
                                        {order.isCouponUsed ? order.coupon?.code : "—"}
                                    </td>
                                    <td className="px-4">{order.status}</td>

                                    <td
                                        className="px-4 flex gap-2"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <select
                                            value={order.status}
                                            disabled={order.status === "DELIVERED"}
                                            onChange={e => updateOrderStatus(order, e.target.value)}
                                            className="border rounded text-sm"
                                        >
                                            {STATUS_FLOW.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>

                                        {order.status !== "DELIVERED" && (
                                            <button
                                                onClick={() => cancelOrder(order)}
                                                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>

                                    <td className="px-4">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && selectedOrder && (
                <div
                    onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-lg p-6 max-w-2xl w-full"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            Order Details
                        </h2>

                        <p><b>Customer:</b> {selectedOrder.user?.name}</p>
                        <p><b>Email:</b> {selectedOrder.user?.email}</p>
                        <p><b>Status:</b> {selectedOrder.status}</p>

                        <div className="mt-4 space-y-2">
                            {selectedOrder.orderItems.map((item, i) => (
                                <div key={i} className="flex gap-4 border p-2 rounded">
                                    <img
                                        src={item.product.images?.[0]?.src || item.product.images?.[0]}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p>{item.product?.name}</p>
                                        <p>Qty: {item.quantity}</p>
                                        <p>₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-right mt-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-slate-200 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
