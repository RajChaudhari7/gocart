'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

const Hero = () => {
  const router = useRouter()
  const heroRef = useRef(null)
  const imageRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()

    tl.from('.hero-tag', {
      y: 30,
      opacity: 0,
      duration: 0.6,
    })
      .from('.hero-title span', {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
      })
      .from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.6,
      }, '-=0.5')
      .from('.hero-price', {
        y: 20,
        opacity: 0,
        duration: 0.5,
      }, '-=0.4')
      .from('.hero-btn', {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }, '-=0.4')
      .from(imageRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      }, '-=1')

    // Floating animation
    gsap.to(imageRef.current, {
      y: -20,
      repeat: -1,
      yoyo: true,
      duration: 4,
      ease: 'sine.inOut',
    })

  }, [])

  // Desktop mouse parallax
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const x = (clientX / window.innerWidth - 0.5) * 20
    const y = (clientY / window.innerHeight - 0.5) * 20

    gsap.to(imageRef.current, {
      rotationY: x,
      rotationX: -y,
      transformPerspective: 800,
      duration: 0.5,
    })
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#0B1220] text-white overflow-hidden"
    >
      {/* Soft Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 min-h-screen items-center">

        {/* LEFT CONTENT */}
        <div ref={textRef} className="space-y-8">
          <div className="hero-tag text-emerald-400 text-sm tracking-[0.3em] font-bold">
            NEW ARRIVAL
          </div>

          <h1 className="hero-title text-5xl md:text-7xl font-black leading-tight">
            <span className="block">Future.</span>
            <span className="block text-white/30">Redefined.</span>
          </h1>

          <p className="hero-subtitle text-lg text-white/60 max-w-md">
            Experience next-gen gadgets designed for performance and elegance.
          </p>

          <div className="flex items-center gap-10">
            <div className="hero-price">
              <p className="text-sm text-white/40">Starting at</p>
              <p className="text-4xl font-light text-emerald-400">
                ₹699
              </p>
            </div>

            <button
              onClick={() => router.push('/shop')}
              className="hero-btn px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 transition text-white font-semibold flex items-center gap-2"
            >
              Explore
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center items-center">
          <div className="absolute w-[400px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full" />

          <div
            ref={imageRef}
            className="relative bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
          >
            <Image
              src={assets.product_img4}
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