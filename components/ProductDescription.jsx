'use client'

import { StarIcon, Share2, MessageCircle, Instagram, Link as LinkIcon, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState('Description');
  const [filterStar, setFilterStar] = useState(null);
  const ratings = useMemo(() => product?.rating ?? [], [product]);

  const ratingSummary = useMemo(() => {
    const total = ratings.length;
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    ratings.forEach(r => { counts[r.rating]++; sum += r.rating; });
    return { avg: total ? (sum / total).toFixed(1) : 0, counts, total };
  }, [ratings]);


  /* ✅ Filtered Reviews */
  const filteredReviews = useMemo(() => {
    if (!filterStar) return ratings;
    return ratings.filter(r => r.rating === filterStar);
  }, [filterStar, ratings]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: window.location.href,
        });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };


  return (
    <div className="my-12 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-6 border-b border-gray-200">
          {['Description', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`pb-4 text-lg font-bold transition-all ${selectedTab === tab ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* IMPROVED SHARE BUTTON VISIBILITY */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-white border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50 text-purple-700 px-5 py-2.5 rounded-full text-sm font-bold transition shadow-sm"
        >
          <Share2 size={18} />
          <span className="hidden sm:inline">Share Product</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedTab === "Reviews" && (
          <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Summary Card with Visible Numbers & Animated Bars */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid md:grid-cols-3 gap-8">
              <div className="text-center md:text-left flex flex-col justify-center">
                <div className="text-6xl font-black text-gray-900">{ratingSummary.avg}</div>
                <div className="flex justify-center md:justify-start gap-1 my-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <StarIcon key={i} size={20} className={i <= Math.round(ratingSummary.avg) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 font-bold">{ratingSummary.total} Total Ratings</p>
              </div>

              <div className="md:col-span-2 space-y-4">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-3">
                    {/* VISIBLE STAR NUMBER */}
                    <span className="text-sm font-bold text-gray-700 w-4">{star}</span>

                    {/* ANIMATED BAR */}
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(ratingSummary.counts[star] / (ratingSummary.total || 1)) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-yellow-400 rounded-full"
                      />
                    </div>

                    {/* VISIBLE COUNT */}
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {ratingSummary.counts[star]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
              {ratings.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex gap-4">
                  <img src={item.user.image} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-gray-900">{item.user.name}</h4>
                      <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">{item.review}</p>
                  </div>
                </div>
              ))}
            </div>
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
