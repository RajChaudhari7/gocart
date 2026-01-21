'use client'

import { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const formRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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

      setStatus({
        type: 'success',
        message: 'Message sent successfully. We’ll get back to you shortly.',
      })
      setForm({ name: '', email: '', message: '' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6">
      <div className="max-w-7xl mx-auto py-24">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1 mb-6 rounded-full text-xs font-semibold
            bg-gradient-to-r from-cyan-400 to-emerald-400 text-black">
            CONTACT GOCART
          </span>

          <h1 className="text-4xl sm:text-6xl font-semibold leading-tight">
            Let’s Talk
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
            <InfoCard
              icon={<Mail />}
              title="Email Support"
              text="support@gocart.com"
            />
            <InfoCard
              icon={<Phone />}
              title="Customer Care"
              text="+91 90000 00000"
            />
            <InfoCard
              icon={<MapPin />}
              title="Office Location"
              text="India"
            />
          </motion.div>

          {/* FORM */}
          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8"
          >
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <div className="mb-6">
              <label className="block text-sm mb-2 text-white/70">
                Message
              </label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
              />
            </div>

            {status && (
              <p
                className={`mb-4 text-sm ${
                  status.type === 'success'
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2
              bg-gradient-to-r from-cyan-400 to-emerald-400
              text-black font-semibold py-3 rounded-xl
              hover:scale-105 active:scale-95 transition"
            >
              {loading ? 'Sending...' : 'Send Message'}
              <Send size={18} />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Components ---------------- */

function InfoCard({ icon, title, text }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <div className="text-cyan-400">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-white/60 text-sm">{text}</p>
      </div>
    </div>
  )
}

function Input({ label, name, type = 'text', value, onChange }) {
  return (
    <div className="mb-5">
      <label className="block text-sm mb-2 text-white/70">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3
        focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
      />
    </div>
  )
}
