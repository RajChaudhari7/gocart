"use client";

import { motion } from "framer-motion";
import {
    ShoppingBag,
    ArrowRight,
    Sparkles,
    MapPin,
    Zap,
    Store,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmptyOrders() {
    const router = useRouter();

    return (
        <div className="relative flex items-center justify-center overflow-hidden py-10 sm:py-16">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut",
                }}
                className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
            >
                {/* ================= BACKGROUND DECOR ================= */}

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            x: [0, 20, 0],
                            y: [0, -15, 0],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-100/70 blur-3xl"
                    />

                    <motion.div
                        animate={{
                            x: [0, -15, 0],
                            y: [0, 15, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-indigo-100/60 blur-3xl"
                    />

                    <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-50 blur-3xl" />
                </div>

                {/* ================= FLOATING ICONS ================= */}

                <motion.div
                    animate={{
                        y: [0, -8, 0],
                        rotate: [0, 4, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute right-5 top-8 hidden rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-emerald-500 sm:block"
                >
                    <Store size={18} />
                </motion.div>

                <motion.div
                    animate={{
                        y: [0, 8, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-10 left-5 hidden rounded-xl border border-indigo-100 bg-indigo-50 p-2.5 text-indigo-500 sm:block"
                >
                    <MapPin size={17} />
                </motion.div>

                <motion.div
                    animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute right-12 bottom-16 hidden text-amber-400 sm:block"
                >
                    <Sparkles size={20} />
                </motion.div>

                {/* ================= MAIN CONTENT ================= */}

                <div className="relative text-center">

                    {/* Icon */}

                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: 0.15,
                            duration: 0.45,
                        }}
                        className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center"
                    >
                        {/* Outer rotating ring */}

                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 18,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute inset-0 rounded-full border border-dashed border-emerald-200"
                        />

                        {/* Soft glow */}

                        <div className="absolute inset-2 rounded-full bg-emerald-50 blur-md" />

                        {/* Icon container */}

                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
                            <motion.div
                                animate={{
                                    y: [0, -3, 0],
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <ShoppingBag size={38} strokeWidth={1.8} />
                            </motion.div>
                        </div>

                        {/* Small sparkle */}

                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 15, 0],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                            }}
                            className="absolute -right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-500"
                        >
                            <Sparkles size={13} />
                        </motion.div>
                    </motion.div>

                    {/* Badge */}

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700"
                    >
                        <Zap size={13} />
                        Ready to shop?
                    </motion.div>

                    {/* Heading */}

                    <motion.h2
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl"
                    >
                        No Orders Yet
                    </motion.h2>

                    {/* Description */}

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7"
                    >
                        Your order history is waiting for its first delivery.
                        Discover{" "}
                        <span className="font-semibold text-emerald-600">
                            local stores
                        </span>
                        , fresh groceries, fruits, vegetables and everyday
                        essentials — all in one place.
                    </motion.p>

                    {/* ================= FEATURES ================= */}

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
                    >
                        <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
                                🚚
                            </div>

                            <p className="mt-2 text-sm font-bold text-slate-800">
                                Fast Delivery
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Delivered to your doorstep
                            </p>
                        </div>

                        <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/50">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:scale-105">
                                🏪
                            </div>

                            <p className="mt-2 text-sm font-bold text-slate-800">
                                Local Stores
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Shop from nearby sellers
                            </p>
                        </div>

                        <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-200 hover:bg-amber-50/50">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:scale-105">
                                💳
                            </div>

                            <p className="mt-2 text-sm font-bold text-slate-800">
                                Easy Payments
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Pay your way
                            </p>
                        </div>
                    </motion.div>

                    {/* ================= CTA ================= */}

                    <motion.button
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        whileHover={{
                            scale: 1.02,
                            y: -2,
                        }}
                        whileTap={{
                            scale: 0.97,
                        }}
                        onClick={() => router.push("/")}
                        className="group relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200/70 sm:px-8 sm:py-4"
                    >
                        {/* Button shine */}

                        <motion.span
                            animate={{
                                x: ["-120%", "120%"],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-y-0 w-1/3 skew-x-12 bg-white/15"
                        />

                        <span className="relative">
                            Start Shopping
                        </span>

                        <motion.span
                            className="relative"
                            animate={{
                                x: [0, 4, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                            }}
                        >
                            <ArrowRight size={18} />
                        </motion.span>
                    </motion.button>

                    <p className="mt-4 text-xs text-slate-400">
                        Find something you’ll love today ✨
                    </p>

                </div>
            </motion.div>
        </div>
    );
}