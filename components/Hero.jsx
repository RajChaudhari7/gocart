'use client'

import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const Hero = () => {
  const router = useRouter()

  return (
    <section className="relative min-h-[85vh] w-full bg-[#050914] text-white overflow-hidden flex items-center pt-24 pb-12">
      {/* Animated Background Glow - Adjusted for Mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-6 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-[0.2em] font-bold text-cyan-400">
              WELCOME TO NANDURBAR BAZAR
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter">
              Quality Gadgets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                For Your Lifestyle.
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/60 max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
              Discover a curated selection of premium electronics and accessories designed for performance, precision, and modern living.
            </p>

            <button
              onClick={() => router.push('/product')}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cyan-400 text-black font-bold transition-all hover:scale-105 active:scale-95 hover:bg-emerald-400 w-full md:w-auto"
            >
              Shop Now
              <ArrowRightIcon size={16} />
            </button>
          </motion.div>

          {/* Logo Section - Optimized for Mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full flex justify-center order-first md:order-last mb-6 md:mb-0"
          >
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80">
              <Image
                src="/app.png"
                alt="Nandurbar Bazar Logo"
                fill
                className="object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]"
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