'use client'

import { StarIcon, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const images = product.images || []
  const [index, setIndex] = useState(0)
  const touchStartX = useRef(0)

  const rating =
    product.rating?.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0

  const nextImage = () => {
    setIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX

    if (diff > 50) nextImage()
    if (diff < -50) prevImage()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20">

        {/* IMAGE SLIDER */}
        <div
          className="relative w-full h-[180px] bg-[#111] flex items-center justify-center p-3"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full h-full"
            >
              <Image
                src={images[index]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* DESKTOP ARROWS */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  prevImage()
                }}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  nextImage()
                }}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* DOTS */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIndex(i)
                  }}
                  className={`h-1 rounded-full transition-all ${
                    i === index ? 'w-4 bg-cyan-400' : 'w-1 bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* HOVER VIEW ICON */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Link
              href={`/product/${product.id}`}
              className="p-2.5 bg-white text-black rounded-full hover:bg-cyan-400 transition"
            >
              <Eye size={18} />
            </Link>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-3 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
              {product.category || 'Gear'}
            </span>
            <div className="flex items-center gap-1">
              <StarIcon size={10} fill="#22d3ee" stroke="none" />
              <span className="text-[10px] text-white/60">{rating}.0</span>
            </div>
          </div>

          <Link href={`/product/${product.id}`}>
            <h3 className="text-xs font-medium text-white/80 group-hover:text-cyan-400 transition line-clamp-2 mb-1.5">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto flex items-center gap-2">
            <p className="text-sm font-bold text-white">
              {currency}{product.price}
            </p>
            {product.price && (
              <p className="text-[10px] text-white/30 line-through">
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
