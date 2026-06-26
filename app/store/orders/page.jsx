'use client'

import { useEffect, useRef, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useOrderStore } from "@/hooks/use-order-store"

const SELLER_STATUSES = [
    "ORDER_PLACED",
    "ORDER_CONFIRMED",
    "ORDER_PACKING",
    "ORDER_PACKED"
]

// Helper to calculate financials
const getOrderFinances = (order) => {
    // 1. Calculate actual product cost (ignores the delivery fee completely)
    const productTotal = order.orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // 2. Calculate platform commission (10%) and seller earnings (90%)
    const platformFee = productTotal * 0.10;
    const sellerEarnings = productTotal * 0.90;

    // 3. Identify shipping fee (Customer Total - Product Total)
    const shippingFee = Math.max(0, order.total - productTotal);

    return { productTotal, platformFee, sellerEarnings, shippingFee };
};

export default function StoreOrders() {
    const { getToken } = useAuth()
    const { setOrderCount } = useOrderStore()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const currentDate = new Date()

    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)
    const [statusFilter, setStatusFilter] = useState("ALL")
    const audioRef = useRef(null);
    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ]

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        audioRef.current = new Audio("/sounds/order.mp3");
    }, []);

    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get('/api/store/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Check if new orders arrived
                if (data.orders.length > orders.length) {
                    // Play sound if orders increased
                    audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
                    toast.success("New order received!");
                }

                setOrders(data.orders);
                setOrderCount(data.activeCount);
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, [orders.length]);

    const filteredOrders = orders.filter(order => {
        const isFinished = ["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status);
        if (isFinished) return false;
        const orderDate = new Date(order.createdAt)

        if (selectedDate) {
            const selected = new Date(selectedDate)
            if (
                orderDate.getDate() !== selected.getDate() ||
                orderDate.getMonth() !== selected.getMonth() ||
                orderDate.getFullYear() !== selected.getFullYear()
            ) {
                return false
            }
        } else {
            if (
                orderDate.getFullYear() !== selectedYear ||
                orderDate.getMonth() !== selectedMonth
            ) {
                return false
            }
        }

        if (statusFilter !== "ALL" && order.status !== statusFilter) {
            return false
        }

        return true
    })

    /* ================= FINANCIAL CALCULATIONS ================= */

    // 🟢 Revenue: 90% of product total (Exclude Cancelled + Returned)
    const revenue = filteredOrders
        .filter(order => !["CANCELLED", "RETURNED"].includes(order.status))
        .reduce((total, order) => total + getOrderFinances(order).sellerEarnings, 0)

    // 🔴 Cancelled Amount: 100% of product total (excluding delivery)
    const cancelledAmount = filteredOrders
        .filter(order => order.status === "CANCELLED")
        .reduce((total, order) => total + getOrderFinances(order).sellerEarnings, 0)

    // 🟠 Returned Amount: 100% of product total (excluding delivery)
    const returnedAmount = filteredOrders
        .filter(order => order.status === "RETURNED")
        .reduce((total, order) => total + getOrderFinances(order).sellerEarnings, 0)


    /* ================= FETCH & ACTIONS ================= */
    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/store/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(data.orders);
            setOrderCount(data.activeCount);
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (order, newStatus) => {
        const currentIndex = SELLER_STATUSES.indexOf(order.status)
        const newIndex = SELLER_STATUSES.indexOf(newStatus)

        if (newIndex < currentIndex) {
            toast.error("You cannot move order status backwards")
            return
        }

        try {
            const token = await getToken();
            await axios.post(
                '/api/store/orders',
                { orderId: order.id, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchOrders();
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    };

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

    /* ================= PDF EXPORTS ================= */
    const downloadReportPDF = async () => {
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
                img.onerror = () => resolve('');
            });
        };

        const store = filteredOrders[0]?.store || {}
        const logoBase64 = await getBase64Image(store?.logo)

        const reportDiv = document.createElement('div')
        reportDiv.style.width = '1000px'
        reportDiv.style.padding = '50px'
        reportDiv.style.background = '#ffffff'
        reportDiv.style.fontFamily = 'Inter, system-ui, sans-serif'
        reportDiv.style.color = '#0f172a'

        reportDiv.innerHTML = `
        <div style="border:1px solid #e5e7eb; border-radius:16px; padding:40px; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div style="display:flex; align-items:center; gap:15px;">
                    ${logoBase64 ? `<img src="${logoBase64}" style="height:50px; border-radius:10px;" />` : ''}
                    <div>
                        <h1 style="margin:0; font-size:24px; font-weight:700;">${store?.name || "Store"}</h1>
                        <p style="margin:2px 0; font-size:13px; color:#64748b;">Premium Sales & Payout Report</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:12px; color:#94a3b8; margin:0;">Generated On</p>
                    <p style="font-size:13px; font-weight:600;">${new Date().toLocaleString()}</p>
                </div>
            </div>

            <div style="margin-bottom:25px;">
                <h2 style="margin:0; font-size:20px; font-weight:600; color:#4f46e5;">Earnings Analytics</h2>
                <p style="margin:5px 0; color:#64748b;">
                    ${selectedDate ? `Date: ${new Date(selectedDate).toLocaleDateString()}` : `Month: ${months[selectedMonth]} ${selectedYear}`}
                </p>
            </div>

            <div style="display:flex; gap:20px; margin-bottom:30px;">
                <div style="flex:1; background:#ecfdf5; padding:20px; border-radius:12px;">
                    <p style="margin:0; font-size:13px; color:#059669;">Net Earnings (90%)</p>
                    <h2 style="margin-top:5px;">₹${revenue.toFixed(2)}</h2>
                </div>
                <div style="flex:1; background:#fee2e2; padding:20px; border-radius:12px;">
                    <p style="margin:0; font-size:13px; color:#dc2626;">Lost Value (Cancelled)</p>
                    <h2 style="margin-top:5px;">₹${cancelledAmount.toFixed(2)}</h2>
                </div>
                <div style="flex:1; background:#fff7ed; padding:20px; border-radius:12px;">
                    <p style="margin:0; font-size:13px; color:#ea580c;">Lost Value (Returned)</p>
                    <h2 style="margin-top:5px;">₹${returnedAmount.toFixed(2)}</h2>
                </div>
            </div>

            <table style="width:100%; border-collapse:separate; border-spacing:0 10px;">
                <thead>
                    <tr style="text-align:left; font-size:13px; color:#64748b;">
                        <th style="padding:10px;">Customer</th>
                        <th style="padding:10px;">Date</th>
                        <th style="padding:10px;">Status</th>
                        <th style="padding:10px; text-align:right;">Platform Fee</th>
                        <th style="padding:10px; text-align:right;">Your Earnings</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredOrders.map(order => {
            const finances = getOrderFinances(order);
            let statusColor = "#eab308";
            let bgColor = "#fef9c3";

            if (order.status === "DELIVERED") { statusColor = "#16a34a"; bgColor = "#dcfce7"; }
            if (order.status === "CANCELLED") { statusColor = "#dc2626"; bgColor = "#fee2e2"; }
            if (order.status === "RETURNED") { statusColor = "#ea580c"; bgColor = "#ffedd5"; }

            return `
                        <tr style="background:#f9fafb;">
                            <td style="padding:12px; border-top-left-radius:10px; border-bottom-left-radius:10px;">${order.user?.name}</td>
                            <td style="padding:12px;">${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td style="padding:12px;">
                                <span style="padding:6px 12px; border-radius:999px; font-size:12px; font-weight:600; color:${statusColor}; background:${bgColor}; display:inline-block;">
                                    ${order.status}
                                </span>
                            </td>
                            <td style="padding:12px; text-align:right; color:#ef4444;">-₹${finances.platformFee.toFixed(2)}</td>
                            <td style="padding:12px; text-align:right; font-weight:600; color:#10b981; border-top-right-radius:10px; border-bottom-right-radius:10px;">
                                ₹${finances.sellerEarnings.toFixed(2)}
                            </td>
                        </tr>
                        `
        }).join('')}
                </tbody>
            </table>
        </div>
        `

        document.body.appendChild(reportDiv)
        const canvas = await html2canvas(reportDiv, { scale: 2 })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'pt', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`Earnings-Report-${Date.now()}.pdf`)
        document.body.removeChild(reportDiv)
    }

    const downloadInvoicePDF = async (order) => {
        // Customer invoice code remains the same because the customer 
        // pays the full total including shipping.
        // ... (Keep your existing downloadInvoicePDF code here) ...
    };

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    // Helper to highlight the last 4 digits of the order ID
    const HighlightOrderId = ({ id }) => {
        if (!id) return null;
        const start = id.slice(0, -4);
        const end = id.slice(-4);
        return (
            <div className="flex items-center text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded w-fit border border-gray-200 mb-3 shadow-sm">
                <span>#{start}</span>
                <span className="text-indigo-700 font-bold text-base tracking-widest bg-indigo-100 px-1 rounded ml-[1px]">
                    {end}
                </span>
            </div>
        );
    }

    if (loading) return <Loading />

    return (
        <>

            <div className="hidden">
                <button onClick={() => audioRef.current?.play().then(() => audioRef.current.pause())}>
                    Enable Notifications
                </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h1 className="text-3xl text-slate-700 font-semibold">Store Orders</h1>
                <div className="flex gap-3">
                    <button
                        onClick={downloadReportPDF}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700"
                    >
                        Download Report
                    </button>
                    <select
                        value={selectedMonth}
                        onChange={(e) => { setSelectedMonth(Number(e.target.value)); setSelectedDate(null) }}
                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => { setSelectedYear(Number(e.target.value)); setSelectedDate(null) }}
                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                    >
                        {[2023, 2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                    >
                        <option value="ALL">All Orders</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="RETURNED">Returned</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <input
                type="date"
                value={selectedDate || ""}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm mb-2"
            />

            {selectedDate && (
                <button
                    onClick={() => setSelectedDate(null)}
                    className="text-sm text-red-500 underline ml-3"
                >
                    Clear
                </button>
            )}

            <div className="bg-white shadow rounded-xl p-5 border mb-6">
                <p className="text-sm text-gray-500 mb-4">
                    {selectedDate
                        ? `Earnings on ${new Date(selectedDate).toLocaleDateString()}`
                        : `Earnings in ${months[selectedMonth]} ${selectedYear}`
                    }
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* 🟢 Earnings */}
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                        <p className="text-sm text-emerald-600 font-medium">Net Earnings</p>
                        <p className="text-2xl font-bold text-emerald-700">₹{revenue.toFixed(2)}</p>
                    </div>

                    {/* 🔴 Cancelled Amount */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-sm text-red-600 font-medium">Lost Value (Cancelled)</p>
                        <p className="text-2xl font-bold text-red-700">₹{cancelledAmount.toFixed(2)}</p>
                    </div>

                    {/* 🟠 Returned Amount */}
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <p className="text-sm text-orange-600 font-medium">Lost Value (Returned)</p>
                        <p className="text-2xl font-bold text-orange-700">₹{returnedAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">
                    {selectedDate
                        ? `No orders on ${new Date(selectedDate).toLocaleDateString()}`
                        : `No orders in ${months[selectedMonth]} ${selectedYear}`
                    }
                </p>
            ) : (
                <div className="grid gap-5 max-w-5xl">
                    {filteredOrders.map((order) => {
                        const finances = getOrderFinances(order);

                        return (
                            <div
                                key={order.id}
                                onClick={() => openModal(order)}
                                className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition cursor-pointer border-l-4 border-indigo-500"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-lg font-medium">{order.user?.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                        ${order.status === "DELIVERED" ? "bg-green-100 text-green-800"
                                            : order.status === "CANCELLED" ? "bg-red-100 text-red-800"
                                                : order.status === "RETURNED" ? "bg-orange-100 text-orange-800"
                                                    : order.status === "DRIVER_ASSIGNED" ? "bg-blue-100 text-blue-800"
                                                        : "bg-yellow-100 text-yellow-800"}`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Inserted Highlighted Order ID here */}
                                <HighlightOrderId id={order.id} />

                                <div className="grid grid-cols-2 gap-3 text-gray-600 text-sm mt-4">
                                    <div><b className="text-gray-800">Your Earnings:</b> <span className="text-emerald-600 font-semibold">₹{finances.sellerEarnings.toFixed(2)}</span></div>
                                    <div><b className="text-gray-800">Payment:</b> {order.paymentMethod}</div>
                                    <div><b className="text-gray-800">Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
                                    <div><b className="text-gray-800">Customer Paid:</b> ₹{order.total}</div>
                                </div>

                                <div className="flex gap-2 mt-4 items-center">
                                    {order.status !== "CANCELLED" && (
                                        <select
                                            value={order.status}
                                            disabled={
                                                order.status === "DELIVERED" ||
                                                order.status === "RETURNED" ||
                                                order.status === "CANCELLED" ||
                                                !SELLER_STATUSES.includes(order.status)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => updateOrderStatus(order, e.target.value)}
                                            className="border rounded px-3 py-1 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {SELLER_STATUSES.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    )}

                                    {![
                                        "DRIVER_ASSIGNED", "REACHED_SHOP", "PICKED_UP",
                                        "OUT_FOR_DELIVERY", "DELIVERY_INITIATED",
                                        "DELIVERED", "CANCELLED"
                                    ].includes(order.status) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); cancelOrder(order) }}
                                                className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition"
                                            >
                                                Cancel
                                            </button>
                                        )}

                                    <button
                                        onClick={(e) => { e.stopPropagation(); downloadInvoicePDF(order) }}
                                        className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-sm font-medium transition"
                                    >
                                        Customer Invoice
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ================= MODAL ================= */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Order Finances & Details</h2>
                            <HighlightOrderId id={selectedOrder.id} />
                        </div>

                        {/* FINANCIAL BREAKDOWN */}
                        {(() => {
                            const stats = getOrderFinances(selectedOrder);
                            return (
                                <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200">
                                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-4">Payout Breakdown</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-slate-600">
                                            <span>Product Total</span>
                                            <span>₹{stats.productTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-red-500">
                                            <span>Platform Commission (10%)</span>
                                            <span>- ₹{stats.platformFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400 border-b pb-3">
                                            <span>Delivery Fee (Paid by Customer)</span>
                                            <span>₹{stats.shippingFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-emerald-600 pt-1">
                                            <span>Your Net Earnings</span>
                                            <span>₹{stats.sellerEarnings.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* CUSTOMER INFO */}
                        <div className="bg-white border rounded-xl p-5 mb-6">
                            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">Customer Details</h3>
                            <div className="text-sm space-y-2 text-slate-700">
                                <p><b>Name:</b> {selectedOrder.user?.name}</p>
                                <p><b>Email:</b> {selectedOrder.user?.email}</p>
                                <p><b>Phone:</b> {selectedOrder.address?.phone || "N/A"}</p>
                                <p>
                                    <b>Address:</b>{" "}
                                    {selectedOrder.address
                                        ? `${selectedOrder.address.street}, ${selectedOrder.address.city}, ${selectedOrder.address.state}, ${selectedOrder.address.zip}, ${selectedOrder.address.country}`
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* PRODUCTS */}
                        <div className="space-y-3 mb-6">
                            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500">Ordered Items</h3>
                            {selectedOrder.orderItems.map((item, i) => (
                                <div key={i} className="flex gap-4 border p-3 rounded-xl bg-white">
                                    <img src={item.product?.images?.[0]?.src || item.product?.images?.[0]} className="w-16 h-16 object-cover rounded-lg border" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{item.product?.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                            <button onClick={() => downloadInvoicePDF(selectedOrder)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition">
                                Download Customer Invoice
                            </button>
                            <button onClick={closeModal} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}