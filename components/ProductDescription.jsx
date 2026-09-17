"use client";

import { StarIcon, Share2, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState("Description");
  const [filterStar, setFilterStar] = useState(null);

  const ratings = useMemo(() => product?.rating ?? [], [product]);

  const ratingSummary = useMemo(() => {
    const total = ratings.length;

    const counts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let sum = 0;

    ratings.forEach((rating) => {
      const value = Number(rating.rating);

      if (counts[value] !== undefined) {
        counts[value]++;
        sum += value;
      }
    });

    return {
      avg: total ? (sum / total).toFixed(1) : "0.0",
      counts,
      total,
    };
  }, [ratings]);

  const filteredReviews = useMemo(() => {
    if (!filterStar) return ratings;

    return ratings.filter(
      (rating) => Number(rating.rating) === filterStar
    );
  }, [filterStar, ratings]);

  const handleShare = async () => {
    try {
      const productImage = product?.images?.[0];

      if (!productImage) {
        // No product image — fall back to normal link sharing
        if (navigator.share) {
          await navigator.share({
            title: product.name,
            text: `Check out ${product.name}`,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          toast.success("Product link copied!");
        }

        return;
      }

      // Fetch the actual product image
      const response = await fetch(productImage);

      if (!response.ok) {
        throw new Error("Failed to fetch product image");
      }

      const blob = await response.blob();

      // Determine a suitable extension
      const extension =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";

      const file = new File(
        [blob],
        `${product.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.${extension}`,
        {
          type: blob.type || "image/jpeg",
        }
      );

      // Share image + product information
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: product.name,
          text: `🛍️ Check out ${product.name}\n\n💰 Price: ₹${product.price}\n\nShop it on Nandurbar Bazar:`,
          url: window.location.href,
          files: [file],
        });
      } else if (navigator.share) {
        // Browser supports sharing but not files
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied!");
      }
    } catch (error) {
      // User cancelled the share dialog
      if (error?.name !== "AbortError") {
        console.error("Share failed:", error);
        toast.error("Unable to share product");
      }
    }
  };
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* -------------------------------------------------
          TOP NAVIGATION
      ------------------------------------------------- */}
      <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-0 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-7">
          {["Description", "Reviews"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setSelectedTab(tab);

                if (tab === "Description") {
                  setFilterStar(null);
                }
              }}
              className={`relative pb-4 text-sm font-bold transition-colors sm:text-base ${selectedTab === tab
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-700"
                }`}
            >
              {tab}

              {tab === "Reviews" && ratings.length > 0 && (
                <span className="ml-1.5 text-xs font-semibold text-slate-400">
                  ({ratings.length})
                </span>
              )}

              {selectedTab === tab && (
                <motion.span
                  layoutId="product-description-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-orange-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="mb-3 flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:mb-2"
        >
          <Share2 size={17} />

          <span>Share Product</span>
        </button>
      </div>

      {/* -------------------------------------------------
          CONTENT
      ------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {selectedTab === "Description" ? (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                Product Information
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                About this product
              </h2>
            </div>

            <div className="h-px bg-slate-100" />

            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
              {product.description || "No product description available."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* -------------------------------------------------
                RATING SUMMARY
            ------------------------------------------------- */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="grid gap-8 md:grid-cols-[190px_1fr]">
                {/* Average */}
                <div className="flex flex-col justify-center border-b border-slate-100 pb-6 text-center md:border-b-0 md:border-r md:pb-0 md:pr-8">
                  <div className="text-5xl font-black tracking-tight text-slate-900">
                    {ratingSummary.avg}
                  </div>

                  <div className="mt-3 flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        size={17}
                        className={
                          star <= Math.round(Number(ratingSummary.avg))
                            ? "fill-orange-400 text-orange-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    {ratingSummary.total === 1
                      ? "1 customer rating"
                      : `${ratingSummary.total} customer ratings`}
                  </p>
                </div>

                {/* Rating breakdown */}
                <div className="flex flex-col justify-center gap-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingSummary.counts[star];

                    const percentage =
                      ratingSummary.total > 0
                        ? (count / ratingSummary.total) * 100
                        : 0;

                    const isSelected = filterStar === star;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFilterStar(isSelected ? null : star)
                        }
                        className={`group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition ${isSelected
                          ? "bg-orange-50"
                          : "hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex w-10 items-center gap-1">
                          <span
                            className={`text-xs font-bold ${isSelected
                              ? "text-orange-600"
                              : "text-slate-600"
                              }`}
                          >
                            {star}
                          </span>

                          <StarIcon
                            size={13}
                            className={
                              isSelected
                                ? "fill-orange-400 text-orange-400"
                                : "fill-slate-300 text-slate-300"
                            }
                          />
                        </div>

                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{
                              duration: 0.6,
                              ease: "easeOut",
                            }}
                            className="h-full rounded-full bg-orange-400"
                          />
                        </div>

                        <span className="w-7 text-right text-xs font-semibold text-slate-500">
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  {filterStar && (
                    <button
                      type="button"
                      onClick={() => setFilterStar(null)}
                      className="mt-1 text-left text-xs font-bold text-orange-600 hover:text-orange-700"
                    >
                      Clear rating filter
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* -------------------------------------------------
                REVIEW HEADER
            ------------------------------------------------- */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Customer Reviews
                </h3>

                {filterStar ? (
                  <p className="mt-1 text-xs text-slate-400">
                    Showing {filterStar}-star reviews
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">
                    What customers are saying
                  </p>
                )}
              </div>

              {filterStar && (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                  {filteredReviews.length}{" "}
                  {filteredReviews.length === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            {/* -------------------------------------------------
                REVIEW LIST
            ------------------------------------------------- */}
            {filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {item.user?.image ? (
                          <img
                            src={item.user.image}
                            alt={item.user?.name || "Customer"}
                            className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-sm font-black text-orange-600">
                            {item.user?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Name + date */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {item.user?.name || "Customer"}
                            </h4>

                            {/* Stars */}
                            <div className="mt-1 flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                  key={star}
                                  size={13}
                                  className={
                                    star <= Number(item.rating)
                                      ? "fill-orange-400 text-orange-400"
                                      : "text-slate-200"
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <span className="text-xs font-medium text-slate-400">
                            {new Date(
                              item.createdAt
                            ).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Review */}
                        {item.review && (
                          <p className="mt-4 text-sm leading-6 text-slate-600">
                            {item.review}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                  <StarIcon
                    size={22}
                    className="text-orange-400"
                  />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900">
                  No reviews found
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {filterStar
                    ? `There are no ${filterStar}-star reviews yet.`
                    : "Be the first customer to review this product."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------
          STORE CARD
      ------------------------------------------------- */}
      {product.store && (
        <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              {/* Store logo */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                {product.store.logo ? (
                  <Image
                    src={product.store.logo}
                    alt={product.store.name || "Store"}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-black text-orange-500">
                    {product.store.name?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sold by
                </p>

                <h3 className="mt-0.5 text-base font-black text-slate-900">
                  {product.store.name}
                </h3>

                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <Check size={13} strokeWidth={3} />
                  Local store
                </div>
              </div>
            </div>

            <Link
              href={`/shop/${product.store.username}`}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-orange-500"
            >
              Visit Store
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDescription;