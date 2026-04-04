'use client'

import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRight, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

const slides = [
  {
    id: 1,
    tag: 'NEW ARRIVAL',
    title: 'Future.',
    subtitle: 'Redefined.',
    desc: 'Experience next-gen gadgets built for absolute precision and seamless integration.',
    price: 699,
    image: assets.product_img4,
    color: 'from-emerald-500/20 to-cyan-500/20',
    accent: 'text-emerald-400',
    bgAccent: 'bg-emerald-500',
  },
  {
    id: 2,
    tag: 'PREMIUM TECH',
    title: 'Minimal.',
    subtitle: 'Powerful.',
    desc: 'Luxury performance meets clean, uncompromising architectural design.',
    price: 999,
    image: assets.hero_product_img1,
    color: 'from-blue-500/20 to-purple-500/20',
    accent: 'text-blue-400',
    bgAccent: 'bg-blue-500',
  },
  {
    id: 3,
    tag: 'SMART ERA',
    title: 'Smart.',
    subtitle: 'Evolution.',
    desc: 'Cognitive technology that anticipates and adapts to your daily lifestyle.',
    price: 1299,
    image: assets.hero_product_img2,
    color: 'from-orange-500/20 to-red-500/20',
    accent: 'text-orange-400',
    bgAccent: 'bg-orange-500',
  },
]

const Hero = () => {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  
  // Using useRef instead of useState prevents React from re-rendering and killing the GSAP timeline
  const isAnimating = useRef(false) 
  
  const containerRef = useRef(null)
  const cardRef = useRef(null)
  const imageRef = useRef(null)
  const progressRef = useRef(null)
  
  const slide = slides[index]
  const SLIDE_DURATION = 6 // seconds

  const changeSlide = (newIndex) => {
    if (isAnimating.current) return
    isAnimating.current = true

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIndex(newIndex)
          isAnimating.current = false
        }
      })

      // Animate out current slide
      tl.to('.anim-elem', {
        y: -30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.in'
      }).to(imageRef.current, {
        scale: 0.8,
        opacity: 0,
        rotation: -5,
        duration: 0.4,
        ease: 'power2.in'
      }, '<')
    }, containerRef)
  }

  // Entry Animation & Progress Bar
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // Animate in new slide elements
      tl.fromTo('.anim-elem', 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      ).fromTo(imageRef.current,
        { scale: 0.8, opacity: 0, rotation: 10 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1, ease: 'elastic.out(1, 0.5)' },
        "-=0.6"
      )

      // Floating animation for image
      gsap.to(imageRef.current, {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // Progress bar animation triggers the next slide automatically
      gsap.fromTo(progressRef.current,
        { scaleX: 0 },
        { 
          scaleX: 1, 
          duration: SLIDE_DURATION, 
          ease: 'none',
          onComplete: () => changeSlide((index + 1) % slides.length)
        }
      )
    }, containerRef)

    // Cleanup ensures old animations are killed cleanly before new ones start
    return () => ctx.revert()
  }, [index]) // Only re-run this effect when the index changes

  // 3D Mouse Tilt Parallax Effect
  const handleMouseMove = (e) => {
    if (!cardRef.current || !imageRef.current) return
    
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) / 15
    const y = -(e.clientY - top - height / 2) / 15

    // Tilt the card
    gsap.to(cardRef.current, {
      rotationY: x,
      rotationX: y,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.4
    })
    
    // Parallax the image off the card for 3D depth
    gsap.to(imageRef.current, {
      x: x * 2,
      y: -y * 2,
      ease: 'power2.out',
      duration: 0.4
    })
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotationY: 0,
      rotationX: 0,
      ease: 'elastic.out(1, 0.3)',
      duration: 1
    })
    gsap.to(imageRef.current, {
      x: 0,
      y: 0,
      ease: 'elastic.out(1, 0.3)',
      duration: 1
    })
  }

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen bg-[#050914] text-white overflow-hidden flex flex-col justify-center pt-20 pb-10"
    >
      {/* Dynamic Background Glow */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${slide.color} transition-colors duration-1000 ease-in-out opacity-40`} 
      />
      
      {/* Grid Pattern overlay for tech feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center flex-1">
        
        {/* LEFT: Content */}
        <div className="space-y-8 z-20 mt-10 lg:mt-0 order-2 lg:order-1">
          <div className={`anim-elem inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.2em] font-bold ${slide.accent} backdrop-blur-md shadow-2xl`}>
            <span className={`w-2 h-2 rounded-full ${slide.bgAccent} animate-pulse`} />
            {slide.tag}
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
            <span className="anim-elem block text-white">{slide.title}</span>
            <span className="anim-elem block text-white/20 mt-2">{slide.subtitle}</span>
          </h1>

          <p className="anim-elem text-lg md:text-xl text-white/50 max-w-md leading-relaxed font-light">
            {slide.desc}
          </p>

          <div className="anim-elem flex flex-wrap items-center gap-8 pt-4">
            <div className="flex flex-col">
              <span className="text-sm text-white/40 uppercase tracking-widest font-semibold mb-1">Starting at</span>
              <span className={`text-5xl font-light ${slide.accent}`}>
                ₹{slide.price}
              </span>
            </div>

            <button
              onClick={() => router.push('/shop')}
              className={`group relative overflow-hidden px-8 py-4 rounded-full ${slide.bgAccent} transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] text-white font-semibold flex items-center gap-3`}
            >
              <span className="relative z-10 tracking-wide">Explore Device</span>
              <ArrowRightIcon className="relative z-10 group-hover:translate-x-1 transition-transform" size={18} />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </div>
        </div>

        {/* RIGHT: 3D Interactive Card */}
        <div className="relative flex justify-center items-center h-[400px] lg:h-[600px] order-1 lg:order-2 perspective-[1000px]">
          {/* Animated Glow behind card */}
          <div className={`absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] ${slide.bgAccent} blur-[120px] rounded-full opacity-30 transition-colors duration-700`} />

          {/* Glass Card Container (Tilts on mouse move) */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[350px] md:max-w-[450px] aspect-square rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl flex items-center justify-center p-8 transition-shadow duration-300 hover:shadow-2xl hover:shadow-white/5 group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Inner Ring */}
            <div className="absolute inset-4 rounded-[2rem] border border-white/5" />
            
            {/* The Image (Floats off the card via JS parallax) */}
            <Image
              ref={imageRef}
              src={slide.image}
              alt={slide.title}
              priority
              className="w-full max-w-[280px] md:max-w-[380px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(50px)' }}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM SLIDER CONTROLS */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 lg:px-12 flex items-center justify-between mt-8 lg:mt-0">
        
        {/* Slide Indicators */}
        <div className="flex gap-4">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => changeSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? `w-8 ${slide.bgAccent}` : 'w-4 bg-white/20 hover:bg-white/40'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar & Arrows */}
        <div className="flex items-center gap-6">
          <div className="hidden md:block w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              ref={progressRef}
              className={`h-full ${slide.bgAccent} origin-left`}
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => changeSlide((index - 1 + slides.length) % slides.length)}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => changeSlide((index + 1) % slides.length)}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-colors"
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