"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DriversPage() {

    const [drivers, setDrivers] = useState([]);

    const fetchDrivers = async () => {
        const { data } = await axios.get("/api/admin/drivers");
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
    }, []);

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Drivers
            </h1>

            <div className="bg-white rounded-xl shadow overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>
                            <th className="p-4 text-left">
                                Name
                            </th>

                            <th className="p-4 text-left">
                                Phone
                            </th>

                            <th className="p-4 text-left">
                                Vehicle
                            </th>

                            <th className="p-4 text-left">
                                Status
                            </th>

                            <th className="p-4 text-left">
                                Action
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {drivers.map((driver) => (

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
                                    {driver.vehicle}
                                </td>

                                <td className="p-4">

                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            driver.isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {driver.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                </td>

                                <td className="p-4">

                                    <button
                                        onClick={() =>
                                            toggleStatus(driver.id)
                                        }
                                        className={`px-4 py-2 rounded-lg text-white ${
                                            driver.isActive
                                                ? "bg-red-500"
                                                : "bg-green-500"
                                        }`}
                                    >
                                        {driver.isActive
                                            ? "Deactivate"
                                            : "Activate"}
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}