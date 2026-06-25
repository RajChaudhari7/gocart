'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function AppSplash() {
    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">

            {/* Background Glow */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-3xl"
            />

            {/* Logo */}
            <motion.div
                initial={{
                    scale: 0.4,
                    opacity: 0,
                    rotateY: -25,
                }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    rotateY: 0,
                }}
                transition={{
                    duration: 1.2,
                    ease: 'easeOut',
                }}
            >
                <motion.div
                    animate={{
                        filter: [
                            'drop-shadow(0 0 10px #10b981)',
                            'drop-shadow(0 0 40px #10b981)',
                            'drop-shadow(0 0 10px #10b981)',
                        ],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                >
                    <Image
                        src="/seller.png"
                        alt="Nandurbar Bazar Seller"
                        width={220}
                        height={220}
                        priority
                    />
                </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 1,
                    duration: 0.8,
                }}
                className="mt-6 text-center"
            >
                <h1 className="text-white text-3xl font-bold">
                    Nandurbar Bazar
                </h1>

                <p className="text-emerald-400 text-sm mt-2 tracking-widest">
                    SELLER PANEL
                </p>
            </motion.div>

            {/* Loading Bar */}
            <div className="absolute bottom-24 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear',
                    }}
                    className="w-full h-full bg-gradient-to-r from-emerald-400 to-green-500"
                />
            </div>
        </div>
    )
}