'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner";

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
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        .map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                </select>

                <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                    {[2023, 2024, 2025, 2026].map(y => (
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
            {/* STORE DATA */}
            {data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                    <div className="bg-green-100 p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Seller Revenue</p>
                        <h2 className="text-2xl font-bold text-green-700">
                            ₹{Number(data.sellerRevenue).toFixed(2)}
                        </h2>
                    </div>

                    <div className="bg-blue-100 p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Admin Revenue</p>
                        <h2 className="text-2xl font-bold text-blue-700">
                            ₹{Number(data.adminRevenue).toFixed(2)}
                        </h2>
                    </div>

                    <div className="bg-red-100 p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Cancelled Amount</p>
                        <h2 className="text-2xl font-bold text-red-700">
                            ₹{Number(data.cancelledAmount).toFixed(2)}
                        </h2>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Delivered Orders</p>
                        <h2 className="text-2xl font-bold">
                            {data.deliveredCount}
                        </h2>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Cancelled Orders</p>
                        <h2 className="text-2xl font-bold text-red-600">
                            {data.cancelledCount}
                        </h2>
                    </div>

                    {data.topProduct && (
                        <div className="bg-indigo-50 p-4 rounded-lg shadow col-span-2 md:col-span-4 flex items-center gap-4">

                            {data.topProduct.images?.length > 0 && (
                                <img
                                    src={data.topProduct.images[0]}
                                    alt={data.topProduct.name}
                                    className="w-16 h-16 rounded-lg object-cover border"
                                />
                            )}

                            <div>
                                <p className="text-sm text-gray-500">
                                    Best Selling Product
                                </p>
                                <h2 className="text-xl font-bold">
                                    🏆 {data.topProduct.name}
                                </h2>
                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>
    )
}