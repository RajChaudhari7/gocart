'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { MapPin, Package } from 'lucide-react'

export default function AppSplash() {
    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-slate-950 via-black to-slate-950 overflow-hidden flex items-center justify-center">

            {/* Background Glow */}
            <div className="absolute w-[700px] h-[700px] bg-green-500/10 rounded-full blur-3xl" />

            {/* Map Route */}
            <div className="absolute bottom-36 w-[80%] h-[2px] bg-white/10 overflow-hidden rounded-full">

                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    className="absolute top-0 left-0 h-full w-32 bg-green-400"
                />

            </div>

            {/* Start Pin */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-32 left-[12%]"
            >
                <MapPin className="text-green-400" size={34} />
            </motion.div>

            {/* Destination */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-32 right-[12%]"
            >
                <Package className="text-cyan-400" size={34} />
            </motion.div>

            {/* Delivery Rider */}
            <motion.div
                initial={{ x: -500 }}
                animate={{ x: 500 }}
                transition={{
                    duration: 2.5,
                    ease: 'easeInOut'
                }}
                className="absolute bottom-28 text-6xl"
            >
                🛵
            </motion.div>

            {/* Logo */}
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.4,
                    rotateY: -30
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    rotateY: 0
                }}
                transition={{
                    delay: 1.2,
                    duration: 1
                }}
                className="flex flex-col items-center"
            >

                <motion.div
                    animate={{
                        filter: [
                            'drop-shadow(0 0 15px #22c55e)',
                            'drop-shadow(0 0 40px #22c55e)',
                            'drop-shadow(0 0 15px #22c55e)',
                        ]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                >
                    <Image
                        src="/driver.png"
                        alt="Driver App"
                        width={180}
                        height={180}
                        priority
                    />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 1.7
                    }}
                    className="text-white text-3xl font-bold mt-6"
                >
                    Nandurbar Bazar
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        delay: 2
                    }}
                    className="text-green-400 tracking-[0.4em] text-sm mt-2"
                >
                    DRIVER APP
                </motion.p>

            </motion.div>

            {/* Loading Text */}
            <motion.div
                animate={{
                    opacity: [0.3, 1, 0.3]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5
                }}
                className="absolute bottom-14 text-green-400 text-sm tracking-wider"
            >
                Delivering Orders...
            </motion.div>

        </div>
    )
}