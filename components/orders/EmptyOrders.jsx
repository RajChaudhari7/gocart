"use client";

import { motion } from "framer-motion";
import {
    ShoppingBag,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmptyOrders() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center py-24">

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.6,
                }}
                className="
          relative
          overflow-hidden
          w-full
          max-w-2xl
          rounded-3xl
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-900
          via-slate-950
          to-black
          p-10
          text-center
          shadow-2xl
        "
            >

                {/* Background Glow */}

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_60%)]" />

                {/* Floating Circle */}

                <motion.div
                    animate={{
                        y: [0, -12, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                    }}
                    className="
            mx-auto
            mb-8
            flex
            h-28
            w-28
            items-center
            justify-center
            rounded-full
            bg-indigo-500/15
            border
            border-indigo-500/20
          "
                >
                    <ShoppingBag
                        size={50}
                        className="text-indigo-400"
                    />
                </motion.div>

                {/* Sparkles */}

                <motion.div
                    animate={{
                        rotate: [0, 12, -12, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                    }}
                    className="absolute right-10 top-10"
                >
                    <Sparkles
                        className="text-indigo-400/40"
                        size={22}
                    />
                </motion.div>

                <motion.div
                    animate={{
                        rotate: [0, -10, 10, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                    }}
                    className="absolute left-12 bottom-10"
                >
                    <Sparkles
                        className="text-indigo-400/30"
                        size={18}
                    />
                </motion.div>

                <h2 className="relative text-4xl font-bold text-white">
                    No Orders Yet
                </h2>

                <p className="relative mt-5 text-slate-400 leading-7 max-w-md mx-auto">
                    Looks like you haven't placed any orders on
                    <span className="font-semibold text-indigo-400">
                        {" "}Nandurbar Bazar
                    </span>
                    {" "}yet.

                    Browse local shops and discover groceries,
                    fruits, vegetables, dairy products and much
                    more delivered to your doorstep.
                </p>

                {/* Features */}

                <div className="relative mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="text-2xl mb-2">🚚</p>
                        <p className="text-sm text-slate-300">
                            Fast Delivery
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="text-2xl mb-2">🏪</p>
                        <p className="text-sm text-slate-300">
                            Local Stores
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="text-2xl mb-2">💳</p>
                        <p className="text-sm text-slate-300">
                            Cash on Delivery
                        </p>
                    </div>

                </div>

                {/* Button */}

                <motion.button
                    whileHover={{
                        scale: 1.04,
                    }}
                    whileTap={{
                        scale: 0.96,
                    }}
                    onClick={() => router.push("/")}
                    className="
            relative
            mt-10
            inline-flex
            items-center
            gap-3
            rounded-2xl
            bg-indigo-600
            px-8
            py-4
            font-semibold
            text-white
            shadow-lg
            shadow-indigo-500/30
            hover:bg-indigo-500
            transition
          "
                >
                    Start Shopping

                    <ArrowRight size={18} />
                </motion.button>

            </motion.div>

        </div>
    );
}