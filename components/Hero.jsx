'use client'

import { assets } from '@/assets/assets'
import { ArrowRight, Cpu, Zap, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState, useCallback } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const heroSlides = [
  {
    id: 1,
    tag: 'Next-Gen Audio',
    title: 'SONIC',
    suffix: 'X1',
    subtitle: 'The first headset designed with neural-link processing for zero latency.',
    specs: { processor: 'H2 Chip', battery: '48h', latency: '0.1ms' },
    image: assets.product_img4,
    accent: '#22d3ee', // Cyan
  },
  {
    id: 2,
    tag: 'Optics Reimagined',
    title: 'VISION',
    suffix: 'PRO',
    subtitle: 'Ultra-lightweight smart eyewear with integrated AR navigation.',
    specs: { processor: 'M1 Lite', battery: '12h', latency: '0.5ms' },
    image: assets.hero_product_img1,
    accent: '#a78bfa', // Violet
  },
  {
    id: 3,
    tag: 'Daily Essential',
    title: 'CORE',
    suffix: 'ONE',
    subtitle: 'A smartphone that adapts to your environment automatically.',
    specs: { processor: 'Snapdragon 8+', battery: '24h', latency: 'N/A' },
    image: assets.hero_product_img2,
    accent: '#fb923c', // Orange
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
    const timer = setInterval(nextSlide, 7000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slide = heroSlides[index]

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#020617] text-white flex flex-col">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
        <motion.div 
           key={index}
           initial={{ opacity: 0 }} animate={{ opacity: 1 }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[160px] rounded-full"
           style={{ background: `${slide.accent}15` }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center max-w-[1800px] mx-auto w-full px-8 gap-12 lg:pt-0 pt-24">
        
        {/* LEFT NAV DOCK (Desktop) */}
        <div className="hidden lg:flex flex-col gap-6 mr-12">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className="group relative flex items-center">
              <div className={`h-12 w-1 rounded-full transition-all duration-500 ${i === index ? 'bg-white scale-y-100' : 'bg-white/10 scale-y-50 group-hover:bg-white/30'}`} />
              <span className={`absolute left-4 text-[10px] font-black tracking-widest transition-opacity duration-300 ${i === index ? 'opacity-100' : 'opacity-0'}`}>0{i + 1}</span>
            </button>
          ))}
        </div>

        {/* CONTENT BOX */}
        <div className="flex-1 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">
                  {slide.tag}
                </span>
              </div>

              <h1 className="text-7xl md:text-[10rem] font-black tracking-[calc(-0.05em)] leading-none flex items-baseline gap-4">
                {slide.title}
                <span className="text-2xl md:text-4xl font-light font-mono opacity-30">{slide.suffix}</span>
              </h1>
              
              <p className="text-base md:text-lg text-white/40 max-w-sm mt-8 leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="flex items-center gap-6 mt-12">
                <button
                  onClick={() => router.push('/shop')}
                  className="bg-white text-black h-16 px-10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-cyan-400 transition-colors flex items-center gap-4 group"
                >
                  Acquire Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="h-16 w-[1px] bg-white/10" />
                <div className="font-mono">
                   <p className="text-[10px] uppercase text-white/30">MSRP</p>
                   <p className="text-2xl font-light">{currency}{slide.price}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* IMAGE SECTION */}
        <div className="relative flex-1 flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotateY: -30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative perspective-1000"
            >
              <Image
                src={slide.image}
                alt="Product"
                priority
                className="w-full h-auto max-w-[600px] object-contain filter drop-shadow-[0_0_80px_rgba(255,255,255,0.1)]"
              />

              {/* DYNAMIC TECH SPECS */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -right-4 top-1/3 space-y-4 hidden xl:block"
              >
                 <SpecItem icon={<Cpu size={14}/>} label="CORE" val={slide.specs.processor} />
                 <SpecItem icon={<Zap size={14}/>} label="POWER" val={slide.specs.battery} />
                 <SpecItem icon={<ShieldCheck size={14}/>} label="LATENCY" val={slide.specs.latency} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER AREA */}
      <div className="relative z-10 w-full">
        <div className="max-w-[1800px] mx-auto px-8 pb-8 flex justify-between items-end">
           <div className="hidden md:block">
              <p className="text-[10px] font-bold text-white/20 tracking-[0.5em] uppercase rotate-90 origin-left translate-y-[-50px]">Design_01</p>
           </div>
           <div className="flex-1 max-w-4xl border-t border-white/5 pt-8">
              <CategoriesMarquee />
           </div>
        </div>
      </div>

    </section>
  )
}

const SpecItem = ({ icon, label, val }) => (
  <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 w-32">
     <div className="text-cyan-400 mb-2">{icon}</div>
     <p className="text-[8px] font-bold opacity-30 uppercase tracking-tighter">{label}</p>
     <p className="text-xs font-mono">{val}</p>
  </div>
)

export default Hero