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

            console.log("API DATA:", data)

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
        return <p className="text-white p-6">Loading drivers...</p>
    }

    return (
        <div className="p-6 text-white">
            <h1 className="text-xl font-semibold mb-6">Manage Drivers</h1>

            <div className="space-y-4">
                {drivers.length === 0 && (
                    <p className="text-white/60">No drivers found.</p>
                )}

                {drivers.map((driver) => (
                    <div
                        key={driver.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                        {/* Driver Info */}
                        <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-white/60">{driver.phone}</p>
                            <p className="text-xs text-white/40">
                                {driver.vehicle || 'No vehicle info'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">

                            {/* Status Toggle */}
                            <button
                                onClick={() => toggleDriverStatus(driver.id, driver.isActive)}
                                className={`px-3 py-1 text-xs rounded-full ${driver.isActive
                                        ? 'bg-emerald-500 text-black'
                                        : 'bg-red-500 text-white'
                                    }`}
                            >
                                {driver.isActive ? 'Active' : 'Inactive'}
                            </button>

                            {/* Delete */}
                            <button
                                onClick={() => deleteDriver(driver.id)}
                                className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ManageDriverPage