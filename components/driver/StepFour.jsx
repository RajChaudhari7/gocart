'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Landmark,
    User,
    CreditCard,
    Hash,
    Smartphone,
    ArrowLeft,
    CheckCircle
} from "lucide-react"

import axios from "axios"
import toast from "react-hot-toast"

export default function StepFour({

    form,
    setForm,
    back,
    setStep

}) {

    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {

        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))

    }

    const uploadFile = async (file) => {

        const formData = new FormData()

        formData.append("file", file)

        const { data } = await axios.post(
            "/api/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )

        return data.url

    }

    const submitApplication = async () => {

        if (!form.bankName)
            return toast.error("Bank name required")

        if (!form.accountHolder)
            return toast.error("Account holder required")

        if (!form.accountNumber)
            return toast.error("Account number required")

        if (!form.ifsc)
            return toast.error("IFSC required")

        try {

            setLoading(true)

            toast.loading("Uploading documents...", {
                id: "upload"
            })

            const profilePhoto =
                await uploadFile(form.profilePhoto)

            const driverLicense =
                await uploadFile(form.driverLicense)

            const aadharFront =
                await uploadFile(form.aadharFront)

            const aadharBack =
                await uploadFile(form.aadharBack)

            const rcBook =
                await uploadFile(form.rcBook)

            toast.loading("Submitting application...", {
                id: "upload"
            })

            await axios.post(
                "/api/driver/register",
                {

                    ...form,

                    profilePhoto,
                    driverLicense,
                    aadharFront,
                    aadharBack,
                    rcBook

                }
            )

            toast.success(
                "Application Submitted Successfully",
                {
                    id: "upload"
                }
            )

            setStep(5)

        }

        catch (error) {

            toast.error(

                error?.response?.data?.error ||
                "Registration Failed",

                {
                    id: "upload"
                }

            )

        }

        finally {

            setLoading(false)

        }

    }

    return (

        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        >

            <h2 className="text-3xl font-black text-white">

                Bank Details

            </h2>

            <p className="text-white/50 mt-2">

                This account will receive your delivery payouts.

            </p>

            <div className="grid md:grid-cols-2 gap-5 mt-10">

                {/* Bank */}

                <div className="relative">

                    <Landmark
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        name="bankName"
                        value={form.bankName}
                        onChange={handleChange}
                        placeholder="Bank Name"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

                {/* Holder */}

                <div className="relative">

                    <User
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        name="accountHolder"
                        value={form.accountHolder}
                        onChange={handleChange}
                        placeholder="Account Holder"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

                {/* Account */}

                <div className="relative">

                    <CreditCard
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        name="accountNumber"
                        value={form.accountNumber}
                        onChange={handleChange}
                        placeholder="Account Number"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

                {/* IFSC */}

                <div className="relative">

                    <Hash
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        name="ifsc"
                        value={form.ifsc}
                        onChange={handleChange}
                        placeholder="IFSC Code"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

                {/* UPI */}

                <div className="relative md:col-span-2">

                    <Smartphone
                        className="absolute left-4 top-4 text-cyan-400"
                        size={18}
                    />

                    <input
                        name="upiId"
                        value={form.upiId}
                        onChange={handleChange}
                        placeholder="UPI ID (Optional)"
                        className="w-full pl-12 p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                    />

                </div>

            </div>

            <div className="flex justify-between mt-12">

                <button

                    onClick={back}

                    className="px-8 py-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition flex items-center gap-2"

                >

                    <ArrowLeft size={18} />

                    Back

                </button>

                <button

                    disabled={loading}

                    onClick={submitApplication}

                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold hover:scale-105 transition flex items-center gap-2"

                >

                    <CheckCircle size={20} />

                    {

                        loading
                            ? "Submitting..."
                            : "Submit Application"

                    }

                </button>

            </div>

        </motion.div>

    )

}