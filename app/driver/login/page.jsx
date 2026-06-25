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

            try {
                await requestLocation(data.driver);
            } catch (err) {
                console.log("Location error:", err);
                toast.error("Unable to get location");
            }

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

            console.log(error)

            toast.error(
                error?.response?.data?.error ||
                error?.message ||
                "Login failed"
            )

        } finally {

            setLoading(false)

        }

    }

    const requestLocation = (driver) => {

        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {
                reject(new Error("Location not supported"))
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

                        resolve(true)

                    } catch (error) {

                        reject(error)

                    }

                },

                (error) => {

                    reject(error)

                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000
                }
            )
        })
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

                <div className="text-right mb-4">
                    <button
                        type="button"
                        onClick={() => router.push("/driver/reset-password")}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Forgot Password?
                    </button>
                </div>

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