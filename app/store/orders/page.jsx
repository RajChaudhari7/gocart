'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const STATUS_FLOW = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"]

export default function StoreOrders() {
    const { getToken } = useAuth()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    /* ================= FETCH ================= */
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

    /* ================= UPDATE STATUS ================= */
    const updateOrderStatus = async (order, newStatus) => {
        const currentIndex = STATUS_FLOW.indexOf(order.status)
        const newIndex = STATUS_FLOW.indexOf(newStatus)

        if (newIndex < currentIndex) {
            toast.error("Order status cannot go backward")
            return
        }

        try {
            const token = await getToken()
            await axios.post(
                '/api/store/orders',
                { orderId: order.id, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setOrders(prev =>
                prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
            )

            toast.success("Order status updated")
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    /* ================= CANCEL ================= */
    const cancelOrder = async (order) => {
        if (order.status === "DELIVERED" || order.status === "CANCELLED") return
        if (!confirm("Are you sure you want to cancel this order?")) return

        try {
            const token = await getToken()
            await axios.post(
                '/api/orders/cancel',
                { orderId: order.id },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            toast.success("Order canceled successfully")
            fetchOrders()
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    /* ================= PDF INVOICE ================= */
    const downloadInvoicePDF = async (order) => {
        const address = order.address
        const store = order.store

        const invoiceDiv = document.createElement("div")
        invoiceDiv.style.width = "794px"
        invoiceDiv.style.padding = "40px"
        invoiceDiv.style.background = "#fff"
        invoiceDiv.style.fontFamily = "Arial"
        invoiceDiv.innerHTML = `
            <div style="text-align:center;margin-bottom:30px;">
                <img src="${store?.logo}" style="max-height:60px;margin-bottom:10px" />
                <h2>${store?.name}</h2>
                <p>Mobile: ${store?.contact}</p>
            </div>

            <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
                <div>
                    <p><b>Invoice ID:</b> ${order.id}</p>
                    <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                    <p><b>Customer:</b> ${order.user?.name}</p>
                    <p><b>Email:</b> ${order.user?.email}</p>
                    <p><b>Mobile:</b> ${address?.phone}</p>
                </div>
            </div>

            <p><b>Shipping Address:</b><br/>
                ${address?.street}, ${address?.city}, ${address?.state},
                ${address?.zip}, ${address?.country}
            </p>

            <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                <thead>
                    <tr style="background:#f1f5f9;">
                        <th style="border:1px solid #ddd;padding:10px;">Product</th>
                        <th style="border:1px solid #ddd;padding:10px;">Qty</th>
                        <th style="border:1px solid #ddd;padding:10px;">Price</th>
                        <th style="border:1px solid #ddd;padding:10px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems.map(item => `
                        <tr>
                            <td style="border:1px solid #ddd;padding:10px;">${item.product?.name}</td>
                            <td style="border:1px solid #ddd;padding:10px;">${item.quantity}</td>
                            <td style="border:1px solid #ddd;padding:10px;">₹${item.price}</td>
                            <td style="border:1px solid #ddd;padding:10px;">₹${item.price * item.quantity}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <div style="text-align:right;margin-top:20px;">
                <p><b>Shipping Fee:</b> ₹${order.shippingFee || 0}</p>
                <p style="font-size:18px;"><b>Grand Total:</b> ₹${order.total}</p>
            </div>
        `

        document.body.appendChild(invoiceDiv)

        const canvas = await html2canvas(invoiceDiv, { scale: 2 })
        const pdf = new jsPDF("p", "pt", "a4")
        const width = pdf.internal.pageSize.getWidth()
        const height = (canvas.height * width) / canvas.width

        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height)
        pdf.save(`Invoice-${order.id}.pdf`)

        document.body.removeChild(invoiceDiv)
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
            <h1 className="text-3xl text-slate-700 mb-6 font-semibold">Store Orders</h1>

            <div className="grid gap-5 max-w-5xl">
                {orders.map(order => (
                    <div
                        key={order.id}
                        onClick={() => openModal(order)}
                        className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition cursor-pointer border-l-4 border-blue-500"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-medium">{order.user?.name}</h2>
                            <span>{order.status}</span>
                        </div>

                        <div className="flex gap-2 mt-4 items-center">
                            {order.status !== "CANCELLED" && (
                                <select
                                    value={order.status}
                                    disabled={order.status === "DELIVERED"}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => {
                                        e.stopPropagation()
                                        updateOrderStatus(order, e.target.value)
                                    }}
                                    className="border rounded px-3 py-1 text-sm"
                                >
                                    {STATUS_FLOW.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            )}

                            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                <button
                                    onClick={e => {
                                        e.stopPropagation()
                                        cancelOrder(order)
                                    }}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                onClick={e => {
                                    e.stopPropagation()
                                    downloadInvoicePDF(order)
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                            >
                                Download Invoice
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && selectedOrder && (
                <div
                    onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-lg"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-center">Order Details</h2>

                        <p><b>Customer:</b> {selectedOrder.user?.name}</p>
                        <p><b>Mobile:</b> {selectedOrder.address?.phone}</p>
                        <p>
                            <b>Shipping Address:</b>{" "}
                            {selectedOrder.address?.street},
                            {selectedOrder.address?.city},
                            {selectedOrder.address?.state},
                            {selectedOrder.address?.zip},
                            {selectedOrder.address?.country}
                        </p>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => downloadInvoicePDF(selectedOrder)}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Download Invoice
                            </button>

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
