'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const slides = [
  {
    title: 'Future.',
    subtitle: 'Redefined.',
    desc: 'Next-gen gadgets engineered for precision.',
    price: 699,
    image: assets.product_img4,
    accent: '#10B981',
  },
  {
    title: 'Minimal.',
    subtitle: 'Powerful.',
    desc: 'Luxury performance meets clean design.',
    price: 999,
    image: assets.hero_product_img1,
    accent: '#06B6D4',
  },
]

const Hero = () => {
  const router = useRouter()
  const heroRef = useRef(null)
  const imageRef = useRef(null)
  const textRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add("(min-width: 768px)", () => {

      // Apple-style smooth reveal
      const tl = gsap.timeline()

      tl.from('.hero-line', {
        y: 100,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power4.out'
      })
      .from('.hero-desc', {
        opacity: 0,
        y: 40,
        duration: 0.8
      }, "-=0.5")
      .from(imageRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: 'power3.out'
      }, "-=1")

      // Scroll-triggered hero exit
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        opacity: 0,
        y: -150,
        scale: 0.95
      })

      // Floating image
      gsap.to(imageRef.current, {
        y: -20,
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: 'sine.inOut'
      })

    })

    // Auto slide change
    let current = 0
    const slideTimeline = gsap.timeline({ repeat: -1 })

    slideTimeline.to({}, { duration: 5 })
      .call(() => {
        current = (current + 1) % slides.length
      })

  }, [])

  // Magnetic Button
  const handleMagnet = (e) => {
    const bounds = btnRef.current.getBoundingClientRect()
    const x = e.clientX - bounds.left - bounds.width / 2
    const y = e.clientY - bounds.top - bounds.height / 2

    gsap.to(btnRef.current, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
    })
  }

  const resetMagnet = () => {
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.3,
    })
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-[#0A0F1C] text-white overflow-hidden flex items-center"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 p-[1px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-orange-500 animate-spin-slow opacity-20 blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div ref={textRef} className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black leading-tight overflow-hidden">
            <span className="hero-line block">Future.</span>
            <span className="hero-line block text-white/30">Redefined.</span>
          </h1>

          <p className="hero-desc text-lg text-white/60 max-w-md">
            Experience innovation without distraction.
          </p>

          <button
            ref={btnRef}
            onMouseMove={handleMagnet}
            onMouseLeave={resetMagnet}
            onClick={() => router.push('/shop')}
            className="relative px-10 py-5 rounded-full bg-white text-black font-semibold transition"
          >
            <span className="flex items-center gap-2">
              Explore <ArrowRightIcon size={18} />
            </span>
          </button>
        </div>

        {/* RIGHT */}
        <div className="relative flex justify-center">
          <div
            ref={imageRef}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl"
          >
            <Image
              src={assets.product_img4}
              alt="Product"
              priority
              className="max-w-[420px] object-contain"
            />
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero