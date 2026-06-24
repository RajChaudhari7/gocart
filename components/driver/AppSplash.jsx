'use client'

import { motion } from 'framer-motion'
import { Truck } from 'lucide-react'

export default function AppSplash() {
    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-slate-950 to-black flex flex-col items-center justify-center overflow-hidden">

            {/* Glow */}
            <div className="absolute w-[500px] h-[500px] bg-green-500/20 rounded-full blur-3xl" />

            {/* Moving Truck */}
            <motion.div
                initial={{ x: -500 }}
                animate={{ x: 500 }}
                transition={{
                    duration: 2.2,
                    ease: 'easeInOut',
                }}
                className="absolute top-[42%]"
            >
                <Truck
                    size={90}
                    className="text-green-400 drop-shadow-[0_0_25px_rgba(34,197,94,0.8)]"
                />
            </motion.div>

            {/* Road */}
            <div className="absolute top-[55%] w-full h-1 bg-white/10 overflow-hidden">
                <motion.div
                    animate={{
                        x: ['-100%', '100%'],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: 'linear',
                    }}
                    className="w-32 h-full bg-white/40"
                />
            </div>

            {/* Logo */}
            <motion.img
                src="/driver-512.png"
                alt="Driver"
                initial={{
                    opacity: 0,
                    scale: 0.5,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                transition={{
                    delay: 1.5,
                    duration: 0.8,
                }}
                className="w-40 h-40 object-contain"
            />

            {/* Text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    delay: 1.8,
                }}
                className="mt-5 text-center"
            >
                <h1 className="text-white text-3xl font-bold">
                    Nandurbar Bazar
                </h1>

                <p className="text-green-400 tracking-widest mt-2 text-sm">
                    DRIVER APP
                </p>
            </motion.div>

            {/* Loading */}
            <motion.div
                animate={{
                    opacity: [0.3, 1, 0.3],
                }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                }}
                className="absolute bottom-24 text-green-400 text-sm"
            >
                Delivering Orders...
            </motion.div>
        </div>
    )
}