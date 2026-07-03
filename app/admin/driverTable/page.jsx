"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DriversPage() {

    const [drivers, setDrivers] = useState([]);
    const [status, setStatus] = useState("PENDING");

    const fetchDrivers = async () => {

        const { data } = await axios.get(
            `/api/admin/driver-applications?status=${status}`
        );

        setDrivers(data);

    };

    const toggleStatus = async (id) => {
        await axios.patch(
            `/api/admin/drivers/${id}/status`
        );

        fetchDrivers();
    };

    useEffect(() => {

        fetchDrivers();

    }, [status]);

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Drivers
            </h1>

            <div className="bg-white rounded-xl shadow overflow-hidden">

                <div className="flex gap-3 mb-6">

                    <button
                        onClick={() => setStatus("PENDING")}
                        className={`px-5 py-2 rounded-xl ${status === "PENDING"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200"
                            }`}
                    >
                        Pending
                    </button>

                    <button
                        onClick={() => setStatus("APPROVED")}
                        className={`px-5 py-2 rounded-xl ${status === "APPROVED"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200"
                            }`}
                    >
                        Approved
                    </button>

                    <button
                        onClick={() => setStatus("REJECTED")}
                        className={`px-5 py-2 rounded-xl ${status === "REJECTED"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200"
                            }`}
                    >
                        Rejected
                    </button>

                </div>

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Vehicle</th>
                            <th>Applied On</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        {drivers.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="text-center py-10 text-gray-500"
                                >
                                    No Applications Found
                                </td>

                            </tr>

                        ) : (

                            drivers.map((driver) => (

                                <tr
                                    key={driver.id}
                                    className="border-t"
                                >

                                    <td className="p-4">
                                        {driver.name}
                                    </td>

                                    <td className="p-4">
                                        {driver.phone}
                                    </td>

                                    <td className="p-4">
                                        {driver.vehicleType}
                                    </td>

                                    <td className="p-4">
                                        {new Date(driver.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="p-4">

                                        <button
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg"
                                        >
                                            View
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}