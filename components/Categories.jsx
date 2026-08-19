"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import Image from "next/image";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* DEFAULT CATEGORY IMAGE MAP */
const IMAGE_MAP = {
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",

  Clothing:
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800",

  Fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",

  Watches:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",

  Mobiles:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",

  "Home & Kitchen":
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",

  "Books & Media":
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",

  "Sports & Outdoors":
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800",

  "Beauty & Health":
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",

  Default:
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800",
};

export default function Categories() {
  const router = useRouter();

  const allProducts = useSelector((state) => state.product.list || []);

  const { filterNearbyProducts, locationLoading, serviceable } =
    useCustomerLocation();

  /*
   * Only products from stores that can serve
   * the customer's current location.
   */
  const products = useMemo(() => {
    return filterNearbyProducts(allProducts);
  }, [allProducts, filterNearbyProducts]);

  /*
   * Build categories ONLY from nearby products.
   *
   * This prevents categories belonging only
   * to distant stores from appearing.
   */
  const categories = useMemo(() => {
    const productCategories = products
      .map((product) => product.category?.trim())
      .filter(Boolean);

    return Array.from(new Set(productCategories));
  }, [products]);

  /*
   * Count nearby products per category.
   */
  const categoryCount = useMemo(() => {
    const map = {};

    products.forEach((product) => {
      const category = product.category?.trim();

      if (!category) return;

      map[category] = (map[category] || 0) + 1;
    });

    return map;
  }, [products]);

  const handleClick = (category) => {
    router.push(`/product?category=${encodeURIComponent(category)}`);
  };

  /*
   * Home already handles location/serviceability.
   * This is an additional safeguard.
   */
  if (locationLoading || !serviceable) {
    return null;
  }

  /*
   * If nearby stores exist but currently have
   * no categorized products, don't render an
   * empty category section.
   */
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-950 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400 sm:text-xs">
              Available for Delivery
            </p>

            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              Explore categories available from stores that can deliver to your
              selected location.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/product")}
            className="hidden text-sm font-semibold text-indigo-400 transition-colors hover:text-indigo-300 md:block"
          >
            Browse All Products →
          </button>
        </div>

        {/* CATEGORY GRID */}
        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            sm:gap-4
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-6
          "
        >
          {categories.map((category) => {
            const imageSrc = IMAGE_MAP[category] || IMAGE_MAP.Default;

            const count = categoryCount[category] || 0;

            return (
              <button
                type="button"
                key={category}
                onClick={() => handleClick(category)}
                className="
                  group
                  relative
                  aspect-square
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-900
                  text-left
                  shadow-lg
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-indigo-500/40
                  hover:shadow-xl
                  hover:shadow-indigo-500/5
                "
              >
                {/* IMAGE */}
                <Image
                  src={imageSrc}
                  alt={category}
                  fill
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    ease-out
                    group-hover:scale-110
                  "
                  sizes="
                    (max-width: 640px) 50vw,
                    (max-width: 1024px) 33vw,
                    16vw
                  "
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent opacity-90" />

                {/* INNER BORDER */}
                <div className="absolute inset-2.5 z-10 rounded-xl border border-white/0 transition-colors duration-300 group-hover:border-white/20 sm:inset-3" />

                {/* PRODUCT COUNT */}
                <div className="absolute right-3 top-3 z-20">
                  <span
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-black/50
                      px-2.5
                      py-1
                      text-[9px]
                      font-bold
                      text-white
                      backdrop-blur-md
                      sm:text-[10px]
                    "
                  >
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* TEXT */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-4 md:p-5">
                  <h3 className="line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow-md sm:text-base md:text-lg">
                    {category}
                  </h3>

                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 opacity-80 sm:text-xs">
                    Explore
                    <span>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* MOBILE BROWSE ALL */}
        <button
          type="button"
          onClick={() => router.push("/product")}
          className="
            mt-8
            w-full
            rounded-xl
            border
            border-slate-800
            py-3.5
            text-sm
            font-semibold
            text-slate-300
            transition-colors
            hover:bg-slate-900
            md:hidden
          "
        >
          Browse All Products
        </button>
      </div>
    </section>
  );
}
