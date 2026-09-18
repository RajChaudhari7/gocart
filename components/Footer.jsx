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
    <footer className="relative overflow-hidden bg-[#fffaf5] text-slate-900">
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="absolute -left-32 bottom-20 h-72 w-72 rounded-full bg-emerald-200/15 blur-3xl" />
      </div>

      {/* Top accent */}
      <div className="relative h-1 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            SELLER CTA
        ========================================================= */}
        <div className="border-b border-slate-200/80 py-10 sm:py-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9 lg:px-10">
            {/* Decorative circle */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-50" />

            <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />

                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-600">
                    Built for Nandurbar
                  </span>
                </div>

                <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Shop local.
                  <br />

                  <span className="text-orange-500">
                    Support local.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                  Discover trusted local shops, everyday essentials, and
                  businesses from right here in Nandurbar.
                </p>
              </div>

              <Link href="/create-store">
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex w-full items-center gap-3 rounded-2xl bg-orange-500 px-4 py-4 text-white shadow-lg shadow-orange-500/15 transition-colors hover:bg-orange-600 md:w-auto md:min-w-[255px]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <ShoppingBag size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">
                      List your shop
                    </p>

                    <p className="mt-0.5 text-xs text-orange-100">
                      Grow your local business
                    </p>
                  </div>

                  <ArrowUpRight
                    size={19}
                    className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </motion.div>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================
            MAIN FOOTER
        ========================================================= */}
        <div className="grid gap-12 py-12 sm:py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-16">
          {/* BRAND */}
          <div className="lg:col-span-5">
            <Link href="/" className="group inline-block">
              <div className="text-2xl font-black tracking-[-0.055em] sm:text-3xl">
                Nandurbar
                <span className="text-orange-500 transition-colors group-hover:text-orange-600">
                  Bazar
                </span>
                <span className="text-emerald-500">.</span>
              </div>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
              A digital marketplace connecting Nandurbar&apos;s community
              with local shops, trusted sellers, and the products people
              need every day.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-2.5">
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
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
                  >
                    {social.icon}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:col-span-4">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  {section.title}
                </h3>

                <ul className="space-y-3.5">
                  {section.links.map((link) => (
                    <li key={link.text}>
                      <Link
                        href={link.path}
                        className="group flex w-fit items-center text-sm font-medium text-slate-500 transition-colors hover:text-orange-500"
                      >
                        <span>{link.text}</span>

                        <ArrowUpRight
                          size={12}
                          className="ml-1.5 -translate-y-0.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CONTACT */}
          <div className="lg:col-span-3">
            <h3 className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Get in touch
            </h3>

            <div className="space-y-3">
              {/* Email */}
              <a
                href="mailto:nandurbarbazar@gmail.com"
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-colors group-hover:bg-orange-100">
                  <Mail size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-slate-600">
                    nandurbarbazar@gmail.com
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+918600412566"
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 transition-colors group-hover:bg-emerald-100">
                  <Phone size={16} />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    +91 86004 12566
                  </p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                  <MapPin size={16} />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    Based in
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Nandurbar, Maharashtra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM BAR
        ========================================================= */}
        <div className="flex flex-col gap-5 border-t border-slate-200 py-6 sm:py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              © {currentYear} Nandurbar Bazar
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Made for the local community.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/privacy"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-orange-500"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-orange-500"
            >
              Terms
            </Link>

            <Link
              href="/cookie"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-orange-500"
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