"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function FeaturedCollection() {
  const [allFeaturedProducts, setAllFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { filterNearbyProducts, locationLoading, serviceable } =
    useCustomerLocation();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { data } = await axios.get("/api/featured-products");

      setAllFeaturedProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load featured products:", error);
      setAllFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const products = useMemo(() => {
    return filterNearbyProducts(allFeaturedProducts);
  }, [allFeaturedProducts, filterNearbyProducts]);

  /* ---------------- LOADING ---------------- */

  if (loading || locationLoading) {
    return (
      <section className="mt-10 md:mt-16">
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            md:p-8
          "
        >
          {/* Soft decorative shapes */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-orange-50 blur-3xl" />

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
                bg-amber-50
              "
            >
              <Sparkles className="text-amber-500" size={24} />
            </div>

            <div className="flex-1">
              <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-slate-100" />
              <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
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
                  border-slate-100
                  bg-slate-50
                "
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!serviceable || products.length === 0) {
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
          border-slate-200
          bg-white
          p-4
          shadow-sm
          md:p-8
        "
      >
        {/* BACKGROUND DECORATION */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-amber-50
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-36
            left-1/3
            h-72
            w-72
            rounded-full
            bg-orange-50
            blur-3xl
          "
        />

        {/* HEADER */}

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
            {/* ICON */}

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
                bg-amber-50
                text-amber-500
                ring-8
                ring-amber-50/60
              "
            >
              <Sparkles size={25} />
            </motion.div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                    text-slate-900
                    md:text-3xl
                  "
                >
                  Featured Collection
                </h2>

                {/* PREMIUM BADGE */}

                <span
                  className="
                    hidden
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-amber-200
                    bg-amber-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-amber-700
                    sm:flex
                  "
                >
                  <Star
                    size={13}
                    className="fill-amber-400 text-amber-400"
                  />

                  Premium Picks
                </span>
              </div>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                  md:text-base
                "
              >
                Handpicked products from nearby stores, selected especially
                for you.
              </p>
            </div>
          </div>

          {/* DESKTOP VIEW ALL */}

          <Link
            href="/featured"
            className="
              hidden
              shrink-0
              items-center
              gap-2
              rounded-full
              border
              border-amber-200
              bg-amber-50
              px-5
              py-2.5
              text-sm
              font-semibold
              text-amber-700
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-amber-300
              hover:bg-amber-100
              md:flex
            "
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* INFO ROW */}

        <div
          className="
            relative
            mb-6
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
          "
        >
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-900">
              {products.length}
            </span>{" "}
            featured{" "}
            {products.length === 1 ? "product" : "products"} available near
            you
          </p>

          <div
            className="
              hidden
              items-center
              gap-2
              text-sm
              font-medium
              text-amber-600
              lg:flex
            "
          >
            <Star
              size={15}
              className="fill-amber-400 text-amber-400"
            />

            Curated by Nandurbar Bazar
          </div>
        </div>

        {/* DESKTOP PRODUCTS */}

        <div
          className="
            relative
            hidden
            gap-5
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

        {/* MOBILE PRODUCTS */}

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

          {/* MOBILE VIEW ALL */}

          <div className="mt-5 flex justify-center">
            <Link
              href="/featured"
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-200
                bg-amber-50
                px-5
                py-2.5
                text-sm
                font-semibold
                text-amber-700
                transition
                hover:bg-amber-100
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