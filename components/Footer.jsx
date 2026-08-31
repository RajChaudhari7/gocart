"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Twitter,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "For Sellers",
      links: [
        { text: "Register Your Shop", path: "/create-store" },
        { text: "Seller Dashboard", path: "/store" },
        { text: "Seller Guidelines", path: "/guidelines" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About Us", path: "/about" },
        { text: "Contact Support", path: "/contact" },
        { text: "Terms of Service", path: "/terms" },
        { text: "Privacy Policy", path: "/privacy" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: <Instagram size={17} />,
      href: "https://www.instagram.com/nandurbarbazarofficial",
      label: "Instagram",
    },
    {
      icon: <Facebook size={17} />,
      href: "https://facebook.com",
      label: "Facebook",
    },
    {
      icon: <Twitter size={17} />,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <Linkedin size={17} />,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#030712] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/[0.05] blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Top accent */}
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* CTA Banner */}
        <div className="border-b border-white/[0.07] py-12 md:py-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
                  Built for Nandurbar
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                Shop local.
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Support local.
                </span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-white/40">
                Discover trusted local shops, everyday essentials and businesses
                from right here in Nandurbar.
              </p>
            </div>

            <Link href="/create-store">
              <motion.div
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-fit items-center gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.07] px-5 py-4 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-black">
                  <ShoppingBag size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">List your shop</p>
                  <p className="mt-0.5 text-xs text-white/35">
                    Grow your local business
                  </p>
                </div>

                <ArrowUpRight
                  size={18}
                  className="ml-2 text-white/30 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-400"
                />
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Main footer */}
        <div className="grid gap-14 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="group inline-block">
              <div className="text-3xl font-black tracking-[-0.06em]">
                Nandurbar
                <span className="text-cyan-400 transition-colors group-hover:text-emerald-400">
                  Bazar
                </span>
                <span className="text-emerald-400">.</span>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/35">
              A digital marketplace connecting Nandurbar&apos;s community with
              local shops, trusted sellers and the products people need every
              day.
            </p>

            {/* Socials */}
            <div className="mt-7 flex items-center gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-400"
                  >
                    {social.icon}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-10 lg:col-span-5">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                  {section.title}
                </h3>

                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link
                        href={link.path}
                        className="group flex w-fit items-center text-sm text-white/55 transition-colors hover:text-white"
                      >
                        <span>{link.text}</span>

                        <ArrowUpRight
                          size={12}
                          className="ml-1.5 -translate-y-0.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:translate-y-[-2px] group-hover:opacity-100"
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
            <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
              Get in touch
            </h3>

            <div className="space-y-4">
              {/* Email */}
              <a
                href="mailto:nandurbarbazar@gmail.com"
                className="group flex items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-cyan-400 transition-all group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10">
                  <Mail size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                    Email
                  </p>
                  <p className="mt-1 truncate text-sm text-white/65 transition-colors group-hover:text-white">
                    nandurbarbazar@gmail.com
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+918600412566"
                className="group flex items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-emerald-400 transition-all group-hover:border-emerald-400/30 group-hover:bg-emerald-400/10">
                  <Phone size={16} />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                    Phone
                  </p>
                  <p className="mt-1 text-sm text-white/65 transition-colors group-hover:text-white">
                    +91 86004 12566
                  </p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-purple-400">
                  <MapPin size={16} />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                    Based in
                  </p>
                  <p className="mt-1 text-sm text-white/65">
                    Nandurbar, Maharashtra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-5 border-t border-white/[0.07] py-7 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/25">
              © {currentYear} Nandurbar Bazar
            </p>

            <p className="text-[10px] text-white/15">
              Made for the local community.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[10px] font-medium uppercase tracking-widest text-white/25 transition-colors hover:text-white"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-[10px] font-medium uppercase tracking-widest text-white/25 transition-colors hover:text-white"
            >
              Terms
            </Link>

            <Link
              href="/cookie"
              className="text-[10px] font-medium uppercase tracking-widest text-white/25 transition-colors hover:text-white"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
