'use client'

import { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'
import { Mail, Phone, MapPin, Send, Heart, ShoppingBag, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import ParallaxTilt from 'react-parallax-tilt'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

// Floating particle animation
const floatingVariants = {
  animate: i => ({
    y: [0, -15 - i * 5, 0],
    x: [0, 10 + i * 3, -10 - i * 2, 0],
    rotate: [0, 5, -5, 0],
    transition: { repeat: Infinity, duration: 8 + i, ease: 'easeInOut', delay: i }
  })
}

export default function ContactPage() {
  const formRef = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )
      setStatus({ type: 'success', message: 'Message sent successfully. We’ll get back to you shortly.' })
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6 overflow-hidden">
      
      {/* ---------------- Animated Background Particles ---------------- */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          custom={i}
          variants={floatingVariants}
          animate="animate"
          className="absolute text-pink-500/40 text-5xl"
          style={{
            top: `${10 + i * 15}%`,
            left: `${5 + i * 12}%`,
          }}
        >
          <Heart />
        </motion.div>
      ))}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          custom={i}
          variants={floatingVariants}
          animate="animate"
          className="absolute text-rose-400/30 text-6xl"
          style={{
            top: `${20 + i * 18}%`,
            right: `${10 + i * 15}%`,
          }}
        >
          <Sparkles />
        </motion.div>
      ))}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`bag-${i}`}
          custom={i}
          variants={floatingVariants}
          animate="animate"
          className="absolute text-cyan-400/30 text-5xl"
          style={{
            top: `${50 + i * 10}%`,
            left: `${20 + i * 10}%`,
          }}
        >
          <ShoppingBag />
        </motion.div>
      ))}

      {/* ---------------- Main Content ---------------- */}
      <div className="relative max-w-7xl mx-auto py-24 z-10">

        {/* HEADER */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1 mb-6 rounded-full text-xs font-semibold
            bg-gradient-to-r from-pink-400 to-rose-500 text-black">
            CONTACT SHEKART
          </span>

          <h1 className="text-4xl sm:text-6xl font-semibold leading-tight">
            Let’s Connect
            <br />
            <span className="text-white/60">We’re Here to Help</span>
          </h1>

          <p className="mt-6 text-lg text-white/70">
            Questions about orders, vendors, partnerships, or support?
            Reach out to us anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* CONTACT INFO */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <ParallaxTilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1}>
              <InfoCard icon={<Mail />} title="Email Support" text="support@shekart.com" />
            </ParallaxTilt>
            <ParallaxTilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1}>
              <InfoCard icon={<Phone />} title="Customer Care" text="+91 90000 00000" />
            </ParallaxTilt>
            <ParallaxTilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1}>
              <InfoCard icon={<MapPin />} title="Office Location" text="India" />
            </ParallaxTilt>
          </motion.div>

          {/* FORM */}
          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ParallaxTilt tiltMaxAngleX={8} tiltMaxAngleY={8} glareEnable={true} glareMaxOpacity={0.05}>
              <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 space-y-5">
                <Input label="Full Name" name="name" value={form.name} onChange={handleChange} />
                <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} />

                <div>
                  <label className="block text-sm mb-2 text-white/70">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3
                    focus:outline-none focus:ring-2 focus:ring-pink-400 text-white"
                  />
                </div>

                {status && (
                  <p className={`text-sm ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {status.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2
                  bg-gradient-to-r from-pink-400 to-rose-500
                  text-black font-semibold py-3 rounded-xl
                  hover:scale-105 active:scale-95 transition"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  <Send size={18} />
                </button>
              </div>
            </ParallaxTilt>
          </motion.form>

        </div>
      </div>
    </section>
  )
}

/* ---------------- Components ---------------- */

function InfoCard({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
    >
      <div className="text-pink-400">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-white/60 text-sm">{text}</p>
      </div>
    </motion.div>
  )
}

function Input({ label, name, type = 'text', value, onChange }) {
  return (
    <div className="mb-5">
      <label className="block text-sm mb-2 text-white/70">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-pink-400 text-white"
      />
    </div>
  )
}
