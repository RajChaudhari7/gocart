'use client'

import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useOrderStore } from "@/hooks/use-order-store"

const STATUS_FLOW = [
    "ORDER_PLACED",
    "PACKED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERY_INITIATED",
    "DELIVERED",      // ✅ ADD THIS
    "CANCELLED"
]





export default function StoreOrders() {
    const { getToken } = useAuth()
    const { setOrderCount } = useOrderStore()
    const [otpExpiryTime, setOtpExpiryTime] = useState(null)
    const [timeLeft, setTimeLeft] = useState(0)
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otpOrder, setOtpOrder] = useState(null)
    const [enteredOtp, setEnteredOtp] = useState("")
    const [verifyingOtp, setVerifyingOtp] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [resendingOtp, setResendingOtp] = useState(false)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const currentDate = new Date()

    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()) // 0-11
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)

    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ]

    // Get available years dynamically from orders
    const availableYears = [
        ...new Set(
            orders.map(order => new Date(order.createdAt).getFullYear())
        )
    ].sort((a, b) => b - a)

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)

        // 🔹 If exact date selected → highest priority
        if (selectedDate) {
            const selected = new Date(selectedDate)

            return (
                orderDate.getDate() === selected.getDate() &&
                orderDate.getMonth() === selected.getMonth() &&
                orderDate.getFullYear() === selected.getFullYear()
            )
        }

        // 🔹 Otherwise filter by Year + Month
        return (
            orderDate.getFullYear() === selectedYear &&
            orderDate.getMonth() === selectedMonth
        )
    })



    /* ================= FETCH ================= */
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

    /* ================= UPDATE STATUS (FIXED) ================= */
    const updateOrderStatus = async (order, newStatus) => {
        const currentIndex = STATUS_FLOW.indexOf(order.status)
        const newIndex = STATUS_FLOW.indexOf(newStatus)

        // Prevent backward or invalid updates
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

    // function to verify otp
    const verifyDeliveryOtp = async () => {
        if (!enteredOtp || enteredOtp.length < 6) {
            toast.error("Please enter valid 6-digit OTP")
            return
        }

        try {
            setVerifyingOtp(true)
            const token = await getToken()

            await axios.post(
                "/api/store/orders/verify-delivery-otp",
                { orderId: otpOrder.id, otp: enteredOtp },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            toast.success("Delivery verified. Order marked as DELIVERED ✅")

            setShowOtpModal(false)
            setEnteredOtp("")
            setOtpOrder(null)

            await fetchOrders()

        } catch (error) {
            toast.error(error?.response?.data?.error || "OTP verification failed")
        } finally {
            setVerifyingOtp(false)
        }
    }

    const revenue = filteredOrders.reduce(
        (total, order) => total + order.total,
        0
    )

    /* ================= PDF INVOICE (UNCHANGED) ================= */
    const downloadInvoicePDF = async (order) => {
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

        const logoBase64 = await getBase64Image(order.store?.logo);

        const invoiceDiv = document.createElement('div');
        invoiceDiv.style.width = '800px';
        invoiceDiv.style.padding = '50px';
        invoiceDiv.style.background = '#fff';
        invoiceDiv.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
        invoiceDiv.style.color = '#0f172a';

        invoiceDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items: flex-start; margin-bottom: 50px;">
        <div>
            ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="max-height:60px; margin-bottom:15px; display:block;" />` : ''}
            <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #10b981;">INVOICE</h1>
            <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;"># ${order.id}</p>
        </div>
        <div style="text-align: right;">
            <h2 style="font-size: 18px; margin: 0; color: #1e293b;">${order.store?.name || "Official Store"}</h2>
            <p style="font-size: 13px; color: #64748b; margin: 4px 0;">${order.store?.address || ""}</p>
            <p style="font-size: 13px; color: #64748b; margin: 0;">Phone: ${order.store?.contact || "N/A"}</p>
        </div>
    </div>

    <div style="height: 2px; background: #f1f5f9; margin-bottom: 40px;"></div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; font-size: 14px;">
        <div>
            <h3 style="font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 12px;">Billed To</h3>
            <p style="font-weight: 700; margin: 0; font-size: 16px;">${order.user?.name}</p>
            <p style="margin: 4px 0; color: #475569;">${order.user?.email}</p>
            <p style="margin: 4px 0; color: #475569; line-height: 1.4;">
                ${order.address?.street}, ${order.address?.city}<br>
                ${order.address?.state}, ${order.address?.zip}<br>
                ${order.address?.country}
            </p>
            <p style="margin: 4px 0; color: #475569;">Ph: ${order.address?.phone}</p>
        </div>
        <div style="text-align: right;">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 12px;">Payment Details</h3>
            <p style="margin: 4px 0;"><b>Date:</b> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 4px 0;"><b>Method:</b> ${order.paymentMethod || "N/A"}</p>
            <p style="margin: 4px 0;"><b>Status:</b> <span style="color: #10b981; font-weight: 600;">Paid</span></p>
        </div>
    </div>

    <table style="width:100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
            <tr style="text-align: left; border-bottom: 2px solid #0f172a;">
                <th style="padding: 12px 0; font-size: 13px; color: #64748b; text-transform: uppercase;">Description</th>
                <th style="padding: 12px 0; font-size: 13px; color: #64748b; text-transform: uppercase; text-align: center;">Qty</th>
                <th style="padding: 12px 0; font-size: 13px; color: #64748b; text-transform: uppercase; text-align: right;">Price</th>
                <th style="padding: 12px 0; font-size: 13px; color: #64748b; text-transform: uppercase; text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${order.orderItems.map(item => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 16px 0; font-weight: 500;">${item.product?.name}</td>
                    <td style="padding: 16px 0; text-align: center;">${item.quantity}</td>
                    <td style="padding: 16px 0; text-align: right;">₹${item.price.toLocaleString()}</td>
                    <td style="padding: 16px 0; text-align: right; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end;">
        <div style="width: 250px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #64748b;">
                <span>Subtotal</span>
                <span>₹${(order.total - 50).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #64748b;">
                <span>Shipping</span>
                <span>₹50.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 10px; border-top: 2px solid #f1f5f9; font-size: 18px; font-weight: 800; color: #0f172a;">
                <span>Grand Total</span>
                <span>₹${order.total.toLocaleString()}</span>
            </div>
        </div>
    </div>

    <div style="margin-top: 80px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 0;">Thank you for your business!</p>
        <p style="font-size: 12px; color: #94a3b8; margin: 4px 0;">If you have any questions about this invoice, please contact ${order.store?.contact || "support"}</p>
    </div>
    `;

        document.body.appendChild(invoiceDiv);

        const images = invoiceDiv.querySelectorAll("img");
        await Promise.all([...images].map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(res => img.onload = img.onerror = res);
        }));

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

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, "0")}:${s
            .toString()
            .padStart(2, "0")}`
    }

    const resendOtp = async () => {
        try {
            setResendingOtp(true)
            const token = await getToken()

            const { data } = await axios.post(
                "/api/store/orders/resend-otp",
                { orderId: otpOrder.id },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            toast.success("OTP resent to customer email")

            // ✅ USE RESPONSE ORDER (IMPORTANT)
            if (data.order) {
                setOtpOrder(data.order)

                if (data.order.deliveryOtpExpiry) {
                    const exp = new Date(data.order.deliveryOtpExpiry)
                    setOtpExpiryTime(exp)
                    setTimeLeft(Math.floor((exp - new Date()) / 1000))
                }
            }

            setResendCooldown(60)

        } catch (error) {
            toast.error(error?.response?.data?.error || "Resend failed")
        } finally {
            setResendingOtp(false)
        }
    }




    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        if (resendCooldown <= 0) return

        const t = setInterval(() => {
            setResendCooldown(prev => prev - 1)
        }, 1000)

        return () => clearInterval(t)
    }, [resendCooldown])


    useEffect(() => {
        if (!showOtpModal || !otpExpiryTime) return

        const interval = setInterval(() => {
            const diff = otpExpiryTime - new Date()
            setTimeLeft(Math.max(0, Math.floor(diff / 1000)))
        }, 1000)

        return () => clearInterval(interval)
    }, [showOtpModal, otpExpiryTime])


    if (loading) return <Loading />

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h1 className="text-3xl text-slate-700 font-semibold">
                    Store Orders
                </h1>

                <div className="flex gap-3">
                    {/* Month Dropdown */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(Number(e.target.value))
                            setSelectedDate(null) // reset date
                        }}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>
                                {month}
                            </option>
                        ))}
                    </select>

                    {/* Year Dropdown */}
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(Number(e.target.value))
                            setSelectedDate(null) // reset date
                        }}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        {[2023, 2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <input
                type="date"
                value={selectedDate || ""}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
            />

            {selectedDate && (
                <button
                    onClick={() => setSelectedDate(null)}
                    className="text-sm text-red-500 underline"
                >
                    Clear
                </button>
            )}

            <div className="bg-white shadow rounded-xl p-4 border mb-6">
                {selectedDate ? (
                    <>
                        <p className="text-sm text-gray-500">
                            Revenue on {new Date(selectedDate).toLocaleDateString()}
                        </p>
                        <p className="text-2xl font-bold text-emerald-600">
                            ₹{revenue}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-500">
                            Revenue in {months[selectedMonth]} {selectedYear}
                        </p>
                        <p className="text-2xl font-bold text-emerald-600">
                            ₹{revenue}
                        </p>
                    </>
                )}
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
                    {filteredOrders.map((order) => (
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
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => updateOrderStatus(order, e.target.value)}
                                        className="border rounded px-3 py-1 text-sm"
                                    >

                                        {STATUS_FLOW.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                )}

                                {order.status === "DELIVERY_INITIATED" && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()

                                            setOtpOrder(order)
                                            setShowOtpModal(true)

                                            if (order.deliveryOtpExpiry) {
                                                const exp = new Date(order.deliveryOtpExpiry)
                                                setOtpExpiryTime(exp)
                                                setTimeLeft(Math.floor((exp - new Date()) / 1000))
                                            } else {
                                                // 🔥 Force generate OTP if missing
                                                resendOtp()
                                            }
                                        }}
                                        className="px-3 py-1 bg-emerald-600 text-white rounded text-sm"
                                    >
                                        Verify Delivery OTP
                                    </button>
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

                        {/* CUSTOMER INFO */}
                        <div className="text-sm space-y-1 mb-4">
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

                        {/* PRODUCTS – FULLY RESTORED */}
                        <div className="space-y-3">
                            {selectedOrder.orderItems.map((item, i) => (
                                <div key={i} className="flex gap-4 border p-3 rounded-lg">
                                    <img
                                        src={item.product?.images?.[0]?.src || item.product?.images?.[0]}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{item.product?.name}</p>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        <p className="text-sm font-semibold">₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* SUMMARY (LIKE YOUR IMAGE) */}
                        <div className="mt-6 border-t pt-4 space-y-1 text-sm text-green-700">
                            <p><b>Payment Method:</b> {selectedOrder.paymentMethod}</p>
                            <p><b>Paid:</b> {selectedOrder.isPaid ? "Yes" : "No"}</p>
                            <p>
                                <b>Coupon:</b>{" "}
                                {selectedOrder.isCouponUsed
                                    ? `${selectedOrder.coupon?.code} (${selectedOrder.coupon?.discount}% OFF)`
                                    : "—"}
                            </p>
                            <p><b>Status:</b> {selectedOrder.status}</p>
                            <p><b>Order Date:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
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
            {/* ================= OTP VERIFY MODAL ================= */}
            {showOtpModal && otpOrder && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-xl font-semibold mb-2 text-center">
                            Verify Delivery OTP
                        </h2>

                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-600">
                                Ask customer for the OTP sent to their email
                            </p>

                            {timeLeft > 0 ? (
                                <p
                                    className={`mt-1 text-sm font-semibold ${timeLeft <= 60 ? "text-red-600" : "text-emerald-600"
                                        }`}
                                >
                                    OTP expires in {formatTime(timeLeft)}
                                </p>
                            ) : (
                                <p className="mt-1 text-sm font-semibold text-red-700">
                                    OTP has expired
                                </p>
                            )}
                        </div>


                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Enter 6-digit OTP
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={enteredOtp}
                                onChange={(e) =>
                                    setEnteredOtp(e.target.value.replace(/\D/g, ""))
                                }
                                className="w-full border rounded-lg px-4 py-2 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="••••••"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowOtpModal(false)
                                    setEnteredOtp("")
                                    setOtpOrder(null)
                                }}
                                className="flex-1 px-4 py-2 bg-slate-200 rounded-lg"
                                disabled={verifyingOtp}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={verifyDeliveryOtp}
                                disabled={verifyingOtp || timeLeft <= 0}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold disabled:opacity-60"
                            >
                                {verifyingOtp ? "Verifying..." : "Verify OTP"}
                            </button>

                            <div className="text-center mt-3">
                                {resendCooldown > 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Resend available in {formatTime(resendCooldown)}
                                    </p>
                                ) : (
                                    <button
                                        onClick={resendOtp}
                                        disabled={resendingOtp}
                                        className="text-sm text-emerald-600 font-semibold hover:underline disabled:opacity-50"
                                    >
                                        {resendingOtp ? "Resending..." : "Resend OTP"}
                                    </button>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            )}

        </>
    )
}