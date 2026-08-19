"use client";

import Script from "next/script";
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import LatestProducts from "@/components/LatestProducts";
import Categories from "@/components/Categories";
import RecommendedProducts from "@/components/RecommendedProducts";
import ContinueBrowsing from "@/components/ContinueBrowsing";
import FeaturedCollection from "@/components/FeaturedCollection";
import TrendingProducts from "@/components/TrendingProducts";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function Home() {
  const {
    customerLocation,
    locationLoading,
    locationError,
    serviceable,
    serviceRadius,
    loadNearbyStores,
  } = useCustomerLocation();

  return (
    <>
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Nandurbar Bazar",
            url: "https://gocart-delta.vercel.app",
            logo: "https://gocart-delta.vercel.app/icon-192.png",
            sameAs: [],
          }),
        }}
      />

      <Hero />

      {locationLoading && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center bg-slate-950 text-center px-4">
          <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />

          <h2 className="mt-6 text-xl font-bold text-white">
            Checking delivery availability
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Finding stores and products available for your delivery location...
          </p>
        </div>
      )}

      {!locationLoading && locationError && (
        <div className="min-h-[50vh] flex items-center justify-center bg-slate-950 px-4">
          <div className="max-w-md text-center">
            <div className="text-5xl">📍</div>

            <h2 className="mt-5 text-2xl font-black text-white">
              We need your location
            </h2>

            <p className="mt-3 text-sm text-slate-400">{locationError}</p>

            <button
              onClick={loadNearbyStores}
              className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!locationLoading && !locationError && !serviceable && (
        <div className="min-h-[55vh] flex items-center justify-center bg-slate-950 px-4">
          <div className="max-w-lg text-center">
            <div className="text-6xl">🏪</div>

            <h2 className="mt-6 text-2xl sm:text-3xl font-black text-white">
              We&apos;re not in your area yet
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              We currently don&apos;t have partner stores within {serviceRadius}{" "}
              km of{" "}
              <span className="font-semibold text-white">
                {customerLocation?.label || "your selected location"}
              </span>
              .
            </p>

            <p className="mt-2 text-xs text-slate-500">
              We&apos;re expanding quickly. Hopefully we&apos;ll be delivering
              to your area soon.
            </p>

            <button
              onClick={loadNearbyStores}
              className="mt-7 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-bold text-white"
            >
              Check Again
            </button>
          </div>
        </div>
      )}

      {!locationLoading && !locationError && serviceable && (
        <>
          <Categories />
          <BestSelling />
          <FeaturedCollection />
          <TrendingProducts />
          <ContinueBrowsing />
          <RecommendedProducts />
          <LatestProducts />
        </>
      )}
    </>
  );
}
