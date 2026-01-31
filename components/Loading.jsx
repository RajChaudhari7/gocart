'use client'

import { motion } from 'framer-motion'
import { Cube, Circle, Triangle } from 'lucide-react'

const shapes = [
  { icon: Cube, color: "#10b981" },
  { icon: Circle, color: "#3b82f6" },
  { icon: Triangle, color: "#facc15" },
]

const Loading = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Animated background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Glass Card */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-10 py-10 rounded-2xl 
                      bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        {/* Bouncing Shapes Container */}
        <div className="flex items-end gap-6 h-24">
          {shapes.map((shape, idx) => {
            const Icon = shape.icon
            return (
              <motion.div
                key={idx}
                animate={{
                  y: ["0%", "-40%", "0%"],
                  rotate: [0, 360, 720],
                  scale: [1, 1.3, 1],
                  backgroundColor: [shape.color, "#22c55e", shape.color],
                  borderRadius: ["20%", "50%", "20%"]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: idx * 0.3,
                  ease: "easeInOut"
                }}
                className="w-14 h-14 flex items-center justify-center shadow-xl"
              >
                <Icon size={32} className="text-white" />
              </motion.div>
            )
          })}
        </div>

        {/* Text */}
        <p className="text-sm font-medium tracking-wide text-gray-200 animate-pulse">
          Preparing…
        </p>
      </div>
    </div>
  )
}

export default Loading
