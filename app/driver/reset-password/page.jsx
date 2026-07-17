'use client'

import { useState } from "react"
import axios from "axios"
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Phone, ArrowLeft, RefreshCw } from "lucide-react"
import Image from "next/image"

export default function ResetPassword() {
    const router = useRouter()
    const [phone, setPhone] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match")

        setLoading(true)
        try {
            await axios.post("/api/driver/reset-password", { phone, password: newPassword })
            toast.success("Password Updated Successfully")
            router.push("/driver/login")
        } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050914] text-white p-4">
            <div className="max-w-5xl w-full flex flex-col md:flex-row items-center bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">

                {/* Left Side: Aesthetic Branding */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 bg-gradient-to-br from-emerald-900/20 to-[#050914]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-64 h-64 mb-8"
                    >
                        <Image src="/driver.png" alt="Driver Logo" fill className="object-contain mix-blend-screen" />
                    </motion.div>
                    <h2 className="text-3xl font-black mb-2">Secure Access</h2>
                    <p className="text-white/60 text-center font-light">Update your credentials to keep your driver account secure.</p>
                </div>

                {/* Right Side: Reset Form */}
                <div className="w-full md:w-[450px] p-8 md:p-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-white/40 hover:text-cyan-400 mb-8 transition text-sm"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black mb-2">Reset Password</h1>
                        <p className="text-white/50">Enter details to secure your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-cyan-400 transition"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-cyan-400" size={18} />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-cyan-400 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {loading ? "Updating..." : "Update Password"}
                            {!loading && <RefreshCw size={18} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}