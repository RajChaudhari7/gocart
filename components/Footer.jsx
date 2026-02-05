'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, ArrowUpRight } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const linkSections = [
    {
      title: "Products",
      links: [
        { text: "Earphones", path: "/shop" },
        { text: "Headphones", path: "/shop" },
        { text: "Smartphones", path: "/shop" },
        { text: "Laptops", path: "/shop" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About Us", path: "/about" },
        { text: "Become a Member", path: "/pricing" },
        { text: "Create Store", path: "/create-store" },
        { text: "Terms & Privacy", path: "/privacy" },
      ],
    },
  ]

  const socialLinks = [
    { icon: <Facebook size={18} />, href: "https://facebook.com", color: "hover:bg-blue-600" },
    { icon: <Instagram size={18} />, href: "https://instagram.com", color: "hover:bg-pink-600" },
    { icon: <Twitter size={18} />, href: "https://twitter.com", color: "hover:bg-sky-500" },
    { icon: <Linkedin size={18} />, href: "https://linkedin.com", color: "hover:bg-blue-700" },
  ]

  return (
    <footer className="relative bg-[#020617] text-white overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* MAIN FOOTER CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">

          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="text-3xl font-black tracking-tighter group">
              She<span className="text-cyan-400 group-hover:text-emerald-400 transition-colors">Kart</span>
              <span className="text-emerald-400">.</span>
            </Link>

            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Curating the world’s most advanced hardware for the modern pioneer. Built for performance, designed for life.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <Link key={idx} href={social.href} target="_blank">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors ${social.color}`}
                  >
                    {social.icon}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            {linkSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link
                        href={link.path}
                        className="text-sm text-white/60 hover:text-white flex items-center group"
                      >
                        {link.text}
                        <ArrowUpRight
                          size={12}
                          className="ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">
                Contact
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4 group">
                  <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/30 font-bold">Email Us</p>
                    <p className="text-sm text-white/80">hello@shekart.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-black transition-colors">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/30 font-bold">Call Us</p>
                    <p className="text-sm text-white/80">+91 8600412566</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400 group-hover:bg-purple-400 group-hover:text-black transition-colors">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-white/30 font-bold">Location</p>
                    <p className="text-sm text-white/80">Nandurbar, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30 font-mono">
            &copy; {currentYear}  SheKart CO. ALL RIGHTS RESERVED.
          </p>

          <div className="flex gap-6">
            <Link href="/privacy" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/cookie" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition">
              Cookie Settings
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
