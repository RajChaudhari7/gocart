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
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.05)]">
        
        {/* IMAGE SECTION - More compact aspect ratio */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#0f0f0f]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <Image
                src={images[index]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Minimal Overlay - Eye Icon Only */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link 
              href={`/product/${product.id}`}
              className="p-3 bg-white text-black rounded-full scale-75 group-hover:scale-100 transition-transform duration-300 hover:bg-cyan-400"
            >
              <Eye size={20} />
            </Link>
          </div>

          {/* Image Navigation Dots (Clean & Small) */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-cyan-400' : 'w-1 bg-white/30'}`} 
                />
              ))}
            </div>
          )}
        </div>

        {/* CONTENT SECTION - Reduced Padding */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">
              {product.category || 'Gear'}
            </span>
            <div className="flex items-center gap-1">
              <StarIcon size={8} fill="#22d3ee" stroke="none" />
              <span className="text-[9px] text-white/50 font-medium">{rating}.0</span>
            </div>
          </div>

          <Link href={`/product/${product.id}`}>
            <h3 className="text-xs md:text-sm font-medium text-white/80 group-hover:text-cyan-400 transition-colors line-clamp-1 mb-2">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto flex items-baseline gap-2">
            <p className="text-sm md:text-base font-bold text-white">
              {currency}{product.price}
            </p>
            {product.price && (
              <p className="text-[10px] text-white/20 line-through">
                {currency}{Math.round(product.price * 1.2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard