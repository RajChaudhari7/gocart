'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const Hero = () => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const router = useRouter()
  const [index, setIndex] = useState(0)

  const handleLearnMore = () => router.push('/shop')

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const slide = heroSlides[index]

  return (
    <div className="mx-6">
      <div className="flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10">

        {/* LEFT SLIDER */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6 }}
            className={`relative flex-1 flex flex-col rounded-3xl xl:min-h-100 group ${slide.bg}`}
          >
            <div className="p-5 sm:p-16">
              <div className="inline-flex items-center gap-3 bg-white/60 text-slate-700 pr-4 p-1 rounded-full text-xs sm:text-sm">
                <span className="bg-slate-800 px-3 py-1 rounded-full text-white text-xs">
                  {slide.badge}
                </span>
                {slide.badgeText}
                <ChevronRightIcon size={16} />
              </div>

              <h2 className="text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent max-w-xs sm:max-w-md">
                {slide.title}
                <br />
                {slide.subtitle}
              </h2>

              <div className="text-slate-800 text-sm font-medium mt-4 sm:mt-8">
                <p>Starts from</p>
                <p className="text-3xl">
                  {currency}{slide.price}
                </p>
              </div>

              <button
                onClick={handleLearnMore}
                className="bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-105 active:scale-95 transition"
              >
                LEARN MORE
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                className="sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm"
                src={slide.image}
                alt="Hero"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* RIGHT STATIC SECTION */}
        <div className="flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600">
          <div className="flex-1 flex items-center justify-between bg-orange-200 rounded-3xl p-6 px-8 group">
            <div>
              <p className="text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40">
                Best products
              </p>
              <p onClick={handleLearnMore} className="flex items-center gap-1 mt-4 cursor-pointer">
                View more <ArrowRightIcon size={18} />
              </p>
            </div>
            <Image className="w-35" src={assets.hero_product_img1} alt="" />
          </div>

          <div className="flex-1 flex items-center justify-between bg-blue-200 rounded-3xl p-6 px-8 group">
            <div>
              <p className="text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40">
                20% discounts
              </p>
              <p onClick={handleLearnMore} className="flex items-center gap-1 mt-4 cursor-pointer">
                View more <ArrowRightIcon size={18} />
              </p>
            </div>
            <Image className="w-35" src={assets.hero_product_img2} alt="" />
          </div>
        </div>
      </div>

      <CategoriesMarquee />
    </div>
  )
}

export default Hero

