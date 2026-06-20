'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center min-h-screen bg-[#020617]/90 backdrop-blur-xl overflow-hidden">

      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="relative flex flex-col items-center gap-8 p-12 rounded-3xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

        {/* Orbital Loader with Image Core */}
        <div className="relative w-32 h-32 flex items-center justify-center">

          {/* Outer Indigo Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-white/5 border-t-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
          />

          {/* Middle Emerald Ring (Spins in reverse) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border-[3px] border-white/5 border-b-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
          />

          {/* Inner Pulsing Brand Image */}
          <motion.div
            animate={{
              scale: [0.95, 1.05, 0.95],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center p-2 border border-white/10 backdrop-blur-sm"
          >
            <Image
              src="/logo.png"
              alt="Loading"
              fill
              className="object-contain p-2 drop-shadow-md"
            />
          </motion.div>

        </div>

        {/* Elegant Typography */}
        <div className="flex flex-col items-center gap-2">
          <motion.h3
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-lg font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 uppercase"
          >
            Processing
          </motion.h3>
          <p className="text-xs text-slate-400 tracking-wider font-medium uppercase">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  )
}