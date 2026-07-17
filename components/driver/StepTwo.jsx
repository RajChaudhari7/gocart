'use client'

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { toast } from "sonner";
import Image from "next/image"

const vehicles = [
    {
        name: "Bike",
        image: "/motorbike.png",
    },
    {
        name: "Scooter",
        image: "/scooter.png"
    }
]

export default function StepTwo({
    form,
    setForm,
    next,
    back
}) {

    const handleChange = (e) => {

        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))

    }

    const validate = () => {

        if (!form.vehicleType)
            return toast.error("Please select vehicle type")

        if (!form.vehicleNumber.trim())
            return toast.error("Vehicle number required")

        next()

    }

    return (

        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
        >

            <h2 className="text-3xl font-black text-white">
                Vehicle Details
            </h2>

            <p className="text-white/50 mt-2">
                Tell us about your vehicle
            </p>

            {/* Vehicle Cards */}

            <div className="grid grid-cols-2 gap-5 mt-10">

                {vehicles.map((vehicle) => (

                    <button
                        key={vehicle.name}
                        type="button"
                        onClick={() =>
                            setForm({
                                ...form,
                                vehicleType: vehicle.name
                            })
                        }
                        className={`rounded-3xl p-8 border transition-all duration-300 flex flex-col items-center gap-5
                            ${form.vehicleType === vehicle.name
                                ? "border-cyan-400 bg-cyan-400/10 scale-105"
                                : "border-white/10 bg-white/5 hover:border-cyan-400/40"
                            }`}
                    >

                        <Image
                            src={vehicle.image}
                            alt={vehicle.name}
                            width={110}
                            height={110}
                            className="object-contain"
                        />

                        <h2 className="text-white text-xl font-bold">
                            {vehicle.name}
                        </h2>

                    </button>

                ))}

            </div>

            {/* Vehicle Number */}

            <div className="mt-10">

                <label className="text-white/70 block mb-3">

                    Vehicle Number

                </label>

                <input
                    name="vehicleNumber"
                    value={form.vehicleNumber}
                    onChange={handleChange}
                    placeholder="MH39 AB1234"
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
                />

            </div>

            {/* Buttons */}

            <div className="flex justify-between mt-12">

                <button
                    onClick={back}
                    className="px-8 py-4 rounded-2xl bg-white/10 text-white flex items-center gap-2 hover:bg-white/20 transition"
                >

                    <ArrowLeft size={18} />

                    Back

                </button>

                <button
                    onClick={validate}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold flex items-center gap-2 hover:scale-105 transition"
                >

                    Next

                    <ArrowRight size={18} />

                </button>

            </div>

        </motion.div>

    )

}