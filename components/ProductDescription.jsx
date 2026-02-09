'use client'

import { ArrowRight, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = ['Description', 'Reviews'];

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState('Description');
  const [filterStar, setFilterStar] = useState(null);

  /* ✅ Rating Summary */
  const ratingSummary = useMemo(() => {
    const ratings = useMemo(() => product?.rating ?? [], [product]);
    const total = ratings.length;

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    ratings.forEach(r => {
      counts[r.rating]++;
      sum += r.rating;
    });

    return {
      avg: total ? (sum / total).toFixed(1) : 0,
      counts,
      total
    };
  }, [product.rating]);

  /* ✅ Filtered Reviews */
  const filteredReviews = useMemo(() => {
    if (!filterStar) return ratings;
    return ratings.filter(r => r.rating === filterStar);
  }, [filterStar, ratings]);

  return (
    <div className="my-12 px-4 sm:px-6 max-w-7xl mx-auto text-gray-900">

      {/* TABS */}
      <div className="flex gap-6 border-b border-gray-200 mb-10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`relative pb-3 text-sm font-semibold
              ${selectedTab === tab
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent'
                : 'text-gray-400 hover:text-gray-700'
              }
            `}
          >
            {tab}
            {selectedTab === tab && (
              <motion.span
                layoutId="active-underline"
                className="absolute left-0 -bottom-[2px] h-[3px] w-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* DESCRIPTION */}
        {selectedTab === "Description" && (
          <motion.div
            key="desc"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-3xl bg-white p-6 shadow-md border"
          >
            {product.description}
          </motion.div>
        )}

        {/* REVIEWS */}
        {selectedTab === "Reviews" && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="flex flex-col gap-6"
          >

            {/* ✅ REVIEW SUMMARY */}
            {ratingSummary.total > 0 && (
              <div className="rounded-3xl bg-white border p-6 shadow-sm">

                <div className="flex flex-col md:flex-row gap-6">

                  {/* LEFT */}
                  <div className="flex flex-col items-center md:items-start">
                    <p className="text-4xl font-bold">{ratingSummary.avg}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          size={18}
                          className={
                            Math.round(ratingSummary.avg) >= i + 1

                              ? "text-purple-500 fill-purple-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400">
                      {ratingSummary.total} ratings
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div
                        key={star}
                        onClick={() =>
                          setFilterStar(prev => (prev === star ? null : star))
                        }
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <span className="w-8 text-sm">{star}.0</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(ratingSummary.counts[star] / ratingSummary.total) * 100}%`
                            }}
                            transition={{ duration: 0.6 }}
                            className="h-full bg-purple-500"
                          />
                        </div>
                        <span className="w-20 text-xs text-gray-400">
                          {ratingSummary.counts[star]} reviews
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FILTER CHIPS */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <button
                    onClick={() => setFilterStar(null)}
                    className={`px-3 py-1 rounded-full text-sm border
                      ${filterStar === null ? 'bg-purple-500 text-white' : 'text-gray-500'}
                    `}
                  >
                    All
                  </button>

                  {[5, 4, 3, 2, 1].map(star => (
                    <button
                      key={star}
                      onClick={() => setFilterStar(star)}
                      className={`px-3 py-1 rounded-full text-sm border
                        ${filterStar === star ? 'bg-purple-500 text-white' : 'text-gray-500'}
                      `}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ REVIEWS LIST */}
            {filteredReviews.length === 0 && (
              <p className="text-center text-gray-400 italic py-6">
                No reviews found
              </p>
            )}

            {filteredReviews.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                className="flex gap-4 bg-white p-5 rounded-2xl border shadow-sm"
              >
                <div className="relative w-12 h-12">
                  <Image
                    src={item.user.image || "/default-avatar.png"}
                    alt={item.user.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        size={14}
                        className={
                          item.rating >= i + 1
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="ml-2 text-xs text-gray-400">
                      {new Date(item.createdAt).toDateString()}
                    </span>
                  </div>

                  <p className="text-gray-700">{item.review}</p>

                  {item.photos?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {item.photos.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                      ))}
                    </div>
                  )}

                  <p className="mt-2 font-medium">{item.user.name}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORE CARD (UNCHANGED) */}
      <div className="mt-14 flex items-center gap-4 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
        <Image
          src={product.store.logo}
          alt={product.store.name}
          width={56}
          height={56}
          className="rounded-full bg-white p-1"
        />
        <div>
          <p className="font-semibold">Product by {product.store.name}</p>
          <Link href={`/shop/${product.store.username}`} className="text-sm underline">
            Visit Store →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ProductDescription;
