'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

const slides = [
  {
    tag: 'NEW ARRIVAL',
    title: 'Future.',
    subtitle: 'Redefined.',
    desc: 'Experience next-gen gadgets built for precision.',
    price: 699,
    image: assets.product_img4,
  },
  {
    tag: 'PREMIUM TECH',
    title: 'Minimal.',
    subtitle: 'Powerful.',
    desc: 'Luxury performance meets clean design.',
    price: 999,
    image: assets.hero_product_img1,
  },
  {
    tag: 'SMART ERA',
    title: 'Smart.',
    subtitle: 'Evolution.',
    desc: 'Technology that adapts to your lifestyle.',
    price: 1299,
    image: assets.hero_product_img2,
  },
]

const Hero = () => {
  const router = useRouter()
  const textRef = useRef(null)
  const imageRef = useRef(null)
  const [index, setIndex] = useState(0)

  const slide = slides[index]

  // Entry animation on slide change
  useEffect(() => {
    const tl = gsap.timeline()

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8 }
    ).fromTo(
      imageRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1 },
      "-=0.6"
    )
  }, [index])

  // Auto slide change
  useEffect(() => {
    const interval = setInterval(() => {
      gsap.to([textRef.current, imageRef.current], {
        opacity: 0,
        y: -30,
        duration: 0.5,
        onComplete: () => {
          setIndex((prev) => (prev + 1) % slides.length)
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Floating animation (always running)
  useEffect(() => {
    gsap.to(imageRef.current, {
      y: -20,
      repeat: -1,
      yoyo: true,
      duration: 4,
      ease: 'sine.inOut',
    })
  }, [])

  return (
    <section className="relative min-h-screen bg-[#0B1220] text-white overflow-hidden flex items-center">

      {/* Soft Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div ref={textRef} className="space-y-8">

          <div className="text-emerald-400 text-sm tracking-[0.3em] font-bold">
            {slide.tag}
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            <span className="block">{slide.title}</span>
            <span className="block text-white/30">{slide.subtitle}</span>
          </h1>

          <p className="text-lg text-white/60 max-w-md">
            {slide.desc}
          </p>

          <div className="flex items-center gap-10">
            <div>
              <p className="text-sm text-white/40">Starting at</p>
              <p className="text-4xl font-light text-emerald-400">
                ₹{slide.price}
              </p>
            </div>

            <button
              onClick={() => router.push('/shop')}
              className="relative z-20 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 transition text-white font-semibold flex items-center gap-2 shadow-lg"
            >
              Explore
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex justify-center items-center">
          <div className="absolute w-[400px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full" />

          <div
            ref={imageRef}
            className="relative bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
          >
            <Image
              key={index}
              src={slide.image}
              alt="Product"
              priority
              className="w-full max-w-[400px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero