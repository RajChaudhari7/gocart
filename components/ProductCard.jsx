'use client'
import { StarIcon, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ---------------- TOAST ---------------- */
const Toast = ({ message }) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 50, opacity: 0 }}
    className="fixed bottom-20 left-1/2 -translate-x-1/2
    bg-black/90 px-6 py-3 rounded-full text-white z-50"
  >
    {message}
  </motion.div>
)

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const [showToast, setShowToast] = useState(false)

  const rating =
    product.rating.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0

  /* ---------------- ADD TO CART ---------------- */
  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // 👉 add your redux addToCart(product) here

    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <>
      <Link
        href={`/product/${product.id}`}
        className="group relative block rounded-2xl
        bg-white/5 backdrop-blur-xl border border-white/10
        overflow-hidden transition hover:scale-[1.03]"
      >
        {/* IMAGE */}
        <div className="relative h-44 flex items-center justify-center
          bg-gradient-to-br from-white/10 to-white/5">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            className="max-h-36 w-auto transition duration-500
            group-hover:scale-110 drop-shadow-xl"
          />

          {/* HOVER ACTIONS */}
          <div className="absolute inset-0 flex items-center justify-center gap-3
            opacity-0 group-hover:opacity-100 transition bg-black/40">

            {/* VIEW */}
            <span
              className="p-2 rounded-full bg-white/10 backdrop-blur
              border border-white/20"
            >
              <Eye size={16} className="text-white" />
            </span>

            {/* ADD TO CART */}
            <span
              onClick={handleAddToCart}
              className="p-2 rounded-full bg-white/10 backdrop-blur
              border border-white/20 cursor-pointer"
            >
              <ShoppingCart size={16} className="text-white" />
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4">
          <p className="text-sm font-medium text-white line-clamp-2">
            {product.name}
          </p>

          {/* RATING */}
          <div className="flex items-center gap-1 mt-1">
            {Array(5)
              .fill('')
              .map((_, index) => (
                <StarIcon
                  key={index}
                  size={14}
                  fill={rating >= index + 1 ? '#22d3ee' : '#334155'}
                  stroke="none"
                />
              ))}
          </div>

          {/* PRICE + REVIEWS */}
          <div className="flex flex-col sm:flex-row sm:items-center
            sm:justify-between mt-3 gap-1">
            <p className="text-lg font-semibold text-cyan-400">
              {currency}
              {product.price}
            </p>

            <span className="text-xs text-white/50">
              {product.rating.length} reviews
            </span>
          </div>
        </div>

        {/* NEON BORDER */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none
          opacity-0 group-hover:opacity-100 transition
          ring-1 ring-cyan-400/40" />
      </Link>

      {/* TOAST */}
      <AnimatePresence>
        {showToast && <Toast message="Added to cart" />}
      </AnimatePresence>
    </>
  )
}

export default ProductCard