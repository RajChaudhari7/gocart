'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState, useCallback } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const heroSlides = [
  {
    id: 1,
    tag: 'NEW ARRIVAL',
    title: 'Precision.',
    subtitle: 'Gadgets built for the next generation.',
    price: 699,
    image: assets.hero_model_img,
    accent: '#10b981', // Emerald
    bgGradient: 'from-emerald-500/10 via-transparent to-transparent'
  },
  {
    id: 2,
    tag: 'LIMITED EDITION',
    title: 'Evolution.',
    subtitle: 'Smart tech that thinks ahead of you.',
    price: 999,
    image: assets.hero_product_img1,
    accent: '#8b5cf6', // Violet
    bgGradient: 'from-violet-500/10 via-transparent to-transparent'
  },
  {
    id: 3,
    tag: 'PREMIUM TECH',
    title: 'Innovation.',
    subtitle: 'Upgrade your daily digital experience.',
    price: 1299,
    image: assets.hero_product_img2,
    accent: '#f97316', // Orange
    bgGradient: 'from-orange-500/10 via-transparent to-transparent'
  },
]

const Hero = () => {
  const router = useRouter()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const [index, setIndex] = useState(0)

  const nextSlide = useCallback(() => {
    setIndex((prev) => (prev + 1) % heroSlides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slide = heroSlides[index]

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#020617] text-white flex flex-col justify-between">
      
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient} transition-colors duration-1000`} />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 pt-20">
        
        {/* Left Content */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="h-[1px] w-8 bg-gray-500" />
                <span style={{ color: slide.accent }} className="text-sm font-bold tracking-[0.2em] uppercase">
                  {slide.tag}
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
                {slide.title}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-400 max-w-md leading-relaxed mb-8">
                {slide.subtitle}
              </p>

              <div className="flex items-center gap-8 mb-10">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Starting at</p>
                  <p className="text-3xl font-light italic">{currency}{slide.price}</p>
                </div>
                
                <button
                  onClick={() => router.push('/shop')}
                  className="group relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold overflow-hidden transition-all hover:pr-12"
                >
                  <span className="relative z-10">Explore Now</span>
                  <ArrowRightIcon className="relative z-10 transition-transform group-hover:translate-x-2" size={20} />
                  <div className="absolute inset-0 bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Custom Indicators (Progress Bar Style) */}
          <div className="flex gap-4 items-center">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="group relative h-1 flex-1 max-w-[60px] bg-white/10 rounded-full overflow-hidden"
              >
                {i === index && (
                  <motion.div 
                    layoutId="progress"
                    className="absolute inset-0 bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 6, ease: "linear" }}
                    style={{ originX: 0 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Product Image */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotate: -5 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}
              className="relative z-10"
            >
              <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-75" />
              <Image
                src={slide.image}
                alt="Product"
                priority
                className="w-full h-auto max-w-[500px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Floating Badge */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute top-1/4 right-0 hidden lg:block p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
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