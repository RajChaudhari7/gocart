"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function TrendingProducts() {
  const [allTrendingProducts, setAllTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { filterNearbyProducts, locationLoading, serviceable } =
    useCustomerLocation();

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const { data } = await axios.get("/api/trending-products");

      setAllTrendingProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("TRENDING PRODUCTS ERROR:", error);
      setAllTrendingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const products = useMemo(() => {
    return filterNearbyProducts(allTrendingProducts);
  }, [allTrendingProducts, filterNearbyProducts]);

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
          {/* Soft decorative background */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-50 blur-3xl" />

          <div className="relative z-10 mb-8 flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-orange-50
                text-orange-500
              "
            >
              <Flame size={23} />
            </div>

            <div className="flex-1">
              <div className="h-7 w-64 max-w-full animate-pulse rounded-lg bg-slate-100" />

              <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-4
              md:grid-cols-3
              md:gap-6
              xl:grid-cols-5
            "
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-slate-100
                  bg-slate-50
                "
              >
                <div className="aspect-square animate-pulse bg-slate-100" />

                <div className="space-y-3 p-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />

                  <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
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
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
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
        {/* SOFT BACKGROUND ACCENTS */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-orange-50
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-28
            -left-28
            h-72
            w-72
            rounded-full
            bg-amber-50
            blur-3xl
          "
        />

        {/* HEADER */}

        <div
          className="
            relative
            z-10
            mb-7
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            md:mb-8
          "
        >
          <div className="flex items-center gap-3">
            {/* TRENDING ICON */}

            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, -4, 4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1.5,
              }}
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-orange-50
                text-orange-500
                ring-8
                ring-orange-50/60
              "
            >
              <Flame
                size={24}
                className="fill-orange-400 text-orange-500"
              />
            </motion.div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                    text-slate-900
                    md:text-3xl
                  "
                >
                  Trending Products
                </h2>

                {/* LIVE BADGE */}

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    border
                    border-orange-200
                    bg-orange-50
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-orange-700
                  "
                >
                  <TrendingUp size={12} />
                  Live
                </span>
              </div>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                  sm:text-sm
                "
              >
                Popular products people are shopping for near you
              </p>
            </div>
          </div>

          {/* UPDATE STATUS */}

          <div
            className="
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-slate-200
              bg-slate-50
              px-4
              py-2
              text-xs
              font-medium
              text-slate-500
              sm:flex
            "
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />

            Updated automatically
          </div>
        </div>

        {/* PRODUCT COUNT */}

        <div className="relative z-10 mb-6">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-900">
              {products.length}
            </span>{" "}
            trending{" "}
            {products.length === 1 ? "product" : "products"} available near
            you
          </p>
        </div>

        {/* DESKTOP */}

        <div
          className="
            relative
            z-10
            hidden
            grid-cols-3
            gap-6
            md:grid
            xl:grid-cols-5
          "
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="
                relative
                rounded-3xl
                transition
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:shadow-orange-100
              "
            >
              <ProductCard
                product={product}
                storeIsActive={product.store?.isActive === true}
                trending
                trendingRank={index + 1}
              />
            </div>
          ))}
        </div>

        {/* MOBILE */}

        <div className="relative z-10 md:hidden">
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
              <div
                key={product.id}
                className="
                  min-w-[175px]
                  max-w-[175px]
                  flex-shrink-0
                  snap-start
                "
              >
                <ProductCard
                  product={product}
                  storeIsActive={product.store?.isActive === true}
                  trending
                  trendingRank={index + 1}
                />
              </div>
            ))}
          </div>

          {/* MOBILE HINT */}

          <div className="mt-3 flex justify-center">
            <span className="text-[11px] font-medium text-slate-400">
              Swipe to explore more
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}