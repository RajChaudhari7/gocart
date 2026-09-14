"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function RecommendedProducts() {
  const [allRecommendedProducts, setAllRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { filterNearbyProducts, locationLoading, serviceable } =
    useCustomerLocation();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data } = await axios.get("/api/recommendations");

      setAllRecommendedProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("RECOMMENDATIONS ERROR:", error);

      setAllRecommendedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const products = useMemo(() => {
    return filterNearbyProducts(allRecommendedProducts);
  }, [allRecommendedProducts, filterNearbyProducts]);

  if (loading || locationLoading) {
    return (
      <section className="mt-10 md:mt-16">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-8">
          {/* Soft background decoration */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-100/50 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-violet-100/40 blur-3xl" />

          {/* Heading */}
          <div className="relative z-10 mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-100 md:h-12 md:w-12">
              <Sparkles className="text-cyan-600" size={20} />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-3xl">
                Recommended For You
              </h2>

              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                Finding personalized products available for your delivery
                location
              </p>
            </div>
          </div>

          {/* Skeleton */}
          <div
            className="
              relative
              z-10
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-2
              md:grid-cols-3
              md:gap-6
              lg:grid-cols-4
              xl:grid-cols-5
            "
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
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
    <section className="mt-10 md:mt-16">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-8">
        {/* Soft background decoration */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-violet-100/40 blur-3xl" />

        {/* Heading */}
        <div className="relative z-10 mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-100 md:h-12 md:w-12">
              <Sparkles className="text-cyan-600" size={20} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-3xl">
                  Recommended For You
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 ring-1 ring-cyan-100">
                  <Sparkles size={11} />
                  Picks for you
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                Personalized picks available for your selected delivery
                location
              </p>
            </div>
          </div>

          {/* Product count */}
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 sm:flex">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            {products.length}{" "}
            {products.length === 1 ? "recommendation" : "recommendations"}
          </div>
        </div>

        {/* Products */}
        <div
          className="
            relative
            z-10
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-2
            md:grid-cols-3
            md:gap-6
            lg:grid-cols-4
            xl:grid-cols-5
          "
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-100/60"
            >
              <ProductCard
                product={product}
                storeIsActive={product.store?.isActive === true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}