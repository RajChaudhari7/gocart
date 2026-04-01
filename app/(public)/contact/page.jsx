'use client'

import { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ParallaxTilt from 'react-parallax-tilt'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
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
    <section className="relative min-h-screen bg-[#050914] text-white overflow-hidden selection:bg-cyan-500/30">
      
      {/* ---------------- Premium Ambient Background ---------------- */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-400/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* ---------------- Main Content ---------------- */}
      <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 z-10">

        {/* HEADER */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-20 md:mb-28"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs font-semibold tracking-[0.2em] text-cyan-400 mb-8 backdrop-blur-md shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            CONTACT US
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]">
            Let’s start a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              conversation.
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
            Questions about orders, enterprise solutions, or partnerships? 
            Our dedicated support team is ready to assist you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

          {/* CONTACT INFO (Left Side - 5 columns) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            <ParallaxTilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.05} transitionSpeed={2000}>
              <InfoCard icon={<Mail size={22} />} title="Email Support" text="support@shekart.com" />
            </ParallaxTilt>
            <ParallaxTilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.05} transitionSpeed={2000}>
              <InfoCard icon={<Phone size={22} />} title="Customer Care" text="+91 90000 00000" />
            </ParallaxTilt>
            <ParallaxTilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.05} transitionSpeed={2000}>
              <InfoCard icon={<MapPin size={22} />} title="Headquarters" text="Bengaluru, India" />
            </ParallaxTilt>
          </motion.div>

          {/* FORM (Right Side - 7 columns) */}
          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-7"
          >
            <div className="rounded-[2.5rem] bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
                  <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-white/80 ml-1">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                    placeholder="How can we help you today?"
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-5 py-4
                    focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/20 resize-none"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {status && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`text-sm ml-1 ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {status.message}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative overflow-hidden rounded-2xl bg-white text-black font-semibold py-4 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </motion.form>

        </div>
      </div>
    </section>
  )
}

/* ---------------- Components ---------------- */

function InfoCard({ icon, title, text }) {
  return (
    <div className="group flex items-center gap-5 rounded-[2rem] bg-white/[0.02] border border-white/5 p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
      <div className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white/90 mb-1">{title}</h3>
        <p className="text-white/50 text-sm font-light tracking-wide">{text}</p>
      </div>
    </div>
  )
}

function Input({ label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-2xl bg-black/20 border border-white/10 px-5 py-4
        focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-white placeholder-white/20"
      />
    </div>
  )
}