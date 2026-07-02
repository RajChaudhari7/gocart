'use client'

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Success() {

    const router = useRouter()

    return (

        <motion.div
            initial={{
                opacity: 0,
                scale: 0.9
            }}
            animate={{
                opacity: 1,
                scale: 1
            }}
            transition={{
                duration: 0.5
            }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center"
        >

            <div className="flex justify-center">

                <div className="w-28 h-28 rounded-full bg-green-500/20 flex items-center justify-center">

                    <CheckCircle2
                        className="text-green-400"
                        size={70}
                    />

                </div>

            </div>

            <h1 className="text-4xl font-black text-white mt-8">

                Application Submitted

            </h1>

            <p className="text-white/60 mt-5 text-lg leading-8">

                Thank you for registering as a delivery partner.

                <br />

                Your application has been submitted successfully
                and is currently under admin verification.

            </p>

            <div className="mt-10 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6">

                <h2 className="text-cyan-400 font-bold text-xl">

                    What happens next?

                </h2>

                <div className="text-white/70 mt-5 space-y-3">

                    <p>
                        ✅ Admin will verify your documents
                    </p>

                    <p>
                        ✅ Vehicle details will be checked
                    </p>

                    <p>
                        ✅ Bank details will be verified
                    </p>

                    <p>
                        ✅ You'll receive approval to login
                    </p>

                </div>

            </div>

            <button

                onClick={() =>
                    router.push("/driver/login")
                }

                className="mt-10 w-full md:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold hover:scale-105 transition"

            >

                Go to Login

            </button>

        </motion.div>

    )

}