'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const STATUS_FLOW = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"]
const SHIPPING_FEE = 50   // ✅ temporary until stored in DB

export default function StoreOrders() {
    const { getToken } = useAuth()

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [previewHTML, setPreviewHTML] = useState("")
    const [showPreview, setShowPreview] = useState(false)

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

    /* ================= STATUS UPDATE ================= */
    const updateOrderStatus = async (order, newStatus) => {
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
            toast.error(error.message)
        }
    }

    /* ================= CANCEL ================= */
    const cancelOrder = async (order) => {
        if (!confirm("Cancel this order?")) return
        try {
            const token = await getToken()
            await axios.post(
                '/api/orders/cancel',
                { orderId: order.id },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            toast.success("Order cancelled")
            fetchOrders()
        } catch (error) {
            toast.error(error.message)
        }
    }

    /* ================= INVOICE PREVIEW ================= */
    const openInvoicePreview = (order) => {
        const address = order.address
        const store = order.store

        const shippingAddress = `
            ${address.name}<br/>
            ${address.street}, ${address.city}<br/>
            ${address.state} - ${address.zip}<br/>
            ${address.country}<br/>
            Phone: ${address.phone}
        `

        const subtotal = order.total - SHIPPING_FEE

        const html = `
        <div style="width:800px;padding:40px;font-family:Arial;color:#333">
            <div style="text-align:center">
                <img src="${store.logo}" style="height:60px"/>
                <h2>${store.name}</h2>
                <p>${store.address}</p>
                <p>Phone: ${store.contact}</p>
            </div>

            <hr/>

            <p><b>Invoice ID:</b> ${order.id}</p>
            <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>

            <h4>Shipping Address</h4>
            <p>${shippingAddress}</p>

            <table style="width:100%;border-collapse:collapse" border="1">
                <tr>
                    <th>Product</th><th>Qty</th><th>Price</th><th>Total</th>
                </tr>
                ${order.orderItems.map(i => `
                    <tr>
                        <td>${i.product.name}</td>
                        <td>${i.quantity}</td>
                        <td>₹${i.price}</td>
                        <td>₹${i.price * i.quantity}</td>
                    </tr>
                `).join("")}
            </table>

            <p style="text-align:right">Subtotal: ₹${subtotal}</p>
            <p style="text-align:right">Shipping Fee: ₹${SHIPPING_FEE}</p>
            <h3 style="text-align:right">Grand Total: ₹${order.total}</h3>
        </div>
        `

        setPreviewHTML(html)
        setShowPreview(true)
    }

    /* ================= DOWNLOAD PDF ================= */
    const downloadPDF = async () => {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = previewHTML
        document.body.appendChild(wrapper)

        const canvas = await html2canvas(wrapper, { scale: 2 })
        const imgData = canvas.toDataURL("image/png")

        const pdf = new jsPDF("p", "pt", "a4")
        const width = pdf.internal.pageSize.getWidth()
        const height = (canvas.height * width) / canvas.width

        pdf.addImage(imgData, "PNG", 0, 0, width, height)
        pdf.save("invoice.pdf")

        document.body.removeChild(wrapper)
        setShowPreview(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-3xl font-semibold mb-6">Store Orders</h1>

            {orders.map(order => (
                <div
                    key={order.id}
                    onClick={() => { setSelectedOrder(order); setIsModalOpen(true) }}
                    className="bg-white p-5 rounded-xl shadow cursor-pointer"
                >
                    <div className="flex justify-between">
                        <h2>{order.user.name}</h2>
                        <span>{order.status}</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <select
                            value={order.status}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                                e.stopPropagation()
                                updateOrderStatus(order, e.target.value)
                            }}
                        >
                            {STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
                        </select>

                        <button
                            onClick={e => { e.stopPropagation(); cancelOrder(order) }}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={e => { e.stopPropagation(); openInvoicePreview(order) }}
                        >
                            Invoice
                        </button>
                    </div>
                </div>
            ))}

            {/* INVOICE PREVIEW */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 max-w-3xl overflow-auto">
                        <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
                        <div className="flex justify-between mt-4">
                            <button onClick={downloadPDF}>Download PDF</button>
                            <button onClick={() => setShowPreview(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
