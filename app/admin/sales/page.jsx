'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"

export default function SalesPage() {

    const { getToken } = useAuth()

    const [stores, setStores] = useState([])
    const [selectedStore, setSelectedStore] = useState(null)
    const [data, setData] = useState(null)

    const [month, setMonth] = useState(0)
    const [year, setYear] = useState(new Date().getFullYear())

    // ✅ Fetch Stores
    const fetchStores = async () => {
        const token = await getToken()

        const res = await axios.get('/api/admin/sales', {
            headers: { Authorization: `Bearer ${token}` }
        })

        setStores(res.data.stores)
    }

    // ✅ Fetch Store Data
    const fetchStoreData = async (storeId) => {
        const token = await getToken()

        const res = await axios.get('/api/admin/sales', {
            headers: { Authorization: `Bearer ${token}` },
            params: { storeId, month, year }
        })

        setData(res.data.data)
    }

    useEffect(() => {
        fetchStores()
    }, [])

    useEffect(() => {
        if (selectedStore) {
            fetchStoreData(selectedStore)
        }
    }, [selectedStore, month, year])

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">Sales Dashboard</h1>

            {/* FILTERS */}
            <div className="flex gap-3 mb-6">
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                    <option value={0}>All Months</option>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                        .map((m, i) => (
                            <option key={i} value={i+1}>{m}</option>
                        ))}
                </select>

                <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {[2023,2024,2025,2026].map(y => (
                        <option key={y}>{y}</option>
                    ))}
                </select>
            </div>

            {/* STORE LIST */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stores.map(store => (
                    <div
                        key={store.id}
                        onClick={() => setSelectedStore(store.id)}
                        className="p-4 bg-white shadow cursor-pointer rounded"
                    >
                        {store.name}
                    </div>
                ))}
            </div>

            {/* STORE DATA */}
            {data && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                    <div>💰 Revenue: ₹{data.deliveredRevenue}</div>
                    <div>❌ Cancelled Amount: ₹{data.cancelledAmount}</div>
                    <div>🔁 Returned Amount: ₹{data.returnedAmount}</div>

                    <div>📦 Delivered Orders: {data.deliveredCount}</div>
                    <div>❌ Cancelled Orders: {data.cancelledCount}</div>
                    <div>🔁 Returned Orders: {data.returnedCount}</div>

                    {data.topProduct && (
                        <div className="col-span-2">
                            🏆 Top Product: {data.topProduct.name}
                        </div>
                    )}

                </div>
            )}

        </div>
    )
}