"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
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
      console.error("Failed to load featured products:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="mt-10 md:mt-16">
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-yellow-500/20
            bg-gradient-to-br
            from-[#0f172a]
            via-[#111827]
            to-[#020617]
            p-4
            shadow-2xl
            shadow-yellow-950/20
            md:p-8
          "
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative mb-8 flex items-center gap-4">
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                animate-pulse
                items-center
                justify-center
                rounded-2xl
                border
                border-yellow-500/20
                bg-yellow-500/10
              "
            >
              <Sparkles className="text-yellow-400" size={24} />
            </div>

            <div className="flex-1">
              <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-white/10" />
              <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-lg bg-white/5" />
            </div>
          </div>

          <div className="relative mb-6 flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
            <div className="hidden h-4 w-48 animate-pulse rounded bg-white/5 lg:block" />
          </div>

          <div
            className="
              relative
              grid
              grid-cols-2
              gap-4
              md:grid-cols-2
              md:gap-6
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
            "
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="
                  h-[320px]
                  animate-pulse
                  rounded-3xl
                  border
                  border-white/5
                  bg-slate-800/80
                "
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-10 md:mt-16"
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-yellow-500/20
          bg-gradient-to-br
          from-[#0f172a]
          via-[#111827]
          to-[#020617]
          p-4
          shadow-2xl
          shadow-yellow-950/20
          md:p-8
        "
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div
          className="
            relative
            mb-8
            flex
            flex-col
            gap-6
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-yellow-400
                to-orange-500
                shadow-lg
                shadow-yellow-500/20
              "
            >
              <Sparkles size={25} className="text-black" />
            </motion.div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                  Featured Collection
                </h2>

                <span
                  className="
                    hidden
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-yellow-500/30
                    bg-yellow-500/10
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-yellow-300
                    sm:flex
                  "
                >
                  <Star size={13} className="fill-yellow-300" />
                  Premium Picks
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Handpicked premium products from the best local stores across{" "}
                <span className="font-semibold text-yellow-300">
                  Nandurbar Bazar
                </span>
                .
              </p>
            </div>
          </div>

          <Link
            href="/featured"
            className="
              hidden
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-yellow-500/30
              bg-yellow-500/10
              px-5
              py-3
              font-semibold
              text-yellow-300
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-yellow-400/50
              hover:bg-yellow-500/20
              hover:text-yellow-200
              md:flex
            "
          >
            View All
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{products.length}</span>{" "}
            featured {products.length === 1 ? "product" : "products"}
          </p>

          <div className="hidden items-center gap-2 text-sm font-medium text-yellow-300 lg:flex">
            <Star size={15} className="fill-yellow-300" />
            Curated by Nandurbar Bazar
          </div>
        </div>

        <div
          className="
            relative
            hidden
            gap-6
            md:grid
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            2xl:grid-cols-5
          "
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.35,
                delay: Math.min(index * 0.06, 0.3),
              }}
            >
              <ProductCard
                product={product}
                storeIsActive={product.store?.isActive === true}
              />
            </motion.div>
          ))}
        </div>

        <div className="relative md:hidden">
          <div
            className="
              flex
              snap-x
              snap-mandatory
              gap-4
              overflow-x-auto
              pb-3
              scrollbar-hide
            "
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.05, 0.25),
                }}
                className="
                  min-w-[170px]
                  max-w-[170px]
                  flex-shrink-0
                  snap-start
                "
              >
                <ProductCard
                  product={product}
                  storeIsActive={product.store?.isActive === true}
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            <Link
              href="/featured"
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-yellow-500/30
                bg-yellow-500/10
                px-5
                py-2.5
                text-sm
                font-semibold
                text-yellow-300
                transition
                hover:bg-yellow-500/20
              "
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}