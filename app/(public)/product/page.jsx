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
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import SearchDropdown from "@/components/SearchDropdown";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* ✅ PRICE RANGES */
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

  const [products, setProducts] = useState([]);

  const [productsLoading, setProductsLoading] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [nextCursor, setNextCursor] = useState(null);

  const [hasMore, setHasMore] = useState(false);

  const [productsError, setProductsError] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);

  const [loadingSearch, setLoadingSearch] = useState(false);

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

  const searchProducts = (text) => {
    const cleanText = text.trim();

    if (!cleanText) return;

    setSearchInput(cleanText);
    setShowDropdown(false);

    router.push(`/product?search=${encodeURIComponent(cleanText)}`);
  };

  const fetchProducts = async ({ cursor = null, append = false } = {}) => {
    if (locationLoading || locationError || !serviceable) {
      return;
    }

    const storeIds = Array.from(nearbyStoreIds || []);

    if (storeIds.length === 0) {
      setProducts([]);
      setNextCursor(null);
      setHasMore(false);

      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setProductsLoading(true);
      }

      setProductsError("");

      const params = {
        limit: 12,

        storeIds: storeIds.join(","),

        category,

        subCategory,

        priceRange,

        sort,
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const { data } = await axios.get("/api/product", {
        params,
      });

      const incomingProducts = Array.isArray(data.products)
        ? data.products
        : [];

      if (append) {
        setProducts((current) => {
          /*
           * Avoid duplicate products in case
           * pagination changes while loading.
           */
          const existingIds = new Set(current.map((product) => product.id));

          const unique = incomingProducts.filter(
            (product) => !existingIds.has(product.id),
          );

          return [...current, ...unique];
        });
      } else {
        setProducts(incomingProducts);
      }

      setNextCursor(data.pagination?.nextCursor || null);

      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);

      setProductsError(
        error?.response?.data?.error || "Unable to load products.",
      );
    } finally {
      setProductsLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (searchFromURL) {
      return;
    }

    if (locationLoading || locationError || !serviceable) {
      return;
    }

    setNextCursor(null);
    setHasMore(false);

    fetchProducts({
      append: false,
    });
  }, [
    nearbyStoreIds,
    serviceable,
    locationLoading,
    locationError,
    category,
    subCategory,
    priceRange,
    sort,
    searchFromURL,
  ]);

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

  // Sync category from URL
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

  // Debounced Search
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

  /* ✅ DYNAMIC CATEGORIES */
  const allCategories = useMemo(() => {
    const productCategories = products
      .map((p) => p.category?.trim())
      .filter(Boolean);

    const uniqueCategories = Array.from(new Set(productCategories));
    return ["all", ...uniqueCategories];
  }, [products]);

  /* ✅ DYNAMIC SUB-CATEGORIES (Contextual & Robust) */
  const availableSubCategories = useMemo(() => {
    if (category === "all") return [];

    const subCats = products
      // Make sure spaces and casing don't break the match
      .filter(
        (p) =>
          p.category?.trim().toLowerCase() === category.trim().toLowerCase(),
      )
      .map((p) => p.subCategory?.trim())
      .filter(Boolean); // This removes null, undefined, or empty strings

    const uniqueSubCats = Array.from(new Set(subCats));
    return uniqueSubCats.length > 0 ? ["all", ...uniqueSubCats] : [];
  }, [products, category]);

  const getAIScore = (product) => {
    return (
      product.totalSales * 5 +
      product.averageRating * 25 +
      product.totalViews * 0.2
    );
  };

  /* 🔥 FILTER + SORT */

  const filteredProducts = useMemo(() => {
    if (searchFromURL) {
      return smartProducts
        .filter((product) => {
          if (category === "all") {
            return true;
          }

          return (
            product.category?.trim().toLowerCase() ===
            category.trim().toLowerCase()
          );
        })
        .filter((product) => {
          if (subCategory === "all") {
            return true;
          }

          return (
            product.subCategory?.trim().toLowerCase() ===
            subCategory.trim().toLowerCase()
          );
        });
    }

    return products;
  }, [searchFromURL, smartProducts, products, category, subCategory]);

  // Custom handler for Category selection
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);

    setSubCategory("all");

    setSearchInput("");

    setSmartProducts([]);
  };
  return (
    <section className="min-h-screen bg-slate-950 text-slate-200">
      {/* ================= HEADER ================= */}
      <div className="relative pt-32 pb-16 flex flex-col items-center justify-center border-b border-slate-800/60 bg-slate-900/20">
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white"
          >
            THE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              COLLECTION
            </span>
          </motion.h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">
            Discover Premium Products
          </p>
        </div>
      </div>

      {locationLoading && (
        <div className="flex min-h-[55vh] flex-col items-center justify-center px-5 text-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute h-28 w-28 rounded-full border border-indigo-400/30"
            />

            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.1, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
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
              }}
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-indigo-500/10"
            >
              <LocateFixed size={29} className="text-indigo-400" />
            </motion.div>
          </div>

          <h2 className="mt-2 text-xl font-black text-white">
            Finding products near you
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            We&apos;re checking nearby stores so you only see products that can
            actually be delivered to your location.
          </p>
        </div>
      )}

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
          <div className="w-full rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10">
              <MapPin size={34} className="text-amber-400" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-white">
              Location access needed
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              {locationError}
            </p>

            <button
              type="button"
              onClick={loadNearbyStores}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3.5 text-sm font-black text-white transition hover:bg-indigo-400 active:scale-[0.98]"
            >
              <LocateFixed size={18} />
              Try Again
            </button>
          </div>
        </motion.div>
      )}

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
          <div className="relative w-full overflow-hidden rounded-[2.2rem] border border-slate-800 bg-slate-900/60 px-5 py-9 text-center shadow-2xl sm:px-8 sm:py-12">
            <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

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
                className="absolute h-44 w-44 rounded-full border border-indigo-400/20"
              />

              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-white/10 bg-indigo-500/10"
              >
                <Store size={34} className="text-indigo-400" />
              </motion.div>
            </div>

            <h2 className="relative z-10 mt-2 text-2xl font-black text-white sm:text-3xl">
              Products aren&apos;t available here yet
            </h2>

            <p className="relative z-10 mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              We currently don&apos;t have any partner stores within{" "}
              {serviceRadius} km that can deliver products to your location.
            </p>

            <p className="relative z-10 mt-2 text-xs text-slate-500">
              We&apos;re expanding our delivery network and hope to reach you
              soon.
            </p>

            <div className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-300">
              <Navigation size={14} />
              Delivery radius: {serviceRadius} km
            </div>

            <button
              type="button"
              onClick={loadNearbyStores}
              className="relative z-10 mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              <RefreshCw size={17} />
              Check Again
            </button>
          </div>
        </motion.div>
      )}

      {/* ================= SEARCH BAR (STICKY) ================= */}
      {!locationLoading && !locationError && serviceable && (
        <>
          <div className="sticky top-[70px] md:top-[80px] z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (dropdownData.products.length) setShowDropdown(true);
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
                  className="
            w-full
            pl-11
            pr-5
            py-3.5
            rounded-full
            bg-slate-900
            border
            border-slate-800
            text-white
            placeholder:text-slate-500
            outline-none
            focus:border-indigo-500
            transition
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

          {/* ================= MAIN CONTENT ================= */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* ================= DESKTOP SIDEBAR ================= */}
              <aside className="hidden lg:block w-64 shrink-0 space-y-10 sticky top-40 h-fit">
                {/* CATEGORIES */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-5">
                    Categories
                  </h3>
                  <div className="flex flex-col gap-1.5 border-l border-slate-800 pl-4">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`text-left text-sm py-1.5 transition-all duration-200 capitalize ${
                          category === cat
                            ? "text-indigo-400 font-bold -translate-x-1"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SUB-CATEGORIES (Contextual) */}
                <AnimatePresence>
                  {availableSubCategories.length > 0 && (
                    <motion.div
                      key="subcategories-desktop" // ✅ CRITICAL: Required for Framer Motion to work
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-5">
                        Subcategories
                      </h3>
                      <div className="flex flex-col gap-1.5 border-l border-indigo-500/30 pl-4 ml-2">
                        {availableSubCategories.map((subCat) => (
                          <button
                            key={subCat}
                            onClick={() => setSubCategory(subCat)}
                            className={`text-left text-sm py-1 transition-all duration-200 capitalize flex items-center gap-2 ${
                              subCategory === subCat
                                ? "text-indigo-400 font-bold -translate-x-1"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {subCategory === subCat && (
                              <ChevronRight
                                size={14}
                                className="text-indigo-400"
                              />
                            )}
                            {subCat === "all" ? `All ${category}` : subCat}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* PRICE RANGE */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-5">
                    Price Range
                  </h3>
                  <div className="flex flex-col gap-1.5 border-l border-slate-800 pl-4">
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setPriceRange(range.value)}
                        className={`text-left text-sm py-1.5 transition-all duration-200 ${
                          priceRange === range.value
                            ? "text-indigo-400 font-bold -translate-x-1"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* ================= PRODUCT GRID ================= */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-800/80">
                  <p className="text-sm font-medium text-slate-400">
                    Showing{" "}
                    <span className="text-white font-bold">
                      {filteredProducts.length}
                    </span>{" "}
                    Products
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="appearance-none bg-slate-900 border border-slate-800 text-sm font-semibold text-white px-4 py-2 pr-8 rounded-lg outline-none focus:border-indigo-500 cursor-pointer transition-colors"
                      >
                        <option value="">Sort By: Default</option>
                        <option value="low-high">Price: Low to High</option>
                        <option value="high-low">Price: High to Low</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>

                    <button
                      onClick={() => setShowMobileFilter(true)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <SlidersHorizontal size={16} />
                      Filters
                    </button>
                  </div>
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      layout
                      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                    >
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          storeIsActive={product.store?.isActive === true}
                        />
                      ))}
                    </motion.div>

                    {!searchFromURL && hasMore && (
                      <div className="mt-10 flex justify-center">
                        <button
                          type="button"
                          disabled={loadingMore}
                          onClick={() =>
                            fetchProducts({
                              cursor: nextCursor,
                              append: true,
                            })
                          }
                          className="
        flex
        min-w-[170px]
        items-center
        justify-center
        gap-2
        rounded-2xl
        border
        border-indigo-500/30
        bg-indigo-500/10
        px-6
        py-3.5
        text-sm
        font-bold
        text-indigo-300
        transition
        hover:border-indigo-400/50
        hover:bg-indigo-500/20
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
                        >
                          {loadingMore ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              Load More
                              <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search size={48} className="text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      No products found
                    </h3>
                    <p className="text-slate-400">
                      Try adjusting your filters or search query.
                    </p>
                    <button
                      onClick={() => {
                        router.push("/product");

                        handleCategoryChange("all");

                        setPriceRange("ALL");

                        setSearchInput("");

                        setSmartProducts([]);
                      }}
                      className="mt-6 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= MOBILE FILTER MODAL ================= */}
          <AnimatePresence>
            {showMobileFilter && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilter(false)}
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] lg:hidden"
                />

                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 z-[101] rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto lg:hidden shadow-2xl"
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">
                      Filters & Sorting
                    </h2>
                    <button
                      onClick={() => setShowMobileFilter(false)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-300"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* CATEGORIES */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                        Categories
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {allCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition border ${
                              category === cat
                                ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SUBCATEGORIES (Mobile Contextual) */}
                    <AnimatePresence>
                      {availableSubCategories.length > 0 && (
                        <motion.div
                          key="subcategories-mobile" // ✅ CRITICAL: Required for Framer Motion to work
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 mb-4">
                            Subcategories
                          </h3>
                          <div className="flex flex-wrap gap-2.5 bg-slate-950 p-4 rounded-2xl border border-indigo-500/20">
                            {availableSubCategories.map((subCat) => (
                              <button
                                key={subCat}
                                onClick={() => {
                                  setSubCategory(subCat);
                                  setShowMobileFilter(false);
                                }}
                                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition border ${
                                  subCategory === subCat
                                    ? "bg-indigo-500 text-white border-indigo-400"
                                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                                }`}
                              >
                                {subCat === "all" ? `All ${category}` : subCat}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* PRICE RANGE */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                        Price Range
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {PRICE_RANGES.map((range) => (
                          <button
                            key={range.value}
                            onClick={() => {
                              setPriceRange(range.value);
                              setShowMobileFilter(false);
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition border ${
                              priceRange === range.value
                                ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
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
        <div className="h-screen flex items-center justify-center bg-slate-950 text-indigo-400 font-semibold tracking-widest uppercase text-sm">
          Loading Collection...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
