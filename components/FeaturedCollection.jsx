"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

export default function FeaturedCollection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { data } = await axios.get("/api/featured-products");
      setProducts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="mt-10 md:mt-16">
        <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-orange-500/5 backdrop-blur-xl p-4 md:p-8">

          {/* Heading */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Sparkles className="text-yellow-400" size={22} />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Featured Collection
              </h2>

              <p className="text-slate-400 text-sm">
                Handpicked premium products selected by Global Mart.
              </p>
            </div>
          </div>

          {/* Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] rounded-3xl bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-10 md:mt-16"
    >
      <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-orange-500/5 backdrop-blur-xl p-4 md:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Sparkles className="text-yellow-400" size={22} />
            </div>

            <div>

              <h2 className="text-2xl md:text-3xl font-black text-white">
                Featured Collection
              </h2>

              <p className="text-slate-400 text-sm">
                Handpicked premium products selected by Global Mart.
              </p>

            </div>

          </div>

          <Link
            href="/featured"
            className="hidden md:block text-yellow-400 hover:text-yellow-300 font-semibold transition"
          >
            View All →
          </Link>

        </div>

        {/* Desktop */}
        <div className="hidden md:grid grid-cols-3 xl:grid-cols-5 gap-6">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeIsActive={product.store?.isActive === true}
            />
          ))}

        </div>

        {/* Mobile */}
        <div className="md:hidden">

          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">

            {products.map((product) => (

              <div
                key={product.id}
                className="min-w-[170px] max-w-[170px] snap-start flex-shrink-0"
              >

                <ProductCard
                  product={product}
                  storeIsActive={product.store?.isActive === true}
                />

              </div>

            ))}

          </div>

          <div className="mt-5 flex justify-center">
            <Link
              href="/featured"
              className="text-yellow-400 text-sm font-semibold"
            >
              View All →
            </Link>
          </div>

        </div>

      </div>
    </motion.section>
  );
}