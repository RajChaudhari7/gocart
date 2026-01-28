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

    /* ================= PDF INVOICE ================= */
    const downloadInvoicePDF = async (order) => {
        const shippingFee = order.shippingFee || 0

        const invoiceDiv = document.createElement("div")
        invoiceDiv.style.width = "800px"
        invoiceDiv.style.padding = "40px"
        invoiceDiv.style.background = "#fff"
        invoiceDiv.style.fontFamily = "Arial"
        invoiceDiv.innerHTML = `
            <div style="text-align:center;margin-bottom:30px;">
                ${order.store?.logo ? `<img src="${order.store.logo}" style="height:60px"/>` : ""}
                <h2>${order.store?.name || "Store"}</h2>
                <p>${order.store?.contact || ""}</p>
                <p>${order.store?.email || ""}</p>
            </div>

            <hr/>

            <p><b>Invoice ID:</b> ${order.id}</p>
            <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>

            <p><b>Customer:</b> ${order.user?.name}</p>
            <p><b>Email:</b> ${order.user?.email}</p>
            <p><b>Phone:</b> ${order.address?.phone || "N/A"}</p>
            <p><b>Address:</b> ${order.address?.street}, ${order.address?.city}, ${order.address?.state}</p>

            <table border="1" width="100%" cellspacing="0" cellpadding="8">
                ${order.orderItems.map(item => `
                    <tr>
                        <td>${item.product?.name}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.price}</td>
                        <td>₹${item.price * item.quantity}</td>
                    </tr>
                `).join("")}
            </table>

            <p style="text-align:right;margin-top:10px;">Shipping: ₹${shippingFee}</p>
            <h3 style="text-align:right;">Total: ₹${order.total}</h3>
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
        if (order.status === "CANCELLED") return
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
                        className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500 cursor-pointer"
                    >
                        <div className="flex justify-between mb-3">
                            <h2 className="text-lg">{order.user?.name}</h2>
                            <span>{order.status}</span>
                        </div>

                        <div className="flex gap-2 mt-4 items-center">

                            {/* CANCELLED → TEXT ONLY */}
                            {order.status === "CANCELLED" ? (
                                <span className="text-red-600 font-semibold">
                                    Order Cancelled
                                </span>
                            ) : (
                                <select
                                    value={order.status}
                                    disabled={order.status === "DELIVERED"}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => updateOrderStatus(order, e.target.value)}
                                    className="border rounded px-3 py-1 text-sm"
                                >
                                    {STATUS_FLOW.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            )}

                            {/* INVOICE */}
                            <button
                                onClick={(e) => {
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

            {/* ================= MODAL ================= */}
            {isModalOpen && selectedOrder && (
                <div
                    onClick={closeModal}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-xl p-6 max-w-2xl w-full"
                    >
                        <h2 className="text-xl mb-4">Order Details</h2>

                        {selectedOrder.orderItems.map((item, i) => (
                            <div key={i} className="flex gap-3 mb-2">
                                <img
                                    src={item.product.images?.[0]}
                                    className="w-14 h-14 object-cover"
                                />
                                <div>
                                    <p>{item.product?.name}</p>
                                    <p>Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={closeModal}
                            className="mt-4 px-4 py-2 bg-slate-200 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
