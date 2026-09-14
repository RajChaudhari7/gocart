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
  ArrowRight,
  ShoppingBag,
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
        router.replace(
          `/shop?search=${encodeURIComponent(searchInput)}`,
        );
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchInput, router]);

  // -----------------------------------------
  // Categories
  // -----------------------------------------

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        stores.map((store) => store.category).filter(Boolean),
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [stores]);

  // -----------------------------------------
  // Search + category filters
  // -----------------------------------------

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch = search
        ? store.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
        : true;

      const matchesCategory =
        selectedCategory === "All"
          ? true
          : store.category === selectedCategory;

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
    <section className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="relative overflow-hidden border-b border-slate-200 bg-white">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -left-32 -top-24 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-orange-100/60 blur-3xl" />

        <div className="relative mx-auto flex min-h-[250px] max-w-7xl items-center justify-center px-4 pb-10 pt-28 sm:min-h-[300px] sm:px-6 lg:pt-36">
          <div className="text-center">
            {/* Small badge */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"
            >
              <ShoppingBag size={14} />
              Discover local stores
            </motion.div>

            {/* Heading */}

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
              }}
              className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl md:text-6xl"
            >
              Shops{" "}
              <span className="text-emerald-600">
                near you
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.15,
              }}
              className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base"
            >
              Explore nearby stores, discover local products, and find
              businesses that can deliver to your location.
            </motion.p>

            {!locationLoading &&
              !locationError &&
              serviceable && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                  <MapPin size={14} />
                  Showing stores within {serviceRadius} km
                </div>
              )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      {!locationLoading &&
        !locationError &&
        serviceable && (
          <div className="sticky top-[70px] z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl md:top-[80px]">
            <div className="mx-auto max-w-4xl px-3 py-3 sm:px-4 sm:py-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search nearby shops..."
                  value={searchInput}
                  onChange={(e) =>
                    setSearchInput(e.target.value)
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    py-3.5
                    pl-11
                    pr-5
                    text-sm
                    font-medium
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-emerald-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-emerald-50
                    sm:rounded-full
                  "
                />
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          LOCATION LOADING
      ===================================================== */}

      {locationLoading && (
        <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-5 text-center">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute h-28 w-28 rounded-full border-2 border-emerald-200"
            />

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.1, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.3,
              }}
              className="absolute h-20 w-20 rounded-full border border-emerald-300"
            />

            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200"
            >
              <LocateFixed
                size={25}
                className="text-white"
              />
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
            className="mt-3 text-xl font-black text-slate-900 sm:text-2xl"
          >
            Finding shops near you
          </motion.h2>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            Checking your location and finding stores that can
            currently deliver to your area.
          </p>

          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Locating nearby stores
          </div>
        </div>
      )}

      {/* =====================================================
          LOCATION ERROR
      ===================================================== */}

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
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
              <MapPin
                size={34}
                className="text-amber-600"
              />
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              We need your location
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              {locationError}
            </p>

            <button
              type="button"
              onClick={loadNearbyStores}
              className="
                mt-7
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-emerald-600
                px-5
                py-3.5
                text-sm
                font-black
                text-white
                shadow-sm
                transition
                hover:bg-emerald-700
                active:scale-[0.98]
              "
            >
              <LocateFixed size={18} />
              Try Location Again
            </button>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] leading-relaxed text-slate-400">
                Turn on device location and allow location
                permission for Nandurbar Bazar.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* =====================================================
          NOT SERVICEABLE
      ===================================================== */}

      {!locationLoading &&
        !locationError &&
        !serviceable && (
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
            <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12">
              <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-emerald-100/70 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-orange-100/60 blur-3xl" />

              <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                  }}
                  className="absolute h-40 w-40 rounded-full border-2 border-emerald-200"
                />

                <motion.div
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 1.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50"
                >
                  <Store
                    size={34}
                    className="text-emerald-600"
                  />
                </motion.div>
              </div>

              <h2 className="relative z-10 mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                We&apos;re not in your area yet
              </h2>

              <p className="relative z-10 mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                We currently don&apos;t have delivery partners
                within{" "}
                <span className="font-bold text-slate-700">
                  {serviceRadius} km
                </span>{" "}
                of your location.
              </p>

              <p className="relative z-10 mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-400">
                We&apos;re expanding our network and hope to reach
                your area soon.
              </p>

              <div className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                <Navigation size={14} />
                Current delivery radius: {serviceRadius} km
              </div>

              <button
                type="button"
                onClick={loadNearbyStores}
                className="
                  relative
                  z-10
                  mt-7
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-5
                  py-3.5
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  active:scale-[0.98]
                "
              >
                <RefreshCw size={17} />
                Check Again
              </button>
            </div>
          </motion.div>
        )}

      {/* =====================================================
          STORES
      ===================================================== */}

      {!locationLoading &&
        !locationError &&
        serviceable && (
          <>
            {/* =================================================
                CATEGORY CHIPS
            ================================================= */}

            <div className="mx-auto mt-5 max-w-[1600px] px-3 sm:mt-7 sm:px-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setSelectedCategory(category)
                    }
                    className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold capitalize transition-all sm:px-5 sm:text-sm ${selectedCategory === category
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================
                STORE CONTENT
            ================================================= */}

            <div className="mx-auto max-w-[1600px] px-3 py-7 sm:px-6 sm:py-10">
              {/* Toolbar */}

              <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
                    Available nearby
                  </p>

                  <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-2xl">
                    {filteredStores.length}{" "}
                    {filteredStores.length === 1
                      ? "Shop"
                      : "Shops"}{" "}
                    Found
                  </h2>
                </div>

                {customerLocation && (
                  <div className="hidden max-w-[240px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-medium text-slate-500 shadow-sm sm:flex">
                    <MapPin
                      size={13}
                      className="shrink-0 text-emerald-600"
                    />

                    <span className="truncate">
                      {customerLocation.label ||
                        "Delivery location"}
                    </span>
                  </div>
                )}
              </div>

              {/* =================================================
                  NO RESULTS
              ================================================= */}

              {filteredStores.length === 0 ? (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-5 text-center shadow-sm"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <Search
                      size={27}
                      className="text-slate-400"
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900">
                    No matching shops
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    There are nearby shops available, but none
                    match your current search or category.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSelectedCategory("All");
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Clear filters
                    <ArrowRight size={15} />
                  </button>
                </motion.div>
              ) : (
                /* =================================================
                   STORE GRID
                ================================================= */

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
                      className="
                        group
                        relative
                        min-w-0
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-3
                        shadow-sm
                        transition
                        duration-300
                        hover:-translate-y-1
                        hover:border-emerald-200
                        hover:shadow-lg
                        hover:shadow-slate-200/60
                        sm:rounded-3xl
                        sm:p-5
                      "
                    >
                      <Link
                        href={`/shop/${store.username}`}
                        className="block"
                      >
                        <div className="flex flex-col items-center text-center">
                          {/* Store logo */}

                          <div className="relative mb-3 sm:mb-4">
                            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm sm:h-20 sm:w-20">
                              <img
                                src={
                                  store.logo ||
                                  "/store.png"
                                }
                                alt={store.name}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            </div>

                            {/* Status dot */}

                            <span
                              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white ${store.isActive
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                                }`}
                            />
                          </div>

                          {/* Store name */}

                          <h2 className="line-clamp-1 w-full text-sm font-black text-slate-900 sm:text-lg">
                            {store.name}
                          </h2>

                          {/* Category */}

                          <p className="mt-1 line-clamp-1 w-full text-[10px] font-medium text-slate-400 sm:text-xs">
                            {store.category ||
                              "Local Store"}
                          </p>

                          {/* Distance */}

                          {store.distanceKm != null && (
                            <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700 sm:px-3 sm:text-[11px]">
                              <MapPin size={11} />

                              <span className="truncate">
                                {formatDistance(
                                  store.distanceKm,
                                )}
                              </span>
                            </div>
                          )}

                          {/* Open status */}

                          <div
                            className={`mt-3 inline-flex items-center gap-1.5 text-[9px] font-bold sm:text-[11px] ${store.isActive
                                ? "text-emerald-600"
                                : "text-slate-400"
                              }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${store.isActive
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                                }`}
                            />

                            {store.isActive
                              ? "Open now"
                              : "Currently closed"}
                          </div>
                        </div>
                      </Link>

                      {/* Follow */}

                      <div className="mt-4 border-t border-slate-100 pt-3 sm:mt-5 sm:pt-4">
                        <FollowStoreButton
                          store={store}
                          variant="card"
                        />
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
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
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