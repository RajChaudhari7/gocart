"use client";

import Title from "./Title";
import Link from "next/link";
import { Store, Package, ArrowRight, MapPin } from "lucide-react";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

const BestSelling = () => {
  const { nearbyStores, serviceRadius } = useCustomerLocation();

  return (
    <section className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 sm:mb-10">
          <Title
            title="Start Shopping"
            description="Pick how you want to discover your next favourite product"
            href="/product"
            theme="light"
          />
        </div>

        {/* SHOPPING OPTIONS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* SHOP BY SHOP */}
          <Link href="/shop" className="group block">
            <div
              className="
                relative
                h-full
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-emerald-200
                hover:shadow-lg
                sm:p-8
                md:p-10
              "
            >
              {/* SOFT BACKGROUND SHAPE */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-emerald-50
                  transition-transform
                  duration-500
                  group-hover:scale-125
                "
              />

              <div className="relative flex flex-col items-center text-center">

                {/* ICON */}
                <div
                  className="
                    mb-5
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-50
                    text-emerald-600
                    ring-8
                    ring-emerald-50/60
                    transition-all
                    duration-300
                    group-hover:scale-105
                    group-hover:bg-emerald-100
                  "
                >
                  <Store className="h-7 w-7" strokeWidth={2} />
                </div>

                {/* TITLE */}
                <h2
                  className="
                    mb-2
                    text-xl
                    font-extrabold
                    tracking-tight
                    text-slate-900
                    sm:text-2xl
                  "
                >
                  Shop by Shop
                </h2>

                {/* DESCRIPTION */}
                <p
                  className="
                    max-w-sm
                    text-sm
                    leading-relaxed
                    text-slate-500
                    sm:text-[15px]
                  "
                >
                  Discover local stores around you and shop directly from the
                  sellers you love.
                </p>

                {/* STORE INFO */}
                <div
                  className="
                    mt-6
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-emerald-50
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-emerald-700
                  "
                >
                  <MapPin className="h-3.5 w-3.5" />

                  <span>
                    {nearbyStores.length}{" "}
                    {nearbyStores.length === 1 ? "store" : "stores"} nearby
                  </span>

                  <span className="text-emerald-300">•</span>

                  <span>{serviceRadius} km</span>
                </div>

                {/* ACTION */}
                <div
                  className="
                    mt-6
                    flex
                    items-center
                    gap-1.5
                    text-sm
                    font-bold
                    text-emerald-600
                    transition-all
                    group-hover:gap-2.5
                  "
                >
                  Explore stores
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* SHOP BY PRODUCT */}
          <Link href="/product" className="group block">
            <div
              className="
                relative
                h-full
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-violet-200
                hover:shadow-lg
                sm:p-8
                md:p-10
              "
            >
              {/* SOFT BACKGROUND SHAPE */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-violet-50
                  transition-transform
                  duration-500
                  group-hover:scale-125
                "
              />

              <div className="relative flex flex-col items-center text-center">

                {/* ICON */}
                <div
                  className="
                    mb-5
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-violet-50
                    text-violet-600
                    ring-8
                    ring-violet-50/60
                    transition-all
                    duration-300
                    group-hover:scale-105
                    group-hover:bg-violet-100
                  "
                >
                  <Package className="h-7 w-7" strokeWidth={2} />
                </div>

                {/* TITLE */}
                <h2
                  className="
                    mb-2
                    text-xl
                    font-extrabold
                    tracking-tight
                    text-slate-900
                    sm:text-2xl
                  "
                >
                  Shop by Product
                </h2>

                {/* DESCRIPTION */}
                <p
                  className="
                    max-w-sm
                    text-sm
                    leading-relaxed
                    text-slate-500
                    sm:text-[15px]
                  "
                >
                  Search for exactly what you need and discover products from
                  nearby stores that deliver to you.
                </p>

                {/* PRODUCT INFO */}
                <div
                  className="
                    mt-6
                    rounded-full
                    bg-violet-50
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-violet-700
                  "
                >
                  Browse products near you
                </div>

                {/* ACTION */}
                <div
                  className="
                    mt-6
                    flex
                    items-center
                    gap-1.5
                    text-sm
                    font-bold
                    text-violet-600
                    transition-all
                    group-hover:gap-2.5
                  "
                >
                  Explore products
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default BestSelling;