'use client'

import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = ['Description', 'Reviews'];

export default function ProductDescription({ product }) {
  const [tab, setTab] = useState('Description');

  const ratings = product.rating || [];

  return (
    <div className="mt-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">

      {/* TABS */}
      <div className="flex gap-8 border-b border-white/10 mb-8">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 font-semibold transition
              ${tab === t ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400"}
            `}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "Description" && (
          <motion.div
            key="desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-gray-200 leading-relaxed"
          >
            {product.description}
          </motion.div>
        )}

        {tab === "Reviews" && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {ratings.length === 0 && (
              <p className="text-gray-400 italic">No reviews yet</p>
            )}

            {ratings.map((r, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-black/30 border border-white/10 rounded-2xl p-5"
              >
                <div className="flex gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <StarIcon
                      key={j}
                      size={14}
                      className={r.rating >= j + 1 ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                    />
                  ))}
                </div>
                <p className="text-gray-300">{r.review}</p>
                <p className="text-sm text-gray-500 mt-2">— {r.user.name}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORE */}
      <div className="mt-10 flex items-center gap-4 bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-2xl">
        <Image
          src={product.store.logo}
          alt={product.store.name}
          width={50}
          height={50}
          className="rounded-full bg-white p-1"
        />
        <Link href={`/shop/${product.store.username}`} className="font-semibold underline">
          Visit {product.store.name}
        </Link>
      </div>
    </div>
  );
}
