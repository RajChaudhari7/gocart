'use client'

import { motion } from "framer-motion"
import { User, Phone, Mail, Lock, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

export default function StepOne({
    form,
    setForm,
    next
}) {

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const validate = () => {

        if (!form.name.trim())
            return toast.error("Driver name is required")

        if (!/^[A-Za-z ]+$/.test(form.name))
            return toast.error("Invalid name")

        if (!form.phone)
            return toast.error("Phone number required")

        if (!/^[6-9]\d{9}$/.test(form.phone))
            return toast.error("Invalid mobile number")

        if (form.email) {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/

            if (!emailRegex.test(form.email))
                return toast.error("Invalid email")
        }

        if (!form.password)
            return toast.error("Password required")

        if (form.password.length < 6)
            return toast.error("Minimum 6 characters")

        if (form.password !== form.confirmPassword)
            return toast.error("Passwords do not match")

        next()

    }

    return (

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        >

            <h2 className="text-3xl font-black text-white">
                Personal Details
            </h2>

            <p className="text-white/50 mt-2">
                Tell us about yourself
            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-10">

                {/* Name */}

                <div className="relative">

                    <User
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

                {/* Phone */}

                <div className="relative">

                    <Phone
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Mobile Number"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

                {/* Email */}

                <div className="relative md:col-span-2">

                    <Mail
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email (Optional)"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

                {/* Password */}

                <div className="relative">

                    <Lock
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

                {/* Confirm */}

                <div className="relative">

                    <Lock
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

            </div>

            <div className="flex justify-end mt-10">

                <button
                    onClick={validate}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold flex items-center gap-2 hover:scale-105 transition"
                >

                    Next

                    <ArrowRight size={20} />

                </button>

            </div>

        </motion.div>

    )

}