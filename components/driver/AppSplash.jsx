
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { MapPin, Package, Truck } from 'lucide-react'

export default function AppSplash() {
    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-b from-slate-950 via-black to-slate-950 flex items-center justify-center">

            {/* Ambient Background Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute w-[500px] h-[500px] rounded-full bg-green-500/20 blur-[120px]"
            />

            {/* Small Background Glows */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl" />

            {/* Main Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">

                {/* Logo */}
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.7,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                    }}
                    className="flex flex-col items-center"
                >

                    {/* Logo Glow */}
                    <motion.div
                        animate={{
                            filter: [
                                'drop-shadow(0 0 12px rgba(34,197,94,0.4))',
                                'drop-shadow(0 0 35px rgba(34,197,94,0.8))',
                                'drop-shadow(0 0 12px rgba(34,197,94,0.4))',
                            ],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <Image
                            src="/driver.png"
                            alt="Nandurbar Bazar Driver"
                            width={150}
                            height={150}
                            priority
                            className="object-contain"
                        />
                    </motion.div>

                    {/* App Name */}
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.3,
                            duration: 0.6,
                        }}
                        className="mt-5 text-2xl sm:text-3xl font-bold text-white tracking-tight"
                    >
                        Nandurbar Bazar
                    </motion.h1>

                    {/* Driver App */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.5,
                            duration: 0.5,
                        }}
                        className="mt-2 flex items-center gap-2"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />

                        <span className="text-green-400 text-xs sm:text-sm font-medium tracking-[0.35em]">
                            DRIVER APP
                        </span>

                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    </motion.div>

                </motion.div>

                {/* Delivery Route */}
                <div className="absolute bottom-[25%] sm:bottom-[22%] w-[82%] max-w-[700px]">

                    {/* Route Background */}
                    <div className="relative h-[3px] bg-white/10 rounded-full">

                        {/* Animated Route */}
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{
                                duration: 2.8,
                                ease: 'easeInOut',
                            }}
                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                        />

                        {/* Moving Rider */}
                        <motion.div
                            initial={{ left: '0%' }}
                            animate={{ left: '100%' }}
                            transition={{
                                duration: 2.8,
                                ease: 'easeInOut',
                            }}
                            className="absolute -top-7 -translate-x-1/2"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -3, 0],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Truck
                                    size={30}
                                    strokeWidth={2}
                                    className="text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Start Point */}
                        <div className="absolute -left-1 -top-[7px]">
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [1, 0.5, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                }}
                                className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.9)]"
                            />
                        </div>

                        {/* Destination Point */}
                        <div className="absolute -right-1 -top-[7px]">
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [1, 0.5, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: 0.7,
                                }}
                                className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                            />
                        </div>

                    </div>

                    {/* Route Labels */}
                    <div className="flex justify-between mt-4">

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={13} className="text-green-400" />
                            Pickup
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Package size={13} className="text-cyan-400" />
                            Delivery
                        </div>

                    </div>

                </div>

                {/* Loading Section */}
                <div className="absolute bottom-10 flex flex-col items-center">

                    {/* Loading Text */}
                    <div className="flex items-center gap-1 text-sm text-slate-400">

                        <span>Connecting to delivery network</span>

                        <motion.span
                            animate={{
                                opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                times: [0, 0.2, 0.7, 1],
                            }}
                        >
                            .
                        </motion.span>

                        <motion.span
                            animate={{
                                opacity: [0, 0, 1, 1, 0],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                times: [0, 0.2, 0.4, 0.7, 1],
                            }}
                        >
                            .
                        </motion.span>

                        <motion.span
                            animate={{
                                opacity: [0, 0, 0, 1, 0],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                times: [0, 0.2, 0.4, 0.7, 1],
                            }}
                        >
                            .
                        </motion.span>

                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-40 sm:w-48 h-1 rounded-full bg-white/10 overflow-hidden">

                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{
                                duration: 3,
                                ease: 'easeInOut',
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-300"
                        />

                    </div>

                </div>

            </div>

        </div>
    )
}

