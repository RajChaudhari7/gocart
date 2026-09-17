"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Sparkles, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useCustomerLocation } from "@/context/CustomerLocationContext";
import Link from "next/link";

export default function SimilarProducts({ productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    filterNearbyProducts,
    locationLoading,
    locationError,
    serviceable,
  } = useCustomerLocation();

  /* ================= FETCH SIMILAR PRODUCTS ================= */

  useEffect(() => {
    if (!productId) return;

    fetchProducts();
  }, [productId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/products/${productId}/similar`
      );

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("SIMILAR PRODUCTS ERROR:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER NEARBY PRODUCTS ================= */

  const nearbyProducts = useMemo(() => {
    if (locationLoading || locationError || !serviceable) {
      return [];
    }

    return filterNearbyProducts(products);
  }, [
    products,
    filterNearbyProducts,
    locationLoading,
    locationError,
    serviceable,
  ]);

  /* ================= LOADING ================= */

  if (loading || locationLoading) {
    return (
      <section className="mt-12 sm:mt-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Sparkles
                size={19}
                className="text-orange-500"
              />
            </div>

            <div>
              <div className="h-6 w-44 animate-pulse rounded-lg bg-slate-200" />

              <div className="mt-2 h-4 w-56 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>

        {/* Skeletons */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 sm:gap-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="aspect-square animate-pulse bg-slate-100" />

              <div className="space-y-3 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />

                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />

                <div className="h-9 w-full animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ================= DON'T SHOW SECTION ================= */

  if (
    locationError ||
    !serviceable ||
    nearbyProducts.length === 0
  ) {
    return null;
  }

  /* ================= UI ================= */

  return (
    <section className="mt-12 sm:mt-16">
      {/* ================= SECTION HEADER ================= */}

      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Sparkles
              size={19}
              strokeWidth={2.3}
              className="text-orange-500"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Similar Products
            </h2>

            <p className="mt-0.5 text-xs font-medium text-slate-400 sm:text-sm">
              You may also like
            </p>
          </div>
        </div>

        {/* Desktop browse link */}
        <Link
          href="/product"
          className="hidden shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-orange-500 transition hover:bg-orange-50 hover:text-orange-600 sm:inline-flex"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* ================= DESKTOP ================= */}

      <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {nearbyProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            storeIsActive={product.store?.isActive === true}
          />
        ))}
      </div>

      {/* ================= MOBILE ================= */}

      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
          {nearbyProducts.map((product) => (
            <div
              key={product.id}
              className="w-[158px] min-w-[158px] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                storeIsActive={product.store?.isActive === true}
              />
            </div>
          ))}
        </div>

        {/* Mobile scroll indicator */}
        {nearbyProducts.length > 2 && (
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="h-1 w-5 rounded-full bg-orange-400" />
            <span className="h-1 w-1 rounded-full bg-slate-200" />
            <span className="h-1 w-1 rounded-full bg-slate-200" />
          </div>
        )}
      </div>
    </section>
  );
}