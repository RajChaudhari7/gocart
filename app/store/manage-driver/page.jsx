'use client'

import { useEffect, useState } from "react"

const ManageDriverPage = () => {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDrivers()
    }, [])

    const fetchDrivers = async () => {
        try {
            const res = await fetch('/api/store/driver')
            const data = await res.json()
            setDrivers(Array.isArray(data) ? data : data.drivers || [])
        } catch (error) {
            console.error(error)
            setDrivers([])
        } finally {
            setLoading(false)
        }
    }

    const toggleDriverStatus = async (id, isActive) => {
        try {
            await fetch(`/api/store/driver/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !isActive }),
            })
            fetchDrivers()
        } catch (err) {
            console.error(err)
        }
    }

    const deleteDriver = async (id) => {
        try {
            await fetch(`/api/store/driver/${id}`, {
                method: 'DELETE',
            })
            fetchDrivers()
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) {
        return <p className="p-6 text-gray-500">Loading drivers...</p>
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    Manage Drivers
                </h1>
                <p className="text-sm text-gray-500">
                    View, activate, or remove delivery partners
                </p>
            </div>

            {/* EMPTY STATE */}
            {drivers.length === 0 && (
                <div className="text-center py-12 bg-gray-50 border rounded-xl">
                    <p className="text-gray-500">No drivers found</p>
                </div>
            )}

            {/* DRIVER LIST */}
            <div className="grid gap-5">
                {drivers.map((driver) => (
                    <div
                        key={driver.id}
                        className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            {/* DRIVER INFO */}
                            <div>
                                <p className="font-semibold text-gray-800 text-lg">
                                    {driver.name}
                                </p>

                                <a
                                    href={`tel:${driver.phone}`}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    📞 {driver.phone}
                                </a>

                                <p className="text-xs text-gray-500 mt-1">
                                    {driver.vehicle || "No vehicle info"}
                                </p>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-3">

                                {/* STATUS TOGGLE */}
                                <button
                                    onClick={() => toggleDriverStatus(driver.id, driver.isActive)}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition
                                        ${driver.isActive
                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                                        }`}
                                >
                                    {driver.isActive ? "Active" : "Inactive"}
                                </button>

                                {/* DELETE BUTTON */}
                                <button
                                    onClick={() => deleteDriver(driver.id)}
                                    className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 transition"
                                >
                                    Delete
                                </button>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ManageDriverPage