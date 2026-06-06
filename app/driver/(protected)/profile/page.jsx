'use client'

import { useEffect, useState } from "react"

export default function DriverProfile() {

    const [driver, setDriver] = useState(null)

    useEffect(() => {

        const storedDriver = localStorage.getItem("driver")

        if (storedDriver) {
            setDriver(JSON.parse(storedDriver))
        }

    }, [])

    if (!driver) {
        return <p className="p-6">Loading...</p>
    }

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Driver Profile
            </h1>

            <div className="bg-white shadow rounded-xl p-6 space-y-4">

                <div>
                    <p className="text-gray-500">Name</p>
                    <h2 className="font-semibold">
                        {driver.name}
                    </h2>
                </div>

                <div>
                    <p className="text-gray-500">Phone</p>
                    <h2 className="font-semibold">
                        {driver.phone}
                    </h2>
                </div>

                <div>
                    <p className="text-gray-500">Vehicle</p>
                    <h2 className="font-semibold">
                        {driver.vehicle}
                    </h2>
                </div>

                <div>
                    <p className="text-gray-500">Vehicle Number</p>
                    <h2 className="font-semibold">
                        {driver.vehicleNo}
                    </h2>
                </div>

                <div>
                    <p className="text-gray-500">Status</p>

                    <span
                        className={`px-3 py-1 rounded-full text-sm
                        ${driver.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {driver.isActive
                            ? "Active"
                            : "Inactive"}
                    </span>
                </div>

            </div>

        </div>
    )
}