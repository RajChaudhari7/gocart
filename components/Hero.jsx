'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  {
    id: 1,
    tag: 'NEW ARRIVAL',
    title: 'Future.',
    subtitle: 'Redefined.',
    desc: 'Experience next-gen gadgets built for absolute precision and seamless integration.',
    price: 699,
    image: assets.product_img4,
    color: 'from-emerald-900 via-[#050914] to-[#050914]',
    accent: 'text-emerald-400',
    bgAccent: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/20'
  },
  {
    id: 2,
    tag: 'PREMIUM TECH',
    title: 'Minimal.',
    subtitle: 'Powerful.',
    desc: 'Luxury performance meets clean, uncompromising architectural design.',
    price: 999,
    image: assets.hero_product_img1,
    color: 'from-blue-900 via-[#050914] to-[#050914]',
    accent: 'text-blue-400',
    bgAccent: 'bg-blue-500',
    shadow: 'shadow-blue-500/20'
  },
  {
    id: 3,
    tag: 'SMART ERA',
    title: 'Smart.',
    subtitle: 'Evolution.',
    desc: 'Cognitive technology that anticipates and adapts to your daily lifestyle.',
    price: 1299,
    image: assets.hero_product_img2,
    color: 'from-orange-900 via-[#050914] to-[#050914]',
    accent: 'text-orange-400',
    bgAccent: 'bg-orange-500',
    shadow: 'shadow-orange-500/20'
  },
]

const Hero = () => {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-slideshow every 4 seconds
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPaused])

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const slide = slides[index]

  return (
    <section 
      className="relative min-h-[90vh] md:min-h-screen w-full bg-[#050914] text-white overflow-hidden flex items-center justify-center pt-20 pb-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. DYNAMIC BACKGROUND (Blurred Photo & Gradient) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.color} z-0`}
        >
          {/* Extremely blurred version of the product image acting as a light source */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] opacity-40 mix-blend-screen blur-[120px]">
            <Image 
              src={slide.image} 
              alt="blur" 
              fill 
              className="object-contain"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 2. TEXTURE OVERLAY (Frosted Glass / Water Drop vibe) */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] mix-blend-overlay pointer-events-none" />

      {/* 3. MAIN GLASS CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`relative flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 p-8 md:p-14 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl ${slide.shadow}`}
          >
            
            {/* CONTENT (Upward Glass Text) */}
            <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left order-2 md:order-1">
              
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.2em] font-bold text-white/80 backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full ${slide.bgAccent} animate-pulse`} />
                {slide.tag}
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter drop-shadow-lg">
                <span className="block text-white">
                  {slide.title}
                </span>
                <span className={`block ${slide.accent} bg-clip-text`}>
                  {slide.subtitle}
                </span>
              </h1>

              {/* Description */}
              <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-md mx-auto md:mx-0 leading-relaxed font-light">
                {slide.desc}
              </p>

              {/* Pricing & CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center md:justify-start">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Starting at</span>
                  <span className="text-4xl font-light text-white">
                    ₹{slide.price}
                  </span>
                </div>

                <button
                  onClick={() => router.push('/product')}
                  className={`group relative overflow-hidden px-8 py-4 rounded-full ${slide.bgAccent} transition-all duration-300 hover:scale-105 text-white font-semibold flex items-center gap-3 shadow-lg ${slide.shadow}`}
                >
                  <span className="relative z-10 tracking-wide">Shop Now</span>
                  <ArrowRightIcon className="relative z-10 group-hover:translate-x-1 transition-transform" size={18} />
                </button>
              </div>
            </div>

            {/* PRODUCT IMAGE */}
            <div className="flex-1 w-full max-w-md mx-auto relative order-1 md:order-2 flex justify-center items-center h-[300px] md:h-[450px]">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority
                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              />
            </div>

          </motion.div>
        </AnimatePresence>

        {/* 4. SLIDER CONTROLS */}
        <div className="flex items-center justify-between mt-8 px-4 md:px-8">
          
          {/* Pagination Dots */}
          <div className="flex gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index 
                    ? `w-8 ${slide.bgAccent}` 
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrow Buttons */}
          <div className="flex gap-3">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-colors text-white/70 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-colors text-white/70 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero