'use client'

import { motion } from 'framer-motion'
import {
  Heart,
  ShoppingBag,
  Users,
  Sparkles,
  ShieldCheck,
  Store
} from 'lucide-react'
import ParallaxTilt from 'react-parallax-tilt'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
}

// Floating animation for background icons
const floatAnimation = {
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    rotate: [0, 10, -10, 0],
    transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
  }
}

export default function AboutPage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white">
      
      {/* Floating Background Icons */}
      <motion.div className="absolute top-10 left-20 text-pink-500/30 text-4xl" {...floatAnimation}><Heart /></motion.div>
      <motion.div className="absolute top-80 right-20 text-rose-400/30 text-5xl" {...floatAnimation}><Sparkles /></motion.div>
      <motion.div className="absolute top-1/2 left-1/4 text-cyan-400/30 text-6xl" {...floatAnimation}><ShoppingBag /></motion.div>
      <motion.div className="absolute bottom-20 right-40 text-emerald-400/30 text-5xl" {...floatAnimation}><Users /></motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-24 z-10">

        {/* HERO */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-1 mb-6 rounded-full text-xs font-semibold
            bg-gradient-to-r from-pink-400 to-rose-500 text-black">
            ABOUT SHEKART
          </span>

          <h1 className="text-4xl sm:text-6xl font-semibold leading-tight">
            Empowering Women
            <br />
            <span className="text-white/60">Through Style & Commerce</span>
          </h1>

          <p className="mt-6 text-lg text-white/70">
            SheKart is a women-first multi-vendor marketplace connecting fashion,
            wellness, and lifestyle brands to empower women shoppers and entrepreneurs.
          </p>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
          <StatCard title="2000+" subtitle="Women Sellers" />
          <StatCard title="100k+" subtitle="Happy Customers" />
          <StatCard title="100%" subtitle="Verified Vendors" />
        </div>

        {/* WHO WE ARE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-24">
          <GlassCard
            title="Who We Are"
            icon={<Store />}
            text="SheKart is a secure, scalable, women-first marketplace built to connect trusted sellers with modern women shoppers. Safety, trust, and empowerment are at our core."
          />

          <GlassCard
            title="Our Mission"
            icon={<Heart />}
            text="Our mission is to empower women-led businesses and provide a stylish, safe, and seamless shopping experience tailored to women."
          />
        </div>

        {/* VALUES */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-28"
        >
          <h2 className="text-3xl font-semibold text-center mb-12">
            What We Stand For
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ParallaxTilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1}>
              <ValueCard
                icon={<ShieldCheck />}
                title="Women First"
                text="Designed with women’s comfort, safety, and confidence in mind."
              />
            </ParallaxTilt>
            <ParallaxTilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1}>
              <ValueCard
                icon={<ShoppingBag />}
                title="Trusted Sellers"
                text="Supporting verified vendors and women entrepreneurs."
              />
            </ParallaxTilt>
            <ParallaxTilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1}>
              <ValueCard
                icon={<Users />}
                title="Community"
                text="More than shopping — a growing women-first ecosystem."
              />
            </ParallaxTilt>
            <ParallaxTilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1}>
              <ValueCard
                icon={<Sparkles />}
                title="Quality & Style"
                text="Curated products aligned with modern trends and quality standards."
              />
            </ParallaxTilt>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

/* ------------------ Components ------------------ */

function GlassCard({ title, text, icon }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8"
    >
      <div className="flex items-center gap-4 mb-4 text-pink-400">
        {icon}
        <h3 className="text-2xl font-semibold">{title}</h3>
      </div>
      <p className="text-white/70 leading-relaxed">{text}</p>
    </motion.div>
  )
}

function ValueCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 text-center"
    >
      <div className="flex justify-center mb-4 text-rose-400">
        {icon}
      </div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className="text-sm text-white/60">{text}</p>
    </motion.div>
  )
}

function StatCard({ title, subtitle }) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
      <p className="text-4xl font-bold text-pink-400">{title}</p>
      <p className="mt-2 text-white/60">{subtitle}</p>
    </div>
  )
}
