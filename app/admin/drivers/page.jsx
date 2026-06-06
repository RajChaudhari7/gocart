"use client";

import { useState } from "react";
import axios from "axios";
import {
    User,
    Phone,
    Bike,
    Hash,
    Lock
} from "lucide-react";

export default function AddDriver() {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        password: "",
        vehicle: "",
        vehicleNo: ""
    });

    const submit = async () => {
        if (!form.name || !form.phone || !form.password) {
            alert("Name, Phone and Password are required");
            return;
        }

        try {
            setLoading(true);

            await axios.post("/api/admin/drivers", form);

            alert("Driver Added Successfully 🚚");

            setForm({
                name: "",
                phone: "",
                password: "",
                vehicle: "",
                vehicleNo: ""
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
        <div className="min-h-screen bg-slate-50 p-6">

            <div className="max-w-3xl mx-auto">

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-6">

                        <h1 className="text-3xl font-bold text-white">
                            Add Driver
                        </h1>

                        <p className="text-emerald-100 mt-2">
                            Register a new delivery partner
                        </p>

                    </div>

                    {/* Form */}
                    <div className="p-8 space-y-6">

                        {/* Driver Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Driver Name
                            </label>

                            <div className="relative">
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value
                                        })
                                    }
                                    placeholder="Enter driver name"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Phone Number
                            </label>

                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            phone: e.target.value
                                        })
                                    }
                                    placeholder="9876543210"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Driver Password
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value
                                        })
                                    }
                                    placeholder="Enter login password"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Vehicle Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Vehicle Type
                            </label>

                            <div className="relative">
                                <Bike className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                                <input
                                    type="text"
                                    value={form.vehicle}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            vehicle: e.target.value
                                        })
                                    }
                                    placeholder="Bike / Scooter / Car"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Vehicle Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Vehicle Number
                            </label>

                            <div className="relative">
                                <Hash className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                                <input
                                    type="text"
                                    value={form.vehicleNo}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            vehicleNo: e.target.value.toUpperCase()
                                        })
                                    }
                                    placeholder="MH12AB1234"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Adding Driver..."
                                : "Add Driver 🚚"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}