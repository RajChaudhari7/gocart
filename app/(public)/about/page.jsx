import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingBag, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Empowering Women Through Commerce
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Welcome to our women‑focused multi‑vendor eCommerce platform, where
            style, confidence, and entrepreneurship come together.
          </p>
        </motion.div>

        {/* About Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-3">Who We Are</h2>
              <p className="text-gray-600 leading-relaxed">
                We are a dedicated multi‑vendor eCommerce system built especially
                for women. Our platform connects customers with trusted sellers
                offering fashion, beauty, lifestyle, and wellness products — all
                curated with women in mind.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to empower women — both buyers and sellers — by
                providing a secure, inclusive, and easy‑to‑use marketplace that
                supports women‑led businesses and celebrates individuality.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <Heart className="mx-auto mb-4 h-8 w-8" />
              <h3 className="font-semibold text-lg mb-2">Women First</h3>
              <p className="text-gray-600 text-sm">
                Every feature is designed keeping women’s needs, comfort, and
                safety at the core.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <ShoppingBag className="mx-auto mb-4 h-8 w-8" />
              <h3 className="font-semibold text-lg mb-2">Trusted Sellers</h3>
              <p className="text-gray-600 text-sm">
                We support verified vendors and women entrepreneurs to grow their
                online businesses.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-4 h-8 w-8" />
              <h3 className="font-semibold text-lg mb-2">Community</h3>
              <p className="text-gray-600 text-sm">
                More than shopping — we are a community that supports and inspires
                women.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 text-center">
              <Sparkles className="mx-auto mb-4 h-8 w-8" />
              <h3 className="font-semibold text-lg mb-2">Quality & Style</h3>
              <p className="text-gray-600 text-sm">
                Discover high‑quality, trendy, and reliable products curated for
                modern women.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
