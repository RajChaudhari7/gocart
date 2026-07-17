'use client'

import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { toast } from "sonner";
import {
    Percent,
    Truck,
    Bike,
    IndianRupee,
    Save
} from "lucide-react"

export default function PlatformSettingsPage() {
    const { getToken } = useAuth()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        commissionPercent: 10,
        deliveryFee: 50,
        driverFee: 30,
        freeDeliveryAbove: 999999,
    })

    const fetchSettings = async () => {
        try {
            const token = await getToken()

            const { data } = await axios.get(
                "/api/admin/platform-settings",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setForm(data.settings)
        } catch (error) {
            toast.error(
                error?.response?.data?.error || "Failed to load settings."
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleSave = async () => {
        try {
            setSaving(true)

            const token = await getToken()

            const { data } = await axios.patch(
                "/api/admin/platform-settings",
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            toast.success(data.message)

        } catch (error) {
            toast.error(
                error?.response?.data?.error || "Update failed."
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-10">
                Loading...
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-8">

            <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Platform Settings
            </h1>

            <p className="text-slate-500 mb-8">
                Configure commission, delivery and driver charges.
            </p>

            <div className="grid md:grid-cols-2 gap-6">

                {/* Commission */}

                <div className="bg-white rounded-xl shadow border p-6">

                    <div className="flex items-center gap-3 mb-5">
                        <Percent className="text-green-600" />
                        <h2 className="font-semibold">
                            Commission Percentage
                        </h2>
                    </div>

                    <input
                        type="number"
                        value={form.commissionPercent}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                commissionPercent: Number(e.target.value),
                            })
                        }
                        className="w-full border rounded-lg px-4 py-3"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                        Seller receives remaining amount after commission deduction.
                    </p>

                </div>

                {/* Delivery */}

                <div className="bg-white rounded-xl shadow border p-6">

                    <div className="flex items-center gap-3 mb-5">
                        <Truck className="text-blue-600" />
                        <h2 className="font-semibold">
                            Delivery Charge
                        </h2>
                    </div>

                    <input
                        type="number"
                        value={form.deliveryFee}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                deliveryFee: Number(e.target.value),
                            })
                        }
                        className="w-full border rounded-lg px-4 py-3"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                        Delivery charge collected from customer.
                    </p>

                </div>

                {/* Driver Fee */}

                <div className="bg-white rounded-xl shadow border p-6">

                    <div className="flex items-center gap-3 mb-5">
                        <Bike className="text-orange-600" />
                        <h2 className="font-semibold">
                            Driver Fee
                        </h2>
                    </div>

                    <input
                        type="number"
                        value={form.driverFee}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                driverFee: Number(e.target.value),
                            })
                        }
                        className="w-full border rounded-lg px-4 py-3"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                        Driver payment deducted from delivery charge.
                    </p>

                </div>

                {/* Free Delivery */}

                <div className="bg-white rounded-xl shadow border p-6">

                    <div className="flex items-center gap-3 mb-5">
                        <IndianRupee className="text-purple-600" />
                        <h2 className="font-semibold">
                            Free Delivery Above
                        </h2>
                    </div>

                    <input
                        type="number"
                        value={form.freeDeliveryAbove}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                freeDeliveryAbove: Number(e.target.value),
                            })
                        }
                        className="w-full border rounded-lg px-4 py-3"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                        Orders above this amount receive free delivery.
                    </p>

                </div>

            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="mt-8 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl transition"
            >
                <Save size={18} />
                {saving ? "Saving..." : "Save Settings"}
            </button>

        </div>
    )
}