"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import {
  SlidersHorizontal,
  X,
  Search,
  ChevronRight,
  MapPin,
  LocateFixed,
  Store,
  RefreshCw,
  Navigation,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import SearchDropdown from "@/components/SearchDropdown";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* ================= PRICE RANGES ================= */

const PRICE_RANGES = [
  { label: "All Prices", value: "ALL" },
  { label: "Less than ₹500", value: "UNDER_500" },
  { label: "₹500 – ₹5,000", value: "500_5K" },
  { label: "₹5,000 – ₹10,000", value: "5K_10K" },
  { label: "Above ₹10,000", value: "ABOVE_10K" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryFromURL = searchParams.get("category");
  const searchFromURL = searchParams.get("search");

  const router = useRouter();

  const [dropdownData, setDropdownData] = useState({
    products: [],
    categories: [],
    stores: [],
    suggestions: [],
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const allProducts = useSelector((state) => state.product.list || []);

  const {
    nearbyStoreIds,
    locationLoading,
    locationError,
    serviceable,
    serviceRadius,
    loadNearbyStores,
    filterNearbyProducts,
  } = useCustomerLocation();

  const [category, setCategory] = useState(categoryFromURL || "all");
  const [subCategory, setSubCategory] = useState("all");
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState("ALL");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [smartProducts, setSmartProducts] = useState([]);

  /* ================= NEARBY PRODUCTS ================= */

  const products = useMemo(() => {
    if (locationLoading || locationError || !serviceable) {
      return [];
    }

    return filterNearbyProducts(allProducts);
  }, [
    allProducts,
    filterNearbyProducts,
    locationLoading,
    locationError,
    serviceable,
  ]);

  /* ================= SEARCH ================= */

  const searchProducts = (text) => {
    const cleanText = text.trim();

    if (!cleanText) return;

    setSearchInput(cleanText);
    setShowDropdown(false);

    router.push(`/product?search=${encodeURIComponent(cleanText)}`);
  };

  const filterCategory = (cat) => {
    setShowDropdown(false);
    setSearchInput("");
    setSmartProducts([]);

    handleCategoryChange(cat);

    router.replace(`/product?category=${encodeURIComponent(cat)}`);
  };

  const openStore = (username) => {
    setShowDropdown(false);
    router.push(`/shop/${username}`);
  };

  /* ================= URL SYNC ================= */

  useEffect(() => {
    if (categoryFromURL) {
      setCategory(categoryFromURL);
      setSubCategory("all");
      setSearchInput("");
      setSmartProducts([]);
    } else {
      setCategory("all");
    }
  }, [categoryFromURL]);

  /* ================= DEBOUNCED SEARCH ================= */

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (
        locationLoading ||
        locationError ||
        !serviceable ||
        !searchInput.trim()
      ) {
        setShowDropdown(false);

        setDropdownData({
          products: [],
          stores: [],
          categories: [],
          suggestions: [],
        });

        return;
      }

      try {
        setLoadingSearch(true);

        const { data } = await axios.get("/api/search/suggestions", {
          params: {
            q: searchInput,
          },
        });

        const nearbyProducts = (data.products || []).filter((product) =>
          nearbyStoreIds.has(product.storeId || product.store?.id),
        );

        const nearbyDropdownStores = (data.stores || []).filter((store) =>
          nearbyStoreIds.has(store.id),
        );

        const nearbyCategories = [
          ...new Set(
            nearbyProducts.map((product) => product.category).filter(Boolean),
          ),
        ];

        const nearbySuggestions = [
          ...new Set([
            searchInput,
            ...nearbyProducts.map((product) => product.name),
            ...nearbyCategories,
            ...nearbyProducts
              .map((product) => product.subCategory)
              .filter(Boolean),
          ]),
        ].slice(0, 8);

        setDropdownData({
          products: nearbyProducts,
          stores: nearbyDropdownStores,
          categories: nearbyCategories,
          suggestions: nearbySuggestions,
        });

        setShowDropdown(true);
      } catch (error) {
        console.error("Search suggestions failed:", error);
        setShowDropdown(false);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [
    searchInput,
    nearbyStoreIds,
    serviceable,
    locationLoading,
    locationError,
  ]);

  /* ================= SMART SEARCH ================= */

  useEffect(() => {
    if (!searchFromURL) {
      setSmartProducts([]);
      return;
    }

    if (locationLoading || locationError || !serviceable) {
      return;
    }

    setSearchInput(searchFromURL);

    setCategory("all");
    setSubCategory("all");

    const fetchProducts = async () => {
      try {
        const { data } = await axios.post("/api/search/smart", {
          query: searchFromURL,
        });

        const searchedProducts = Array.isArray(data.products)
          ? data.products
          : [];

        const nearbySearchProducts = searchedProducts.filter((product) =>
          nearbyStoreIds.has(product.storeId || product.store?.id),
        );

        setSmartProducts(nearbySearchProducts);
      } catch (error) {
        console.error("Smart search failed:", error);
        setSmartProducts([]);
      }
    };

    fetchProducts();
  }, [
    searchFromURL,
    nearbyStoreIds,
    locationLoading,
    locationError,
    serviceable,
  ]);

  /* ================= CATEGORIES ================= */

  const allCategories = useMemo(() => {
    const productCategories = products
      .map((p) => p.category?.trim())
      .filter(Boolean);

    const uniqueCategories = Array.from(new Set(productCategories));

    return ["all", ...uniqueCategories];
  }, [products]);

  /* ================= SUB CATEGORIES ================= */

  const availableSubCategories = useMemo(() => {
    if (category === "all") return [];

    const subCats = products
      .filter(
        (p) =>
          p.category?.trim().toLowerCase() === category.trim().toLowerCase(),
      )
      .map((p) => p.subCategory?.trim())
      .filter(Boolean);

    const uniqueSubCats = Array.from(new Set(subCats));

    return uniqueSubCats.length > 0 ? ["all", ...uniqueSubCats] : [];
  }, [products, category]);

  /* ================= AI SCORE ================= */

  const getAIScore = (product) => {
    return (
      product.totalSales * 5 +
      product.averageRating * 25 +
      product.totalViews * 0.2
    );
  };

  /* ================= FILTER + SORT ================= */

  const sourceProducts = searchFromURL ? smartProducts : products;

  const filteredProducts = useMemo(() => {
    return sourceProducts
      .filter((p) =>
        category === "all"
          ? true
          : p.category?.trim().toLowerCase() === category.trim().toLowerCase(),
      )
      .filter((p) =>
        subCategory === "all"
          ? true
          : p.subCategory?.trim().toLowerCase() ===
          subCategory.trim().toLowerCase(),
      )
      .filter((p) => {
        const price = Number(p.price) || 0;

        switch (priceRange) {
          case "UNDER_500":
            return price < 500;

          case "500_5K":
            return price >= 500 && price <= 5000;

          case "5K_10K":
            return price > 5000 && price <= 10000;

          case "ABOVE_10K":
            return price > 10000;

          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;

        if (sort === "low-high") return a.price - b.price;

        if (sort === "high-low") return b.price - a.price;

        return getAIScore(b) - getAIScore(a);
      });
  }, [sourceProducts, category, subCategory, priceRange, sort]);

  /* ================= CATEGORY HANDLER ================= */

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setSubCategory("all");
    setSearchInput("");
    setSmartProducts([]);
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="relative overflow-hidden border-b border-slate-200 bg-white">
        {/* Decorative shapes */}

        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:px-8 lg:pt-36">
          <div className="flex flex-col items-center text-center">
            {/* Small badge */}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"
            >
              <ShoppingBag size={14} />
              Shop local. Shop smart.
            </motion.div>

            {/* Heading */}

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
            >
              Find what you need,
              <span className="block text-emerald-600">
                right around you.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base"
            >
              Discover products from nearby stores and get the best picks
              available for your delivery location.
            </motion.p>

            {/* Location indicator */}

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                <MapPin size={13} className="text-emerald-600" />
              </span>

              Products available within {serviceRadius} km
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOCATION LOADING
      ===================================================== */}

      {locationLoading && (
        <div className="flex min-h-[55vh] flex-col items-center justify-center bg-slate-50 px-5 text-center">
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
              }}
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200"
            >
              <LocateFixed size={25} className="text-white" />
            </motion.div>
          </div>

          <h2 className="mt-2 text-xl font-black text-slate-900">
            Finding products near you
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            We&apos;re checking nearby stores so you only see products that can
            actually be delivered to your location.
          </p>
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
              <MapPin size={34} className="text-amber-600" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              Location access needed
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              {locationError}
            </p>

            <button
              type="button"
              onClick={loadNearbyStores}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              <LocateFixed size={18} />
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* =====================================================
          NOT SERVICEABLE
      ===================================================== */}

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
          <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12">
            <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-orange-100/50 blur-3xl" />

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
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50"
              >
                <Store size={34} className="text-emerald-600" />
              </motion.div>
            </div>

            <h2 className="relative z-10 mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              We&apos;re not here yet
            </h2>

            <p className="relative z-10 mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              We currently don&apos;t have partner stores within{" "}
              <span className="font-bold text-slate-700">
                {serviceRadius} km
              </span>{" "}
              that can deliver to your location.
            </p>

            <p className="relative z-10 mt-2 text-xs text-slate-400">
              We&apos;re expanding our delivery network and hope to reach you
              soon.
            </p>

            <div className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
              <Navigation size={14} />
              Delivery radius: {serviceRadius} km
            </div>

            <button
              type="button"
              onClick={loadNearbyStores}
              className="relative z-10 mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCw size={17} />
              Check Again
            </button>
          </div>
        </motion.div>
      )}

      {/* =====================================================
          MAIN SHOP
      ===================================================== */}

      {!locationLoading && !locationError && serviceable && (
        <>
          {/* ================= SEARCH ================= */}

          <div className="sticky top-[70px] md:top-[80px] z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto max-w-5xl px-4 py-3 sm:py-4">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (dropdownData.products.length) {
                      setShowDropdown(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;

                    e.preventDefault();

                    const cleanSearch = searchInput.trim();

                    if (!cleanSearch) return;

                    setShowDropdown(false);

                    router.push(
                      `/product?search=${encodeURIComponent(cleanSearch)}`,
                    );
                  }}
                  placeholder="Search products, categories or stores..."
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
                    placeholder:text-slate-400
                    outline-none
                    transition
                    focus:border-emerald-400
                    focus:bg-white
                    focus:ring-4
                    focus:ring-emerald-50
                    sm:rounded-full
                  "
                />

                {showDropdown && (
                  <SearchDropdown
                    loading={loadingSearch}
                    results={dropdownData}
                    onClose={() => setShowDropdown(false)}
                    onProductClick={searchProducts}
                    onCategoryClick={filterCategory}
                    onStoreClick={openStore}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ================= CONTENT ================= */}

          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
              {/* ================= DESKTOP SIDEBAR ================= */}

              <aside className="hidden w-60 shrink-0 lg:block">
                <div className="sticky top-36 space-y-8">
                  {/* CATEGORY */}

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900">
                        Categories
                      </h3>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                        {allCategories.length - 1}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {allCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm capitalize transition ${category === cat
                              ? "bg-emerald-50 font-bold text-emerald-700"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                        >
                          <span>{cat === "all" ? "All Products" : cat}</span>

                          {category === cat && (
                            <ChevronRight
                              size={15}
                              className="text-emerald-600"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SUB CATEGORIES */}

                  <AnimatePresence>
                    {availableSubCategories.length > 0 && (
                      <motion.div
                        key="subcategories-desktop"
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-200 pt-7">
                          <h3 className="mb-4 text-sm font-black text-slate-900">
                            {category} options
                          </h3>

                          <div className="space-y-1">
                            {availableSubCategories.map((subCat) => (
                              <button
                                key={subCat}
                                onClick={() => setSubCategory(subCat)}
                                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs capitalize transition ${subCategory === subCat
                                    ? "bg-indigo-50 font-bold text-indigo-600"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                              >
                                {subCategory === subCat && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                )}

                                {subCat === "all"
                                  ? `All ${category}`
                                  : subCat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PRICE */}

                  <div className="border-t border-slate-200 pt-7">
                    <h3 className="mb-4 text-sm font-black text-slate-900">
                      Price Range
                    </h3>

                    <div className="space-y-1">
                      {PRICE_RANGES.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setPriceRange(range.value)}
                          className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${priceRange === range.value
                              ? "bg-orange-50 text-orange-700"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* ================= PRODUCTS ================= */}

              <div className="min-w-0 flex-1">
                {/* TOOLBAR */}

                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {searchFromURL
                        ? `Results for "${searchFromURL}"`
                        : category === "all"
                          ? "Explore Products"
                          : category}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Showing{" "}
                      <span className="font-bold text-slate-600">
                        {filteredProducts.length}
                      </span>{" "}
                      products near you
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* SORT */}

                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="
                          appearance-none
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3
                          py-2.5
                          pr-8
                          text-xs
                          font-bold
                          text-slate-700
                          outline-none
                          transition
                          hover:border-slate-300
                          focus:border-emerald-400
                          focus:ring-4
                          focus:ring-emerald-50
                        "
                      >
                        <option value="">Recommended</option>
                        <option value="low-high">
                          Price: Low to High
                        </option>
                        <option value="high-low">
                          Price: High to Low
                        </option>
                      </select>

                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                        ▼
                      </div>
                    </div>

                    {/* MOBILE FILTER */}

                    <button
                      onClick={() => setShowMobileFilter(true)}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2.5
                        text-xs
                        font-bold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                        lg:hidden
                      "
                    >
                      <SlidersHorizontal size={15} />
                      Filters
                    </button>
                  </div>
                </div>

                {/* PRODUCT GRID */}

                {filteredProducts.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      layout
                      className="
                        grid
                        grid-cols-2
                        gap-3
                        sm:grid-cols-2
                        sm:gap-4
                        md:grid-cols-3
                        lg:grid-cols-3
                        xl:grid-cols-4
                      "
                    >
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          storeIsActive={product.store?.isActive === true}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                      <Search size={28} className="text-slate-400" />
                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-900">
                      No products found
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Try adjusting your filters or search for something
                      different.
                    </p>

                    <button
                      onClick={() => {
                        router.push("/product");

                        handleCategoryChange("all");

                        setPriceRange("ALL");

                        setSearchInput("");

                        setSmartProducts([]);
                      }}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Clear all filters
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              MOBILE FILTER
          ================================================= */}

          <AnimatePresence>
            {showMobileFilter && (
              <>
                {/* BACKDROP */}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilter(false)}
                  className="fixed inset-0 z-[100] bg-slate-900/30 backdrop-blur-sm lg:hidden"
                />

                {/* SHEET */}

                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                  }}
                  className="
                    fixed
                    inset-x-0
                    bottom-0
                    z-[101]
                    max-h-[85vh]
                    overflow-y-auto
                    rounded-t-[2rem]
                    border-t
                    border-slate-200
                    bg-white
                    p-5
                    pb-10
                    shadow-2xl
                    lg:hidden
                  "
                >
                  {/* HEADER */}

                  <div className="mb-7 flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Filters & Sorting
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Refine your product search
                      </p>
                    </div>

                    <button
                      onClick={() => setShowMobileFilter(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* CATEGORIES */}

                    <div>
                      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
                        Categories
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {allCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`rounded-full border px-4 py-2.5 text-xs font-bold capitalize transition ${category === cat
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
                              }`}
                          >
                            {cat === "all" ? "All Products" : cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SUBCATEGORIES */}

                    <AnimatePresence>
                      {availableSubCategories.length > 0 && (
                        <motion.div
                          key="subcategories-mobile"
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          className="overflow-hidden"
                        >
                          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
                            Subcategories
                          </h3>

                          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3">
                            <div className="flex flex-wrap gap-2">
                              {availableSubCategories.map((subCat) => (
                                <button
                                  key={subCat}
                                  onClick={() => {
                                    setSubCategory(subCat);
                                    setShowMobileFilter(false);
                                  }}
                                  className={`rounded-full border px-4 py-2 text-xs font-bold capitalize transition ${subCategory === subCat
                                      ? "border-indigo-600 bg-indigo-600 text-white"
                                      : "border-indigo-100 bg-white text-indigo-600"
                                    }`}
                                >
                                  {subCat === "all"
                                    ? `All ${category}`
                                    : subCat}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* PRICE */}

                    <div>
                      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
                        Price Range
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {PRICE_RANGES.map((range) => (
                          <button
                            key={range.value}
                            onClick={() => {
                              setPriceRange(range.value);
                              setShowMobileFilter(false);
                            }}
                            className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${priceRange === range.value
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50"
                              }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 text-sm font-bold uppercase tracking-widest text-emerald-600">
          Loading Products...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}