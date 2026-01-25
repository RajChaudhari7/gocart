'use client'

import { StarIcon, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const images = product.images || []
  const [index, setIndex] = useState(0)

  const rating =
    product.rating?.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0

  const paginate = (direction) => {
    setIndex((prev) => {
      const next = prev + direction
      if (next < 0) return images.length - 1
      if (next >= images.length) return 0
      return next
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.25 }}
      className="will-change-transform"
    >
      <Link
        href={`/product/${product.id}`}
        className="group relative block rounded-2xl
        bg-white/5 backdrop-blur-xl border border-white/10
        overflow-hidden transition hover:scale-[1.03]"
      >
        {/* IMAGE / CAROUSEL */}
        <div
          className="relative h-44 overflow-hidden
          bg-gradient-to-br from-white/10 to-white/5"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(e, info) => {
                if (info.offset.x < -40) paginate(1)
                if (info.offset.x > 40) paginate(-1)
              }}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Image
                src={images[index]}
                alt={product.name}
                width={400}
                height={400}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIi8+"
                className="max-h-36 w-auto
                transition-transform duration-500
                group-hover:scale-110 drop-shadow-xl"
              />
            </motion.div>
          </AnimatePresence>

          {/* HOVER ACTION (DESKTOP) */}
          <div
            className="hidden sm:flex absolute inset-0 items-center justify-center
            opacity-0 group-hover:opacity-100 transition bg-black/40"
          >
            <span
              className="p-2 rounded-full bg-white/10 backdrop-blur
              border border-white/20"
            >
              <Eye size={18} className="text-white" />
            </span>
          </div>

          {/* DOTS (MOBILE) */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition
                    ${i === index ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
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
              .map((_, i) => (
                <StarIcon
                  key={i}
                  size={14}
                  fill={rating >= i + 1 ? '#22d3ee' : '#334155'}
                  stroke="none"
                />
              ))}
          </div>

          {/* PRICE */}
          <div
            className="flex flex-col sm:flex-row sm:items-center
            sm:justify-between mt-3 gap-1"
          >
            <p className="text-lg font-semibold text-cyan-400">
              {currency}{product.price}
            </p>
            <span className="text-xs text-white/50">
              {product.rating?.length || 0} reviews
            </span>
          </div>
        </div>

        {/* NEON BORDER */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none
          opacity-0 group-hover:opacity-100 transition
          ring-1 ring-cyan-400/40"
        />
      </Link>
    </motion.div>
  )
}

export default ProductCard
