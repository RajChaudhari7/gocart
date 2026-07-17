'use client'

import { useState } from "react"
import axios from "axios"
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Phone, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link";

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
            );

            localStorage.setItem(
                "driverId",
                data.driver.id
            );

            localStorage.setItem(
                "driverSession",
                data.sessionId
            );
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
        <div className="min-h-screen flex items-center justify-center bg-[#050914] text-white p-4">
            {/* Main Container */}
            <div className="max-w-5xl w-full flex flex-col md:flex-row items-center bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">

                {/* Left Side: Aesthetic Banner */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 bg-gradient-to-br from-cyan-900/20 to-[#050914]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-64 h-64 mb-8"
                    >
                        <Image
                            src="/driver.png"
                            alt="Driver Logo"
                            fill
                            className="object-contain mix-blend-screen"
                        />
                    </motion.div>
                    <h2 className="text-4xl font-black text-center mb-4">Nandurbar Bazar</h2>
                    <p className="text-cyan-400 font-medium tracking-widest uppercase text-sm mb-2">Driver Portal</p>
                    <p className="text-white/60 text-center max-w-sm font-light leading-relaxed">
                        Join our delivery fleet and start earning today. Reliable, fast, and local.
                    </p>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-[450px] p-8 md:p-12">
                    <div className="md:hidden flex justify-center mb-8">
                        <Image src="/driver.png" alt="Logo" width={80} height={80} className="mix-blend-screen" />
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black mb-2">Welcome Back</h1>
                        <p className="text-white/50">Login to your driver account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="relative">
                            <Phone className="absolute left-4 top-4 text-cyan-400" size={18} />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-cyan-400 transition"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-cyan-400" size={18} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-cyan-400 transition"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/driver/reset-password")}
                            className="text-xs text-white/40 hover:text-cyan-400 transition"
                        >
                            Forgot Password?
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {loading ? "Logging in..." : "Login to Start Earning"}
                            {!loading && <ArrowRight size={18} />}
                        </button>

                        <div className="pt-4 text-center">
                            <p className="text-white/60">
                                New Driver?{" "}
                                <Link
                                    href="/driver/register"
                                    className="text-cyan-400 font-semibold hover:text-cyan-300 transition"
                                >
                                    Register Here
                                </Link>
                            </p>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}