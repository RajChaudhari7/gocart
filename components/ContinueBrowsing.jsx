"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { History, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function ContinueBrowsing() {
  const [allBrowsingProducts, setAllBrowsingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { filterNearbyProducts, locationLoading, serviceable } =
    useCustomerLocation();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await axios.get("/api/continue-browsing");

      setAllBrowsingProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("CONTINUE BROWSING ERROR:", error);

      setAllBrowsingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Continue Browsing may contain products viewed earlier
   * from stores that are no longer near the customer's
   * current location.
   *
   * Therefore we filter them using the nearby stores.
   */
  const products = useMemo(() => {
    return filterNearbyProducts(allBrowsingProducts);
  }, [allBrowsingProducts, filterNearbyProducts]);

  /*
   * Wait for BOTH:
   * 1. Browsing history
   * 2. Customer location
   */
  if (loading || locationLoading) {
    return (
      <section className="mt-10 md:mt-16">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-8">
          {/* Soft background decoration */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-100/50 blur-3xl" />

          {/* Heading */}
          <div className="relative z-10 mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
              <History className="text-indigo-600" size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
                Continue Browsing
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Checking products available for your delivery location
              </p>
            </div>
          </div>

          {/* Skeleton */}
          <div className="relative z-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
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

  /*
   * Don't show this section when:
   *
   * - customer's area is not serviceable
   * - none of their previously viewed products
   *   belong to nearby stores
   */
  if (!serviceable || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 md:mt-16">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-8">
        {/* Soft decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-50/70 blur-3xl" />

        {/* Heading */}
        <div className="relative z-10 mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
              <History className="text-indigo-600" size={22} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
                  Continue Browsing
                </h2>

                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 ring-1 ring-indigo-100">
                  Recently viewed
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Pick up where you left off with products available near you
              </p>
            </div>
          </div>

          {/* Product count */}
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 sm:flex">
            <History size={14} className="text-indigo-500" />
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"} viewed
          </div>
        </div>

        {/* ================= DESKTOP ================= */}

        <div className="relative z-10 hidden grid-cols-3 gap-6 md:grid xl:grid-cols-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100/60"
            >
              <ProductCard
                product={product}
                storeIsActive={product.store?.isActive === true}
              />
            </div>
          ))}
        </div>

        {/* ================= MOBILE ================= */}

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
            {products.map((product) => (
              <div
                key={product.id}
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
              </div>
            ))}
          </div>

          {/* Mobile swipe hint */}
          {products.length > 2 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400">
              <span>Swipe to see more</span>
              <ArrowRight size={13} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}