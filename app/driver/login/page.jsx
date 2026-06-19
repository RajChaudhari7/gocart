'use client'

import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function DriverLogin() {

    const router = useRouter()

    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {

        e.preventDefault()

        try {

            setLoading(true)

            const { data } = await axios.post(
                "/api/driver/login",
                {
                    phone,
                    password
                }
            )

            localStorage.setItem(
                "driver",
                JSON.stringify(data.driver)
            )

            localStorage.setItem(
                "driverId",
                data.driver.id
            )

            await requestLocation(data.driver)

            try {

                await axios.post(
                    "/api/driver/assign-pending-orders"
                )

            } catch (err) {
                console.log(err)
            }

            toast.success("Login Successful")

            router.push("/driver")

        } catch (error) {

            toast.error(
                error?.response?.data?.error ||
                "Login failed"
            )

        } finally {

            setLoading(false)

        }

    }

    const requestLocation = async (driver) => {

        if (!navigator.geolocation) {
            toast.error("Location not supported")
            return
        }

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    await axios.post(
                        "/api/driver/update-location",
                        {
                            driverId: driver.id,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    )

                    await axios.post(
                        "/api/driver/assign-pending-orders"
                    )

                } catch (error) {

                    toast.error("Failed to save location")

                }

            },

            () => {

                toast.error(
                    "Location permission is required"
                )

            }

        )
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">

            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >

                <h1 className="text-2xl font-bold text-center mb-6">
                    Driver Login
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-3 rounded mb-4"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

        </div>
    )
}