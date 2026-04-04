'use client'

import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

// ─── Slide data ────────────────────────────────────────────────────────────────
const slides = [
  {
    id: 1,
    tag: 'NEW ARRIVAL',
    line1: 'Future.',
    line2: 'Redefined.',
    desc: 'Experience next-gen gadgets built for absolute precision and seamless integration into your world.',
    price: '₹699',
    accent: '#00d4a1',
    accentRGB: '0,212,161',
    gen: '4th Gen',
    productLabel: 'NEXUS X1',
    icon: '⬡',
    screenBg: 'linear-gradient(135deg,#001a15,#003328)',
    glow: 'radial-gradient(circle, rgba(0,212,161,.55) 0%, transparent 70%)',
  },
  {
    id: 2,
    tag: 'PREMIUM TECH',
    line1: 'Minimal.',
    line2: 'Powerful.',
    desc: 'Luxury performance meets clean uncompromising architectural design. Zero compromise on perfection.',
    price: '₹999',
    accent: '#4f8eff',
    accentRGB: '79,142,255',
    gen: '5th Gen',
    productLabel: 'NEXUS ULTRA',
    icon: '◈',
    screenBg: 'linear-gradient(135deg,#000d28,#001852)',
    glow: 'radial-gradient(circle, rgba(79,142,255,.55) 0%, transparent 70%)',
  },
  {
    id: 3,
    tag: 'SMART ERA',
    line1: 'Smart.',
    line2: 'Evolution.',
    desc: 'Cognitive technology that anticipates and adapts seamlessly to your daily rhythm and lifestyle.',
    price: '₹1299',
    accent: '#ffb347',
    accentRGB: '255,179,71',
    gen: '6th Gen',
    productLabel: 'NEXUS PRO',
    icon: '◉',
    screenBg: 'linear-gradient(135deg,#1a1000,#2d1d00)',
    glow: 'radial-gradient(circle, rgba(255,179,71,.55) 0%, transparent 70%)',
  },
]

const SLIDE_DURATION = 6 // seconds

