"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { motion } from "framer-motion";
import Link from "next/link";

import {
  MapPin,
  LocateFixed,
  RefreshCw,
  Search,
  Store,
  Navigation,
} from "lucide-react";

import FollowStoreButton from "@/components/store/FollowStoreButton";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

function ShopContent() {
  const searchParams = useSearchParams();

  const search = searchParams.get("search");

  const router = useRouter();

  const {
    nearbyStores,
    customerLocation,
    locationLoading,
    locationError,
    serviceable,
    serviceRadius,
    loadNearbyStores,
  } = useCustomerLocation();

  const stores = nearbyStores;

  const [searchInput, setSearchInput] = useState(search || "");

  const [selectedCategory, setSelectedCategory] = useState("All");

  // -----------------------------------------
  // Search URL sync
  // -----------------------------------------

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchInput.trim() === "") {
        router.replace("/shop");
      } else {
        router.replace(`/shop?search=${encodeURIComponent(searchInput)}`);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchInput, router]);

  // -----------------------------------------
  // Categories
  // -----------------------------------------

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(stores.map((store) => store.category).filter(Boolean)),
    ];

    return ["All", ...uniqueCategories];
  }, [stores]);

  // -----------------------------------------
  // Search + category filters
  // -----------------------------------------

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch = search
        ? store.name?.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory === "All" ? true : store.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [stores, search, selectedCategory]);

  // -----------------------------------------
  // Distance formatting
  // -----------------------------------------

  const formatDistance = (distance) => {
    const km = Number(distance);

    if (!Number.isFinite(km)) {
      return "";
    }

    if (km < 1) {
      return `${Math.round(km * 1000)} m away`;
    }

    return `${km.toFixed(1)} km away`;
  };

  return (
    <section className="min-h-screen bg-[#020617] pb-20 text-white">
      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden border-b border-white/5 px-4 pt-24 sm:min-h-[260px]">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 text-center">
          <motion.h1
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl"
          >
            NEARBY{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              SHOPS
            </span>
          </motion.h1>

          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.35em] text-white/35 sm:text-[10px]">
            Stores that can deliver to you
          </p>

          {!locationLoading && !locationError && serviceable && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
              <MapPin size={14} />
              Showing stores within {serviceRadius} km
            </div>
          )}
        </div>
      </div>

      {/* ============================= */}
      {/* SEARCH */}
      {/* ============================= */}

      {!locationLoading && !locationError && serviceable && (
        <div className="sticky top-[70px] z-40 border-b border-white/5 bg-[#020617]/85 backdrop-blur-xl md:top-[80px]">
          <div className="mx-auto max-w-4xl px-3 py-3 sm:px-4 sm:py-4">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />

              <input
                type="text"
                placeholder="Search nearby shops..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/5 py-3.5 pl-11 pr-5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 sm:text-base"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================= */}
      {/* LOCATION LOADING */}
      {/* ============================= */}

      {locationLoading && (
        <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-5 text-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.5, 1],

                opacity: [0.55, 0, 0.55],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute h-28 w-28 rounded-full border border-emerald-400/30"
            />

            <motion.div
              animate={{
                scale: [1, 1.35, 1],

                opacity: [0.4, 0.1, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.3,
              }}
              className="absolute h-20 w-20 rounded-full border border-cyan-400/30"
            />

            <motion.div
              animate={{
                y: [0, -7, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-emerald-500/10 shadow-xl"
            >
              <LocateFixed size={29} className="text-emerald-400" />
            </motion.div>
          </div>

          <motion.h2
            animate={{
              opacity: [0.65, 1, 0.65],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
            className="mt-3 text-xl font-black text-white sm:text-2xl"
          >
            Finding shops near you
          </motion.h2>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/40">
            Checking your location and finding stores that can currently deliver
            to your area.
          </p>

          <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Locating nearby stores
          </div>
        </div>
      )}

      {/* ============================= */}
      {/* LOCATION ERROR */}
      {/* ============================= */}

      {!locationLoading && locationError && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mx-auto flex min-h-[55vh] max-w-lg items-center px-4 py-10"
        >
          <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 text-center shadow-2xl sm:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10">
              <MapPin size={34} className="text-amber-400" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-white">
              We need your location
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/45">
              {locationError}
            </p>

            <button
              type="button"
              onClick={loadNearbyStores}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              <LocateFixed size={18} />
              Try Location Again
            </button>

            <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
              <p className="text-[10px] leading-relaxed text-white/35">
                Turn on device location and allow location permission for
                Nandurbar Bazar.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================= */}
      {/* NOT SERVICEABLE */}
      {/* ============================= */}

      {!locationLoading && !locationError && !serviceable && (
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mx-auto flex min-h-[60vh] max-w-xl items-center px-3 py-10 sm:px-5"
        >
          <div className="relative w-full overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.035] px-5 py-9 text-center shadow-2xl sm:px-8 sm:py-12">
            {/* background */}
            <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

            {/* radar */}

            <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.45, 1],
                  opacity: [0.25, 0, 0.25],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="absolute h-44 w-44 rounded-full border border-emerald-400/20"
              />

              <motion.div
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.35, 0.05, 0.35],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: 0.4,
                }}
                className="absolute h-32 w-32 rounded-full border border-cyan-400/20"
              />

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-white/10 bg-emerald-500/10 shadow-xl"
              >
                <Store size={34} className="text-emerald-400" />
              </motion.div>
            </div>

            <h2 className="relative z-10 mt-2 text-2xl font-black text-white sm:text-3xl">
              We&apos;re not in your area yet
            </h2>

            <p className="relative z-10 mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/45">
              We currently don&apos;t have any delivery partners within{" "}
              {serviceRadius} km of your location.
            </p>

            <p className="relative z-10 mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/30">
              We&apos;re expanding our network and hope to reach your area soon.
            </p>

            <div className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300">
              <Navigation size={14} />
              Current delivery radius: {serviceRadius} km
            </div>

            <button
              type="button"
              onClick={loadNearbyStores}
              className="relative z-10 mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              <RefreshCw size={17} />
              Check Again
            </button>
          </div>
        </motion.div>
      )}

      {/* ============================= */}
      {/* STORES */}
      {/* ============================= */}

      {!locationLoading && !locationError && serviceable && (
        <>
          {/* Categories */}

          <div className="mx-auto mt-6 flex max-w-[1600px] gap-2 overflow-x-auto px-3 pb-2 scrollbar-hide sm:flex-wrap sm:px-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all sm:px-5 sm:text-sm ${
                  selectedCategory === category
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Grid */}

          <div className="mx-auto max-w-[1600px] px-3 py-8 sm:px-6 sm:py-12">
            <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30 sm:text-xs">
                  Available nearby
                </p>

                <h2 className="mt-1 text-lg font-black text-white sm:text-xl">
                  {filteredStores.length}{" "}
                  {filteredStores.length === 1 ? "Shop" : "Shops"} Found
                </h2>
              </div>

              {customerLocation && (
                <div className="hidden max-w-[220px] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/40 sm:flex">
                  <MapPin size={13} className="shrink-0 text-emerald-400" />

                  <span className="truncate">
                    {customerLocation.label || "Delivery location"}
                  </span>
                </div>
              )}
            </div>

            {/* search has no match */}

            {filteredStores.length === 0 ? (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="flex min-h-[300px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.025] px-5 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <Search size={27} className="text-white/30" />
                </div>

                <h3 className="mt-5 text-lg font-black text-white">
                  No matching shops
                </h3>

                <p className="mt-2 max-w-sm text-sm text-white/35">
                  There are nearby shops available, but none match your current
                  search or category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");

                    setSelectedCategory("All");
                  }}
                  className="mt-5 text-sm font-bold text-emerald-400"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
              >
                {filteredStores.map((store) => (
                  <motion.div
                    layout
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    key={store.id}
                    className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.07] sm:p-5"
                  >
                    <Link href={`/shop/${store.username}`} className="block">
                      <div className="flex flex-col items-center text-center">
                        {/* Logo */}

                        <div className="relative mb-3 sm:mb-4">
                          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 shadow-lg sm:h-20 sm:w-20">
                            <img
                              src={store.logo || "/store.png"}
                              alt={store.name}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          </div>

                          <span
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-[#09111f] ${
                              store.isActive ? "bg-emerald-500" : "bg-slate-500"
                            }`}
                          />
                        </div>

                        <h2 className="line-clamp-1 w-full text-sm font-bold text-white sm:text-lg">
                          {store.name}
                        </h2>

                        <p className="mt-1 line-clamp-1 w-full text-[10px] text-white/35 sm:text-xs">
                          {store.category || "Local Store"}
                        </p>

                        {/* Distance */}

                        {store.distanceKm != null && (
                          <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300 sm:px-3 sm:text-[11px]">
                            <MapPin size={11} />

                            <span className="truncate">
                              {formatDistance(store.distanceKm)}
                            </span>
                          </div>
                        )}

                        <p
                          className={`mt-3 text-[9px] font-semibold sm:text-[11px] ${
                            store.isActive
                              ? "text-emerald-400"
                              : "text-white/30"
                          }`}
                        >
                          {store.isActive ? "Open now" : "Currently closed"}
                        </p>
                      </div>
                    </Link>

                    <div className="mt-4 sm:mt-5">
                      <FollowStoreButton store={store} variant="card" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default function Shops() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#020617]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Loading shops
            </p>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
