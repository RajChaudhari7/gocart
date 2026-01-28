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
        // Helper to convert logo to Base64
        const getBase64Image = (url) => {
            return new Promise((resolve) => {
                if (!url) return resolve('');
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = url;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => resolve(''); // fallback if image fails
            });
        };

        const logoBase64 = await getBase64Image(order.store?.logo);

        // Create invoice container
        const invoiceDiv = document.createElement('div');
        invoiceDiv.style.width = '800px';
        invoiceDiv.style.padding = '40px';
        invoiceDiv.style.background = '#fff';
        invoiceDiv.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
        invoiceDiv.style.color = '#333';
        invoiceDiv.style.lineHeight = '1.6';

        invoiceDiv.innerHTML = `
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Shop Logo" style="max-height:80px; display:block; margin:0 auto 10px auto;" />` : ''}
        <h1 style="margin:10px 0 5px 0; color:#1e293b;">${order.store?.name || "My Shop"}</h1>
        <p style="margin:2px 0;">${order.store?.address || ""}</p>
        <p style="margin:2px 0;">Phone: ${order.store?.contact || "N/A"}</p>
    </div>

    <!-- Info Section -->
    <div style="display:flex; justify-content:space-between; margin-bottom:30px; gap:40px;">
        <div>
            <p><b>Invoice ID:</b> ${order.id}</p>
            <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div style="text-align:right;">
            <p><b>Customer:</b> ${order.user?.name}</p>
            <p><b>Email:</b> ${order.user?.email}</p>
            <p><b>Shipping Address:</b> ${order.address?.street}, ${order.address?.city}, ${order.address?.state}, ${order.address?.zip}, ${order.address?.country}</p>
            <p><b>Customer Phone:</b> ${order.address?.phone}</p>
        </div>
    </div>

    <!-- Order Items Table -->
    <table style="width:100%; border-collapse: collapse; margin-bottom:20px;">
        <thead>
            <tr style="background:#f1f5f9;">
                <th style="padding:12px; border:1px solid #ddd; text-align:left;">Product</th>
                <th style="padding:12px; border:1px solid #ddd; text-align:right;">Qty</th>
                <th style="padding:12px; border:1px solid #ddd; text-align:right;">Price</th>
                <th style="padding:12px; border:1px solid #ddd; text-align:right;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${order.orderItems.map(item => `
                <tr>
                    <td style="padding:12px; border:1px solid #ddd;">${item.product?.name}</td>
                    <td style="padding:12px; border:1px solid #ddd; text-align:right;">${item.quantity}</td>
                    <td style="padding:12px; border:1px solid #ddd; text-align:right;">₹${item.price}</td>
                    <td style="padding:12px; border:1px solid #ddd; text-align:right;">₹${item.price * item.quantity}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <!-- Totals Section (Shaded Card) -->
    <div style="max-width:300px; margin-left:auto; padding:15px; background:#f1f5f9; border-radius:8px; font-weight:bold; font-size:16px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Subtotal:</span>
            <span>₹${order.total - 50}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>Shipping Fee:</span>
            <span>₹50</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:18px;">
            <span>Grand Total:</span>
            <span>₹${order.total}</span>
        </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center; margin-top:40px; font-size:14px; color:#64748b;">
        Thank you for shopping with ${order.store?.name || "My Shop"}!
    </div>
  `;

        document.body.appendChild(invoiceDiv);

        // Wait for images to load
        const images = invoiceDiv.querySelectorAll("img");
        await Promise.all([...images].map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(res => img.onload = img.onerror = res);
        }));

        // Render PDF
        const canvas = await html2canvas(invoiceDiv, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice-${order.id}.pdf`);

        document.body.removeChild(invoiceDiv);
    };


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

            {orders.length === 0 ? (
                <p className="text-gray-500">No orders found</p>
            ) : (
                <div className="grid gap-5 max-w-5xl">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            onClick={() => openModal(order)}
                            className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition cursor-pointer border-l-4 border-blue-500"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-medium">{order.user?.name}</h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold
                                    ${order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                                        order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                                            "bg-yellow-100 text-yellow-800"}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-gray-600 text-sm">
                                <div><b>Total:</b> ₹{order.total}</div>
                                <div><b>Payment:</b> {order.paymentMethod}</div>
                                <div><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
                                <div><b>Coupon:</b> {order.isCouponUsed ? order.coupon?.code : "—"}</div>
                            </div>

                            <div className="flex gap-2 mt-4 items-center">
                                {order.status !== "CANCELLED" && (
                                    <select
                                        value={order.status}
                                        disabled={order.status === "DELIVERED"}
                                        onChange={e => updateOrderStatus(order, e.target.value)}
                                        className="border rounded px-3 py-1 text-sm"
                                    >
                                        {STATUS_FLOW.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                )}

                                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); cancelOrder(order) }}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}

                                {/* Download PDF outside modal */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); downloadInvoicePDF(order) }}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                                >
                                    Download Invoice
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ================= MODAL ================= */}
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
                        <p><b>Email:</b> {selectedOrder.user?.email}</p>
                        <p><b>Payment Method:</b> {selectedOrder.paymentMethod}</p>
                        <p><b>Shipping Address:</b> {selectedOrder.shippingAddress || "N/A"}</p>

                        <div className="mt-4 space-y-3">
                            {selectedOrder.orderItems.map((item, i) => (
                                <div key={i} className="flex gap-4 border p-2 rounded">
                                    <img
                                        src={item.product.images?.[0]?.src || item.product.images?.[0]}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-medium">{item.product?.name}</p>
                                        <p>Qty: {item.quantity}</p>
                                        <p>₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

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
