"use client";

import { useState } from "react";
import axios from "axios";
import { User, Phone, Bike, Hash } from "lucide-react";

export default function AddDriver() {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        vehicle: "",
        vehicleNo: "",
        storeId: ""
    });

    const submit = async () => {
        try {
            setLoading(true);

            await axios.post("/api/admin/drivers", form);

            alert("Driver Added Successfully 🚚");

            setForm({
                name: "",
                phone: "",
                vehicle: "",
                vehicleNo: "",
                storeId: ""
            });

        } catch (error) {
            alert(
                error?.response?.data?.error ||
                "Failed to add driver"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border p-8">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    Add Driver
                </h1>

                <p className="text-slate-500 mt-1">
                    Register a new delivery driver
                </p>
            </div>

            <div className="space-y-5">

                {/* Driver Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Driver Name
                    </label>

                    <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    name: e.target.value
                                })
                            }
                            placeholder="Enter driver name"
                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Phone Number
                    </label>

                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                        <input
                            value={form.phone}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    phone: e.target.value
                                })
                            }
                            placeholder="Enter phone number"
                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                {/* Vehicle */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Vehicle Type
                    </label>

                    <div className="relative">
                        <Bike className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                        <input
                            value={form.vehicle}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    vehicle: e.target.value
                                })
                            }
                            placeholder="Bike / Scooter / Car"
                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                {/* Vehicle Number */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Vehicle Number
                    </label>

                    <div className="relative">
                        <Hash className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                        <input
                            value={form.vehicleNo}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    vehicleNo: e.target.value
                                })
                            }
                            placeholder="MH12AB1234"
                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
                >
                    {loading ? "Adding Driver..." : "Add Driver"}
                </button>
            </div>
        </div>
    );
}