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

            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">

                <table className="w-full table-fixed">

                    <thead className="bg-gray-100">

                        <tr>

                            <th className="w-[25%] px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Name
                            </th>

                            <th className="w-[20%] px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                Phone
                            </th>

                            <th className="w-[15%] px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                Vehicle
                            </th>

                            <th className="w-[20%] px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                Applied On
                            </th>

                            <th className="w-[20%] px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {drivers.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="py-12 text-center text-gray-500"
                                >
                                    No Applications Found
                                </td>

                            </tr>

                        ) : (

                            drivers.map((driver) => (

                                <tr
                                    key={driver.id}
                                    className="border-t hover:bg-gray-50 transition"
                                >

                                    <td className="px-6 py-5 font-medium text-gray-800">
                                        {driver.name}
                                    </td>

                                    <td className="px-6 py-5 text-center text-gray-700">
                                        {driver.phone}
                                    </td>

                                    <td className="px-6 py-5 text-center">

                                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                            {driver.vehicleType}
                                        </span>

                                    </td>

                                    <td className="px-6 py-5 text-center text-gray-600">
                                        {new Date(driver.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="px-6 py-5 text-center">

                                        <button className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition">
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