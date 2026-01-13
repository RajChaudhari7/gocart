"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Users, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-14">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Empowering Women Through Commerce
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            GoCart is a women-focused multi-vendor eCommerce platform where
            fashion, beauty, and lifestyle brands come together to empower
            women shoppers and women entrepreneurs.
          </p>
        </motion.div>

        {/* About Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed">
              GoCart is a secure and scalable multi-vendor marketplace built
              especially for women. We connect customers with trusted sellers
              offering fashion, beauty, wellness, and lifestyle products.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to support women-led businesses while providing a
              safe, stylish, and seamless shopping experience for modern women.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ValueCard
            icon={<Heart className="h-8 w-8" />}
            title="Women First"
            text="Designed with women’s comfort, security, and confidence in mind."
          />
          <ValueCard
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Trusted Vendors"
            text="Supporting verified sellers and women entrepreneurs."
          />
          <ValueCard
            icon={<Users className="h-8 w-8" />}
            title="Community"
            text="More than shopping — a growing women-first community."
          />
          <ValueCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Quality & Style"
            text="Curated products that match modern trends and quality standards."
          />
        </div>

      </div>
    </div>
  );
}

function ValueCard({ icon, title, text }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition">
      <div className="flex justify-center mb-4 text-pink-600">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}
