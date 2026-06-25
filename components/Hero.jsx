'use client'

import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const Hero = () => {
  const router = useRouter()

  return (
    <section className="relative min-h-[80vh] w-full bg-[#050914] text-white overflow-hidden flex items-center pt-20">
      {/* Animated Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-8 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.2em] font-bold text-cyan-400">
              WELCOME TO NANDURBAR BAZAR
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter">
              Quality Gadgets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                For Your Lifestyle.
              </span>
            </h1>

            <p className="text-lg text-white/60 max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
              Discover a curated selection of premium electronics and accessories designed for performance, precision, and modern living.
            </p>

            <button
              onClick={() => router.push('/product')}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cyan-400 text-black font-bold transition-all hover:scale-105 hover:bg-emerald-400"
            >
              Shop Now
              <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </motion.div>

          {/* Logo Animation Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 relative w-full max-w-md flex justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 animate-float">
              <Image
                src="/app.png"
                alt="Nandurbar Bazar Logo"
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default Hero