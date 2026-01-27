'use client'

import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const tabs = ['Description', 'Reviews']

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState('Description')

  return (
    <div className="my-12 px-4 sm:px-6 max-w-7xl mx-auto text-gray-900">

      {/* TABS */}
      <div className="flex gap-6 border-b border-gray-200 mb-10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`relative pb-3 text-sm font-semibold whitespace-nowrap transition-colors
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
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute left-0 -bottom-[2px] h-[3px] w-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {selectedTab === "Description" && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl bg-white p-6 sm:p-8 shadow-md border border-gray-100"
          >
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              {product.description}
            </p>
          </motion.div>
        )}

        {selectedTab === "Reviews" && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
          >
            {product.rating.length === 0 && (
              <p className="text-gray-400 text-center italic py-6">
                No reviews yet
              </p>
            )}

            {product.rating.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                className="flex gap-3 sm:gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition"
              >
                {/* USER AVATAR */}
                <div className="w-12 h-12 relative flex-shrink-0">
                  <Image
                    src={item.user.image || '/default-avatar.png'}
                    alt={item.user.name}
                    fill
                    className="rounded-full object-cover border border-gray-200"
                  />
                </div>

                <div className="flex-1">
                  {/* STARS + DATE */}
                  <div className="flex items-center gap-2 mb-1">
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
                    <span className="text-xs text-gray-400">
                      {new Date(item.createdAt).toDateString()}
                    </span>
                  </div>

                  {/* REVIEW TEXT */}
                  <p className="text-gray-700 text-sm sm:text-base mb-2">
                    {item.review}
                  </p>

                  {/* REVIEW IMAGES */}
                  {item.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.photos.map((img, i) => (
                        <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 relative">
                          <Image
                            src={img}
                            alt="review image"
                            fill
                            className="rounded-lg border border-gray-200 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* USER NAME */}
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {item.user.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORE CARD */}
      <div className="mt-14 flex items-center gap-4 sm:gap-5 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-6 sm:p-8 shadow-xl text-white">
        <Image
          src={product.store.logo}
          alt={product.store.name}
          width={56}
          height={56}
          className="rounded-full bg-white p-1 object-cover"
        />

        <div>
          <p className="text-base sm:text-lg font-semibold">
            Product by {product.store.name}
          </p>
          <Link
            href={`/shop/${product.store.username}`}
            className="inline-flex items-center gap-2 mt-1 text-white/90 hover:text-white font-medium text-sm"
          >
            Visit Store <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDescription
