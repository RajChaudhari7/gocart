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
   * Build categories only from nearby products.
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
   */
  if (locationLoading || !serviceable) {
    return null;
  }

  /*
   * Don't show an empty category section.
   */
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Shop nearby
            </p>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-1.5 max-w-xl text-sm text-slate-500">
              Find everything you need from stores delivering to your location.
            </p>
          </div>

          {/* DESKTOP BROWSE BUTTON */}
          <button
            type="button"
            onClick={() => router.push("/product")}
            className="
              hidden
              rounded-full
              border
              border-slate-200
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition-all
              hover:border-emerald-200
              hover:bg-emerald-50
              hover:text-emerald-700
              md:block
            "
          >
            View all
          </button>
        </div>

        {/* CATEGORY GRID */}
        <div
          className="
            grid
            grid-cols-4
            gap-x-3
            gap-y-7
            sm:grid-cols-5
            sm:gap-x-5
            sm:gap-y-8
            md:grid-cols-6
            lg:grid-cols-8
            xl:grid-cols-10
          "
        >
          {categories.map((category, index) => {
            const imageSrc = IMAGE_MAP[category] || IMAGE_MAP.Default;
            const count = categoryCount[category] || 0;

            return (
              <button
                type="button"
                key={category}
                onClick={() => handleClick(category)}
                aria-label={`Explore ${category}`}
                className="
                  group
                  flex
                  min-w-0
                  flex-col
                  items-center
                  text-center
                  outline-none
                "
              >
                {/* IMAGE CIRCLE */}
                <div
                  className="
                    relative
                    aspect-square
                    w-full
                    max-w-[105px]
                    overflow-hidden
                    rounded-full
                    border
                    border-slate-100
                    bg-slate-50
                    shadow-sm
                    transition-all
                    duration-300
                    group-hover:-translate-y-1
                    group-hover:border-emerald-200
                    group-hover:shadow-md
                    group-focus-visible:ring-2
                    group-focus-visible:ring-emerald-500
                    group-focus-visible:ring-offset-2
                    sm:max-w-[115px]
                    md:max-w-[125px]
                  "
                >
                  <Image
                    src={imageSrc}
                    alt={category}
                    fill
                    className="
                      object-cover
                      transition-transform
                      duration-500
                      ease-out
                      group-hover:scale-105
                    "
                    sizes="
                      (max-width: 640px) 25vw,
                      (max-width: 768px) 20vw,
                      (max-width: 1024px) 16vw,
                      12vw
                    "
                  />

                  {/* PRODUCT COUNT */}
                  <span
                    className="
                      absolute
                      right-1
                      top-1
                      rounded-full
                      border
                      border-white
                      bg-white
                      px-1.5
                      py-0.5
                      text-[8px]
                      font-bold
                      text-slate-600
                      shadow-sm
                      sm:right-1.5
                      sm:top-1.5
                      sm:px-2
                      sm:text-[9px]
                    "
                  >
                    {count}
                  </span>
                </div>

                {/* CATEGORY NAME */}
                <h3
                  className="
                    mt-3
                    line-clamp-2
                    max-w-[115px]
                    text-xs
                    font-semibold
                    leading-snug
                    text-slate-700
                    transition-colors
                    group-hover:text-emerald-700
                    sm:text-sm
                  "
                >
                  {category}
                </h3>

                {/* SMALL SUBTEXT */}
                <span
                  className="
                    mt-0.5
                    text-[10px]
                    font-medium
                    text-slate-400
                    transition-colors
                    group-hover:text-emerald-600
                  "
                >
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </button>
            );
          })}
        </div>

        {/* MOBILE VIEW ALL */}
        <button
          type="button"
          onClick={() => router.push("/product")}
          className="
            mt-9
            w-full
            rounded-full
            border
            border-slate-200
            bg-white
            py-3
            text-sm
            font-semibold
            text-slate-700
            shadow-sm
            transition-all
            hover:border-emerald-200
            hover:bg-emerald-50
            hover:text-emerald-700
            md:hidden
          "
        >
          View all categories
        </button>
      </div>
    </section>
  );
}