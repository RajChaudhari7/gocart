'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
    Store,
    Package,
    BarChart3,
    ShoppingBag,
} from 'lucide-react'

export default function AppSplash() {
    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#07110d]">

            {/* ================= BACKGROUND ================= */}

            <div className="absolute inset-0">

                {/* Main emerald atmosphere */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.10] blur-[100px] sm:h-[520px] sm:w-[520px]"
                />

                {/* Top glow */}
                <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-emerald-400/[0.06] blur-[90px]" />

                {/* Bottom glow */}
                <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-green-400/[0.05] blur-[100px]" />

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
                        backgroundSize: '36px 36px',
                    }}
                />
            </div>

            {/* ================= FLOATING BUSINESS ICONS ================= */}

            {/* Store */}
            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute left-[10%] top-[25%] hidden sm:block"
            >
                <motion.div
                    animate={{
                        y: [-7, 7, -7],
                        rotate: [-2, 2, -2],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/10 bg-white/[0.04] backdrop-blur-md"
                >
                    <Store className="h-5 w-5 text-emerald-400/80" />
                </motion.div>
            </motion.div>

            {/* Orders */}
            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute right-[11%] top-[31%] hidden sm:block"
            >
                <motion.div
                    animate={{
                        y: [7, -7, 7],
                        rotate: [2, -2, 2],
                    }}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/10 bg-white/[0.04] backdrop-blur-md"
                >
                    <ShoppingBag className="h-5 w-5 text-emerald-400/80" />
                </motion.div>
            </motion.div>

            {/* Products */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="absolute bottom-[27%] left-[17%] hidden sm:block"
            >
                <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{
                        duration: 3.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-white/[0.04] backdrop-blur-md"
                >
                    <Package className="h-4 w-4 text-emerald-400/70" />
                </motion.div>
            </motion.div>

            {/* Analytics */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="absolute bottom-[29%] right-[17%] hidden sm:block"
            >
                <motion.div
                    animate={{ y: [5, -5, 5] }}
                    transition={{
                        duration: 4.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-white/[0.04] backdrop-blur-md"
                >
                    <BarChart3 className="h-4 w-4 text-emerald-400/70" />
                </motion.div>
            </motion.div>

            {/* ================= MAIN CONTENT ================= */}

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5">

                {/* Seller Logo */}

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.72,
                        y: 18,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.95,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative"
                >

                    {/* Soft aura */}
                    <motion.div
                        animate={{
                            opacity: [0.25, 0.45, 0.25],
                            scale: [0.9, 1.08, 0.9],
                        }}
                        transition={{
                            duration: 3.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute inset-0 rounded-[34px] bg-emerald-400/20 blur-2xl"
                    />

                    {/* Logo container */}
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-[32px] border border-emerald-400/10 bg-[#0d1b15]/90 shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:h-44 sm:w-44 sm:rounded-[38px]">

                        <Image
                            src="/seller.png"
                            alt="Nandurbar Bazar Seller"
                            width={180}
                            height={180}
                            priority
                            className="h-[82%] w-[82%] object-contain"
                        />

                    </div>
                </motion.div>

                {/* Brand */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 18,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.45,
                        duration: 0.7,
                    }}
                    className="mt-7 text-center"
                >

                    <h1 className="text-[28px] font-bold tracking-[-0.6px] text-white sm:text-[36px]">
                        Nandurbar Bazar
                    </h1>

                    <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="h-px w-5 bg-emerald-500/40" />

                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-400 sm:text-xs">
                            Seller Panel
                        </p>

                        <span className="h-px w-5 bg-emerald-500/40" />
                    </div>

                </motion.div>

                {/* Seller status */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 12,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.85,
                        duration: 0.6,
                    }}
                    className="mt-8 flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.035] px-4 py-2 backdrop-blur-md"
                >

                    <motion.span
                        animate={{
                            scale: [1, 1.25, 1],
                            opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                        }}
                        className="h-2 w-2 rounded-full bg-emerald-400"
                    />

                    <span className="text-xs font-medium text-gray-400">
                        Preparing your store dashboard...
                    </span>

                </motion.div>

            </div>

            {/* ================= LOADING ================= */}

            <div className="absolute bottom-10 left-1/2 w-[150px] -translate-x-1/2 sm:bottom-12 sm:w-[190px]">

                <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.08]">

                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="h-full w-1/2 rounded-full bg-emerald-400"
                    />

                </div>

                <p className="mt-3 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-gray-600">
                    Manage • Sell • Grow
                </p>

            </div>

        </div>
    )
}