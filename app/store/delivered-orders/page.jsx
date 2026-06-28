'use client'

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Loading from "@/components/Loading"

export default function DeliveredOrders() {
    const { getToken } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Filters
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    useEffect(() => {
        fetchDeliveredOrders()
    }, [])

    const fetchDeliveredOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/store/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Fetch all, but we will filter by DELIVERED in the logic below
            setOrders(data.orders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getOrderFinances = (order) => {
        const productTotal = order.orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const platformFee = productTotal * 0.10;
        const sellerEarnings = productTotal * 0.90;
        const shippingFee = Math.max(0, order.total - productTotal);
        return { productTotal, platformFee, sellerEarnings, shippingFee };
    };

    const filteredOrders = orders.filter(order => {
        if (order.status !== "DELIVERED") return false;

        const orderDate = new Date(order.createdAt)
        if (selectedDate) {
            const selected = new Date(selectedDate)
            return orderDate.getDate() === selected.getDate() &&
                orderDate.getMonth() === selected.getMonth() &&
                orderDate.getFullYear() === selected.getFullYear()
        }
        return orderDate.getFullYear() === selectedYear && orderDate.getMonth() === selectedMonth
    })

    // Financial Calculation for Revenue
    const totalRevenue = filteredOrders.reduce((acc, order) => acc + getOrderFinances(order).sellerEarnings, 0);

    const openModal = (order) => { setSelectedOrder(order); setIsModalOpen(true); }
    const closeModal = () => { setSelectedOrder(null); setIsModalOpen(false); }

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
    };

    const downloadInvoicePDF = async (order) => {
        const invoiceDiv = document.createElement('div');
        invoiceDiv.style.width = '800px';
        invoiceDiv.style.padding = '40px';
        invoiceDiv.style.background = '#ffffff';
        invoiceDiv.innerHTML = `
            <h1 style="color: #333;">Invoice #${order.id.slice(-6)}</h1>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <hr/>
            <h3>Customer: ${order.user?.name}</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="border-bottom: 2px solid #eee;"><th style="text-align: left; padding: 10px;">Item</th><th style="text-align: right; padding: 10px;">Price</th></tr></thead>
                <tbody>${order.orderItems.map(item => `<tr><td style="padding: 10px;">${item.product?.name} x ${item.quantity}</td><td style="text-align: right; padding: 10px;">₹${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('')}</tbody>
            </table>
            <h3 style="text-align: right;">Total: ₹${order.total.toFixed(2)}</h3>
        `;
        document.body.appendChild(invoiceDiv);
        const canvas = await html2canvas(invoiceDiv, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 40, 40, pdfWidth - 80, pdfHeight);
        pdf.save(`Invoice_${order.id.slice(-6)}.pdf`);
        document.body.removeChild(invoiceDiv);
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6 max-w-5xl">
            <h1 className="text-3xl font-semibold mb-6">Delivered Orders</h1>

            {/* Filter UI */}
            <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border">
                <select value={selectedMonth} onChange={(e) => { setSelectedMonth(Number(e.target.value)); setSelectedDate(null) }} className="border rounded-lg px-3 py-2 text-sm">
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => { setSelectedYear(Number(e.target.value)); setSelectedDate(null) }} className="border rounded-lg px-3 py-2 text-sm">
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <input type="date" value={selectedDate || ""} onChange={(e) => setSelectedDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                {selectedDate && <button onClick={() => setSelectedDate(null)} className="text-red-500 text-sm underline ml-2">Clear Date</button>}
            </div>

            {/* Revenue Display */}
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mb-6">
                <p className="text-sm text-emerald-600 font-medium">Total Delivered Revenue (90%)</p>
                <p className="text-3xl font-bold text-emerald-700">₹{totalRevenue.toFixed(2)}</p>
            </div>

            {filteredOrders.map((order) => {
                const finances = getOrderFinances(order);
                return (
                    <div key={order.id} onClick={() => openModal(order)} className="bg-white rounded-xl shadow-sm border p-5 mb-4 hover:shadow-md transition cursor-pointer border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-medium">{order.user?.name}</h2>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">{order.status}</span>
                        </div>
                        <HighlightOrderId id={order.id} />
                        <div className="grid grid-cols-2 gap-3 text-gray-600 text-sm mt-4">
                            <div><b className="text-gray-800">Earnings:</b> ₹{finances.sellerEarnings.toFixed(2)}</div>
                            <div><b className="text-gray-800">Total:</b> ₹{order.total}</div>
                        </div>
                        <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                            <button onClick={() => downloadInvoicePDF(order)} className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-sm font-medium">Customer Invoice</button>
                        </div>
                    </div>
                );
            })}


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
        </div>
    )
}