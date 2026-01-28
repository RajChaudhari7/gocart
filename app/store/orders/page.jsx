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
        invoiceDiv.style.width = "800px"
        invoiceDiv.style.padding = "40px"
        invoiceDiv.style.background = "#fff"
        invoiceDiv.style.fontFamily = "Arial"
        invoiceDiv.innerHTML = `
            <div style="text-align:center;margin-bottom:30px;">
                <img src="${store?.logo}" style="max-height:60px;" />
                <h1>${store?.name}</h1>
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
                        <th style="border:1px solid #ddd;padding:8px;">Product</th>
                        <th style="border:1px solid #ddd;padding:8px;">Qty</th>
                        <th style="border:1px solid #ddd;padding:8px;">Price</th>
                        <th style="border:1px solid #ddd;padding:8px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems.map(i => `
                        <tr>
                            <td style="border:1px solid #ddd;padding:8px;">${i.product?.name}</td>
                            <td style="border:1px solid #ddd;padding:8px;">${i.quantity}</td>
                            <td style="border:1px solid #ddd;padding:8px;">₹${i.price}</td>
                            <td style="border:1px solid #ddd;padding:8px;">₹${i.price * i.quantity}</td>
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
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width

        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight)
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
            <h1 className="text-3xl mb-6 font-semibold">Store Orders</h1>

            <div className="grid gap-5 max-w-5xl">
                {orders.map(order => (
                    <div
                        key={order.id}
                        onClick={() => openModal(order)}
                        className="bg-white p-5 rounded-xl shadow cursor-pointer"
                    >
                        <div className="flex justify-between mb-3">
                            <h2>{order.user?.name}</h2>
                            <span>{order.status}</span>
                        </div>

                        <select
                            value={order.status}
                            disabled={order.status === "DELIVERED"}
                            onClick={e => e.stopPropagation()}
                            onChange={e => updateOrderStatus(order, e.target.value)}
                        >
                            {STATUS_FLOW.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <button
                            onClick={e => { e.stopPropagation(); downloadInvoicePDF(order) }}
                            className="ml-2"
                        >
                            Download Invoice
                        </button>
                    </div>
                ))}
            </div>

            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div onClick={e => e.stopPropagation()} className="bg-white p-6 rounded-xl">
                        <p><b>Customer:</b> {selectedOrder.user?.name}</p>
                        <p><b>Mobile:</b> {selectedOrder.address?.phone}</p>
                        <p><b>Shipping Address:</b> {selectedOrder.address?.street}, {selectedOrder.address?.city}</p>

                        <button onClick={() => downloadInvoicePDF(selectedOrder)}>Download Invoice</button>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </>
    )
}
