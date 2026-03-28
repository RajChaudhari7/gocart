'use client'

import { useState } from "react"
import axios from "axios"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"

export default function AddDriver() {
    const { getToken } = useAuth()

    const [form, setForm] = useState({
        name: "",
        phone: "",
        vehicle: ""
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const token = await getToken()

            await axios.post(
                "/api/store/driver/add",
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            toast.success("Driver added 🚚")
            setForm({ name: "", phone: "", vehicle: "" })

        } catch (err) {
            toast.error(err?.response?.data?.error || "Error")
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">🚚 Add Driver</h1>

            <form onSubmit={handleSubmit} className="space-y-4">

                <input
                    placeholder="Driver Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border p-3 rounded-lg"
                />

                <input
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border p-3 rounded-lg"
                />

                <input
                    placeholder="Vehicle (Bike/Car)"
                    value={form.vehicle}
                    onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                    className="w-full border p-3 rounded-lg"
                />

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg"
                >
                    Add Driver
                </button>

            </form>
        </div>
    )
}