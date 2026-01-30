'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState, useCallback } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

const heroSlides = [
  {
    id: 1,
    tag: 'NEW ARRIVAL',
    title: 'Precision.',
    subtitle: 'Gadgets built for the next generation.',
    price: 699,
    image: assets.product_img4,
    accent: '#10b981',
    glow: 'bg-emerald-500/30',
    bgGradient: 'from-emerald-500/10 via-transparent to-transparent'
  },
  {
    id: 2,
    tag: 'LIMITED EDITION',
    title: 'Evolution.',
    subtitle: 'Smart tech that thinks ahead of you.',
    price: 999,
    image: assets.hero_product_img1,
    accent: '#8b5cf6',
    glow: 'bg-violet-500/30',
    bgGradient: 'from-violet-500/10 via-transparent to-transparent'
  },
  {
    id: 3,
    tag: 'PREMIUM TECH',
    title: 'Innovation.',
    subtitle: 'Upgrade your daily digital experience.',
    price: 1299,
    image: assets.hero_product_img2,
    accent: '#f97316',
    glow: 'bg-orange-500/30',
    bgGradient: 'from-orange-500/10 via-transparent to-transparent'
  },
]

const Hero = () => {
  const router = useRouter()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const [index, setIndex] = useState(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [12, -12])
  const rotateY = useTransform(x, [-100, 100], [-12, 12])

  const nextSlide = useCallback(() => {
    setIndex((prev) => (prev + 1) % heroSlides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slide = heroSlides[index]

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#020617] text-white perspective-[1200px]">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient} transition-colors duration-1000`} />
        <div className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] ${slide.glow} blur-[140px] rounded-full`} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 min-h-screen items-center pt-20">
        
        {/* LEFT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-10 bg-white/40" />
              <span style={{ color: slide.accent }} className="text-sm font-bold tracking-[0.3em] uppercase">
                {slide.tag}
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              <span className="block">{slide.title}</span>
              <span className="block text-white/20 text-5xl md:text-7xl">
                Experience
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-md">
              {slide.subtitle}
            </p>

            <div className="flex items-center gap-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40 mb-1">
                  Starting at
                </p>
                <p className="text-4xl font-light italic">
                  {currency}{slide.price}
                </p>
              </div>

              <button
                onClick={() => router.push('/shop')}
                className="relative group px-10 py-5 rounded-full font-bold bg-white text-black overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Explore Now
                  <ArrowRightIcon size={20} />
                </span>
                <div className="absolute inset-0 bg-black/5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* RIGHT — TRUE 3D TILT PRODUCT */}
        <div
          className="relative flex items-center justify-center"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            x.set(e.clientX - rect.left - rect.width / 2)
            y.set(e.clientY - rect.top - rect.height / 2)
          }}
          onMouseLeave={() => {
            x.set(0)
            y.set(0)
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              style={{ rotateX, rotateY }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="relative"
            >
              {/* Glow Ring */}
              <div className={`absolute inset-0 ${slide.glow} blur-3xl rounded-full scale-110`} />

              {/* Floating Card */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="relative bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Image
                  src={slide.image}
                  alt="Product"
                  priority
                  className="w-full h-auto max-w-[460px] object-contain drop-shadow-[0_40px_40px_rgba(0,0,0,0.6)]"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Floating Shipping Badge */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -right-6 top-1/4 hidden lg:block p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShoppingBag size={20} />
              </div>
              <div className="text-xs">
                <p className="font-bold">Fast Shipping</p>
                <p className="opacity-60">Doorstep delivery</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Marquee */}
      <div className="relative z-10 pb-10">
        <CategoriesMarquee />
      </div>
    </section>
  )
}

export default Hero
