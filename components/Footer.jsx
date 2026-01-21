'use client'

import Link from "next/link";
import { motion } from "framer-motion";

/* ================= SVG ICONS ================= */

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M4 6h16v12H4z M4 6l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const SocialIcon = ({ path }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

/* ================= DATA ================= */

const socials = [
  { path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", link: "#" },
  { path: "M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6z", link: "#" },
  { path: "M23 3s-2 1-3 1a4 4 0 0 0-7 3v1A10 10 0 0 1 3 4s-4 9 5 13", link: "#" },
  { path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V14", link: "#" },
];

/* ================= FOOTER ================= */

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-50 to-slate-100 border-t">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 py-14"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <Link href="/" className="text-3xl font-semibold">
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                Global
              </span>
              Mart.
            </Link>

            <p className="mt-5 text-sm text-slate-600 max-w-sm">
              Smart gadgets, premium tech & accessories – all in one place.
            </p>

            <div className="flex gap-3 mt-6">
              {socials.map((s, i) => (
                <motion.a
                  key={i}
                  href={s.link}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition"
                >
                  <SocialIcon path={s.path} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              {["Earphones", "Headphones", "Smartphones", "Laptops"].map(item => (
                <li key={item} className="hover:text-green-600 transition">
                  <Link href="/shop">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              {["Home", "About", "Pricing", "Create Store"].map(item => (
                <li key={item} className="hover:text-green-600 transition">
                  <Link href="/">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-center gap-2 hover:text-green-600 transition">
                <MailIcon /> globalmart@gmail.com
              </li>
              <li className="flex items-center gap-2 hover:text-green-600 transition">
                <PhoneIcon /> +91 8600412566
              </li>
              <li className="flex items-center gap-2 hover:text-green-600 transition">
                <MapIcon /> Maharashtra, India
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t mt-12 pt-6 text-center text-sm text-slate-500">
          © 2025 GlobalMart. All rights reserved.
        </div>

      </motion.div>
    </footer>
  );
};

export default Footer;
