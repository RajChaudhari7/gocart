'use client'

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Loading from "@/components/Loading"

export default function DeliveredOrders() {
    const { getToken } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

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
            // Filter only DELIVERED
            setOrders(data.orders.filter(o => o.status === "DELIVERED"));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        if (selectedDate) {
            const selected = new Date(selectedDate)
            return orderDate.getDate() === selected.getDate() &&
                orderDate.getMonth() === selected.getMonth() &&
                orderDate.getFullYear() === selected.getFullYear()
        }
        return orderDate.getFullYear() === selectedYear && orderDate.getMonth() === selectedMonth
    })

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
                {selectedDate && <button onClick={() => setSelectedDate(null)} className="text-red-500 text-sm underline">Clear</button>}
            </div>

            {filteredOrders.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">No delivered orders found for this period.</p>
            ) : (
                <div className="grid gap-5">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border p-5 border-l-4 border-green-500 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-medium">{order.user?.name}</h2>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">DELIVERED</span>
                            </div>

                            <div className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded w-fit border mb-3">
                                #{order.id}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-gray-600 text-sm mt-4">
                                <div><b className="text-gray-800">Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
                                <div><b className="text-gray-800">Total Paid:</b> ₹{order.total}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}