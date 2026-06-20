'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    // Fixed overlay ensures it covers the whole screen perfectly
    <div className="fixed inset-0 z-[999] flex items-center justify-center min-h-screen bg-[#020617]/90 backdrop-blur-xl overflow-hidden">

      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="relative flex flex-col items-center gap-8 p-12 rounded-3xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

        {/* Orbital Loader */}
        <div className="relative w-24 h-24 flex items-center justify-center">

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

          {/* Inner Pulsing Core */}
          <motion.div
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.8)]"
          />
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