'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const heroSlides = [
  {
    id: 1,
    tag: 'NEW DROP',
    title: 'Gadgets you’ll love',
    subtitle: 'Built for the future',
    price: 699,
    image: assets.hero_model_img,
    accent: 'from-emerald-400 to-cyan-400',
  },
  {
    id: 2,
    tag: 'HOT DEAL',
    title: 'Smart technology',
    subtitle: 'Smarter prices',
    price: 999,
    image: assets.hero_product_img1,
    accent: 'from-blue-400 to-violet-400',
  },
  {
    id: 3,
    tag: 'LIMITED',
    title: 'Upgrade your lifestyle',
    subtitle: 'Feel the innovation',
    price: 1299,
    image: assets.hero_product_img2,
    accent: 'from-orange-400 to-pink-400',
  },
]

const slideVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
}

const Hero = () => {
  const router = useRouter()
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % heroSlides.length),
      4500
    )
    return () => clearInterval(timer)
  }, [])

  const slide = heroSlides[index]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* SLIDER ONLY */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-16 min-h-[420px]"
          >
            {/* Tag */}
            <span
              className={`inline-block px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${slide.accent} text-black`}
            >
              {slide.tag}
            </span>

            <h1 className="text-4xl sm:text-6xl font-semibold mt-6 leading-tight max-w-xl">
              {slide.title}
              <br />
              <span className="text-white/60">{slide.subtitle}</span>
            </h1>

            <p className="mt-6 text-lg text-white/70">Starting from</p>
            <p className="text-4xl font-bold">
              {currency}{slide.price}
            </p>

            <button
              onClick={() => router.push('/shop')}
              className="mt-8 inline-flex items-center gap-3 px-8 py-4 rounded-xl 
              bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold
              hover:scale-105 active:scale-95 transition"
            >
              Shop Now
              <ArrowRightIcon size={20} />
            </button>

            {/* Product Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12 sm:absolute sm:right-10 sm:bottom-0"
            >
              <Image
                src={slide.image}
                alt="Product"
                className="max-w-xs sm:max-w-sm drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {heroSlides.map((_, i) => (
            <span
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-10 rounded-full cursor-pointer transition ${
                i === index ? 'bg-cyan-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* KEEP MARQUEE */}
      <CategoriesMarquee />
    </section>
  )
}

export default Hero
