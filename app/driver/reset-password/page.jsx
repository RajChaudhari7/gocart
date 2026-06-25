'use client'

import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function ResetPassword() {

    const router = useRouter()

    const [phone, setPhone] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {

        e.preventDefault()

        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match")
        }

        try {

            setLoading(true)

            await axios.post(
                "/api/driver/reset-password",
                {
                    phone,
                    password: newPassword
                }
            )

            toast.success("Password Updated")

            router.push("/driver/login")

        } catch (error) {

            toast.error(
                error?.response?.data?.error ||
                "Failed to reset password"
            )

        } finally {

            setLoading(false)

        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >

                <h1 className="text-2xl font-bold text-center mb-6">
                    Reset Password
                </h1>

                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-3 rounded mb-4"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded"
                >
                    {loading ? "Updating..." : "Reset Password"}
                </button>

            </form>

        </div>
    )
}