// ─── Particle Canvas Background ────────────────────────────────────────────────
function ParticleBg({ accentRGB }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(null)
  const rgbRef = useRef(accentRGB)

  useEffect(() => {
    rgbRef.current = accentRGB
  }, [accentRGB])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * 1400,
      y: Math.random() * 900,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.6 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const [r, g, b] = rgbRef.current.split(',').map(Number)
      const grd = ctx.createRadialGradient(W * 0.65, H * 0.4, 0, W * 0.65, H * 0.4, W * 0.55)
      grd.addColorStop(0, `rgba(${r},${g},${b},.12)`)
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, H)

      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${p.a * 0.4})`
        ctx.fill()
      })

      frameRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
    />
  )
}

// ─── Product Card visual ────────────────────────────────────────────────────────
function ProductCard({ slide, cardRef, onMouseMove, onMouseLeave }) {
  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative w-full"
      style={{
        maxWidth: 440,
        aspectRatio: '1',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute rounded-full transition-all duration-1000 pointer-events-none"
        style={{
          width: '70%', height: '70%',
          top: '15%', left: '15%',
          background: slide.glow,
          filter: 'blur(60px)',
          opacity: 0.45,
        }}
      />

      {/* Glass card */}
      <div
        className="absolute inset-0 rounded-[2rem]"
        style={{
          border: '1px solid rgba(255,255,255,.07)',
          background: 'linear-gradient(135deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.01) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.1), 0 40px 80px rgba(0,0,0,.5)',
        }}
      >
        <div
          className="absolute inset-[1px] rounded-[calc(2rem_-_1px)] pointer-events-none"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.06) 0%,transparent 60%)' }}
        />
      </div>

      {/* Product visual */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div
          className="w-3/4 h-3/4 rounded-[2rem] relative overflow-hidden flex items-center justify-center flex-col gap-2"
          style={{
            background: slide.screenBg,
            border: '2px solid rgba(255,255,255,.15)',
            boxShadow: '0 0 0 1px rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.15)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.08) 0%,transparent 50%)' }}
          />
          <span className="text-5xl leading-none z-10" style={{ color: slide.accent }}>
            {slide.icon}
          </span>
          <span
            className="text-[.65rem] tracking-[.18em] uppercase z-10"
            style={{ color: 'rgba(255,255,255,.45)', fontFamily: 'DM Sans, sans-serif' }}
          >
            {slide.productLabel}
          </span>
        </div>
      </div>

      {/* Corner badge */}
      <div
        className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl px-4 py-3"
        style={{
          background: 'rgba(0,0,0,.3)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div>
          <div className="text-[.68rem] tracking-wider" style={{ color: 'rgba(200,210,240,.45)' }}>
            Generation
          </div>
          <div className="text-base font-medium" style={{ color: '#f0f4ff' }}>
            {slide.gen}
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: slide.accent }}
        >
          <ArrowRight size={14} color="#000" />
        </div>
      </div>

      {/* Rings */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ inset: '-5%', border: '1px solid rgba(255,255,255,.04)' }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ inset: '-12.5%', border: '1px solid rgba(255,255,255,.025)' }}
      />
    </div>
  )
}

// ─── Main Hero Component ────────────────────────────────────────────────────────
const Hero = () => {
  const router = useRouter()
  const [idx, setIdx] = useState(0)
  const isAnimating = useRef(false)

  const containerRef = useRef(null)
  const cardRef = useRef(null)
  const progressRef = useRef(null)
  const progressAnimRef = useRef(null)

  // Refs for animated elements
  const tagRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const descRef = useRef(null)
  const priceRowRef = useRef(null)

  const slide = slides[idx]

  // ── Progress bar ──────────────────────────────────────────────────────────────
  const startProgress = useCallback((currentIdx) => {
    if (progressAnimRef.current) progressAnimRef.current.kill()
    if (!progressRef.current) return
    gsap.set(progressRef.current, { scaleX: 0 })
    progressAnimRef.current = gsap.to(progressRef.current, {
      scaleX: 1,
      duration: SLIDE_DURATION,
      ease: 'none',
      onComplete: () => {
        goSlide((currentIdx + 1) % slides.length)
      },
    })
  }, [])

  // ── Slide transition ──────────────────────────────────────────────────────────
  const goSlide = useCallback((newIdx) => {
    if (isAnimating.current) return
    isAnimating.current = true
    if (progressAnimRef.current) progressAnimRef.current.kill()

    const leftEls = [tagRef.current, line1Ref.current, line2Ref.current, descRef.current, priceRowRef.current].filter(Boolean)

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false
        startProgress(newIdx)
      },
    })

    tl.to(leftEls, { y: -24, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power2.in' })
      .to(cardRef.current, { scale: 0.88, opacity: 0, rotation: -4, duration: 0.35, ease: 'power2.in' }, '<0.05')
      .call(() => setIdx(newIdx))
      .fromTo(leftEls, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' })
      .fromTo(
        cardRef.current,
        { scale: 0.88, opacity: 0, rotation: 4 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.75, ease: 'elastic.out(1, 0.6)' },
        '<0.1'
      )
  }, [startProgress])

  // ── Mount animation ───────────────────────────────────────────────────────────
  useEffect(() => {
    const leftEls = [tagRef.current, line1Ref.current, line2Ref.current, descRef.current, priceRowRef.current].filter(Boolean)

    gsap.from('#hero-nav', { y: -30, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.1 })
    gsap.from(leftEls, { y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.25 })
    gsap.from(cardRef.current, { scale: 0.8, opacity: 0, rotation: 8, duration: 1.1, ease: 'elastic.out(1, 0.5)', delay: 0.3 })
    gsap.from('#hero-bottom', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.55 })

    // Floating card
    gsap.to(cardRef.current, { y: -14, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.2 })

    startProgress(0)
    return () => { if (progressAnimRef.current) progressAnimRef.current.kill() }
  }, []) // eslint-disable-line

  // ── 3D tilt ───────────────────────────────────────────────────────────────────
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) / 18
    const y = -(e.clientY - top - height / 2) / 18
    gsap.to(cardRef.current, { rotationY: x, rotationX: y, transformPerspective: 1200, ease: 'power2.out', duration: 0.5 })
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, ease: 'elastic.out(1, 0.3)', duration: 1.2 })
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: '#03060f', color: '#f0f4ff', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Particle canvas */}
      <ParticleBg accentRGB={slide.accentRGB} />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* ── Nav ── */}
      <nav
        id="hero-nav"
        className="relative z-50 flex items-center justify-between px-8 md:px-12 py-6"
      >
        <div
          className="text-2xl tracking-widest font-black"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '.12em' }}
        >
          NEXUS
        </div>
        <div className="hidden md:flex gap-8">
          {['Products', 'Experience', 'Ecosystem'].map((l) => (
            <a
              key={l}
              href="#"
              className="text-xs tracking-[.12em] transition-colors duration-300"
              style={{ color: 'rgba(200,210,240,.45)' }}
              onMouseEnter={(e) => (e.target.style.color = '#f0f4ff')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(200,210,240,.45)')}
            >
              {l}
            </a>
          ))}
        </div>
        <button
          className="text-xs tracking-[.1em] px-5 py-2 rounded-full transition-all duration-300"
          style={{
            border: '1px solid rgba(255,255,255,.08)',
            background: 'rgba(255,255,255,.04)',
            color: '#f0f4ff',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,.08)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,.04)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'
          }}
        >
          Get Early Access
        </button>
      </nav>

      {/* ── Main grid ── */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 items-center px-8 md:px-12 pb-8 gap-8 lg:gap-0">
        {/* Left */}
        <div className="flex flex-col gap-7 max-w-[540px] order-2 lg:order-1 mt-4 lg:mt-0">
          {/* Tag */}
          <div
            ref={tagRef}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit"
            style={{
              border: `1px solid rgba(${slide.accentRGB},.25)`,
              background: 'rgba(255,255,255,.04)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color .6s',
            }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full animate-pulse"
              style={{ background: slide.accent, transition: 'background .6s' }}
            />
            <span
              className="text-[.68rem] tracking-[.18em] font-semibold"
              style={{ color: slide.accent, transition: 'color .6s' }}
            >
              {slide.tag}
            </span>
          </div>

          {/* Title */}
          <div style={{ overflow: 'hidden' }}>
            <span
              ref={line1Ref}
              className="block font-black leading-[.92] text-[clamp(4.5rem,9vw,9rem)]"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#f0f4ff' }}
            >
              {slide.line1}
            </span>
            <span
              ref={line2Ref}
              className="block font-black leading-[.92] text-[clamp(4.5rem,9vw,9rem)]"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                WebkitTextStroke: '1px rgba(255,255,255,.2)',
                color: 'transparent',
              }}
            >
              {slide.line2}
            </span>
          </div>

          {/* Description */}
          <p
            ref={descRef}
            className="text-[1rem] leading-relaxed font-light max-w-[380px]"
            style={{ color: 'rgba(200,210,240,.45)' }}
          >
            {slide.desc}
          </p>

          {/* Price + CTA */}
          <div ref={priceRowRef} className="flex flex-wrap items-center gap-8 pt-2">
            <div>
              <div
                className="text-[.68rem] tracking-[.15em] uppercase mb-1"
                style={{ color: 'rgba(200,210,240,.45)' }}
              >
                Starting at
              </div>
              <div
                className="font-black leading-none text-[3.2rem]"
                style={{ fontFamily: "'Bebas Neue', sans-serif", color: slide.accent, transition: 'color .6s' }}
              >
                {slide.price}
              </div>
            </div>

            <button
              onClick={() => router.push('/shop')}
              className="group flex items-center gap-3 px-8 py-4 rounded-full font-medium text-sm tracking-widest uppercase transition-all duration-300 hover:scale-[1.04]"
              style={{
                background: slide.accent,
                color: '#000',
                transition: 'background .6s, transform .3s',
              }}
            >
              <span>Explore Device</span>
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>

        {/* Right — Card */}
        <div className="flex justify-center items-center h-[300px] md:h-[500px] lg:h-full order-1 lg:order-2 py-4">
          <ProductCard
            slide={slide}
            cardRef={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      </main>

      {/* ── Bottom bar ── */}
      <div
        id="hero-bottom"
        className="relative z-50 flex items-center justify-between px-8 md:px-12 pb-8"
      >
        {/* Dots */}
        <div className="flex gap-2 items-center">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className="h-[4px] rounded-full transition-all duration-[400ms]"
              style={{
                width: i === idx ? 28 : 14,
                background: i === idx ? slide.accent : 'rgba(255,255,255,.2)',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-5">
          {/* Slide number */}
          <span
            className="hidden md:block text-lg tracking-[.1em]"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'rgba(200,210,240,.45)' }}
          >
            0{idx + 1} / 0{slides.length}
          </span>

          {/* Progress bar */}
          <div
            className="hidden md:block w-36 h-[2px] rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,.1)' }}
          >
            <div
              ref={progressRef}
              className="h-full rounded-full origin-left"
              style={{ background: slide.accent, transform: 'scaleX(0)', transition: 'background .6s' }}
            />
          </div>

          {/* Arrow buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => goSlide((idx - 1 + slides.length) % slides.length)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.04)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goSlide((idx + 1) % slides.length)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                border: '1px solid rgba(255,255,255,.08)',
                background: 'rgba(255,255,255,.04)',
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero