'use client'

import { motion } from 'framer-motion'

const shapes = [
  { color: "#10b981", shape: "circle" },
  { color: "#3b82f6", shape: "square" },
  { color: "#facc15", shape: "rounded" },
  { color: "#f472b6", shape: "circle" },
  { color: "#8b5cf6", shape: "square" },
]

const Loading = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Glass Card */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-10 py-10 rounded-2xl 
                      bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        {/* Bouncing Shapes */}
        <div className="flex items-end gap-6 h-28">
          {shapes.map((shape, idx) => (
            <motion.div
              key={idx}
              animate={{
                y: ["0%", "-50%", "0%"],
                rotate: [0, 180, 360],
                scale: [1, 1.3, 1],
                borderRadius: shape.shape === "circle" ? ["50%", "20%", "50%"] :
                              shape.shape === "square" ? ["10%", "50%", "10%"] :
                              ["40%", "60%", "40%"],
                backgroundColor: [shape.color, "#22c55e", shape.color]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "mirror",
                delay: idx * 0.3,
                ease: "easeInOut"
              }}
              className="w-14 h-14 flex items-center justify-center shadow-lg"
            />
          ))}
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
