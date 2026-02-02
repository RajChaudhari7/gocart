'use client'

import {
  StarIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
  Ban
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

const LOW_STOCK_LIMIT = 10

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : []

  const [index, setIndex] = useState(0)
  const touchStartX = useRef(0)
  const cardRef = useRef(null)

  useEffect(() => {
    setIndex(0)
  }, [product.id])

  // ===== RATING =====
  const rating =
    product.rating?.length > 0
      ? Math.floor(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0

  const hasMultiple = images.length > 1

  // ===== STOCK =====
  const stockValue = Number(product.quantity || 0)
  const isOutOfStock = stockValue <= 0
  const isLowStock = stockValue > 0 && stockValue < LOW_STOCK_LIMIT

  // ===== SLIDER =====
  const nextImage = (e) => {
    if (isOutOfStock || !hasMultiple) return
    e?.preventDefault()
    e?.stopPropagation()
    setIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e) => {
    if (isOutOfStock || !hasMultiple) return
    e?.preventDefault()
    e?.stopPropagation()
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const onTouchStart = (e) => {
    if (isOutOfStock) return
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    if (isOutOfStock || !hasMultiple) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50) nextImage()
    if (diff < -50) prevImage()
  }

  const currentImage =
    images[index] || images[0] || '/placeholder.png'

  // ===== 3D HOVER =====
  const handleMouseMove = (e) => {
    if (!cardRef.current || isOutOfStock) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const rotateY = ((x / rect.width) - 0.5) * 12
    const rotateX = -((y / rect.height) - 0.5) * 12

    cardRef.current.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(8px)
    `
  }

  const resetTilt = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0px)
    `
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        className={`relative flex flex-col h-full rounded-xl overflow-hidden border transition-all
        ${
          isOutOfStock
            ? 'bg-[#0a0a0a] border-red-500/30 opacity-70'
            : 'bg-[#0a0a0a] border-white/5 hover:border-cyan-400/40'
        }`}
      >
        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center gap-2">
            <Ban size={28} className="text-red-400" />
            <span className="text-sm font-semibold text-red-400">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* IMAGE */}
        <div
          className="relative w-full h-[180px] bg-[#111] flex items-center justify-center p-3"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${product.id}-${index}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className={`relative w-full h-full ${
                isOutOfStock ? 'grayscale' : ''
              }`}
            >
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-contain"
              />
            </motion.div>
          </AnimatePresence>

          {hasMultiple && !isOutOfStock && (
            <>
              <button onClick={prevImage} className="nav-btn left-2">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextImage} className="nav-btn right-2">
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-3 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] uppercase text-white/40">
              {product.category || 'Gear'}
            </span>

            <div className="flex items-center gap-1">
              <StarIcon size={10} fill="#22d3ee" stroke="none" />
              <span className="text-[10px] text-white/60">
                {rating}.0
              </span>
            </div>
          </div>

          <h3 className="text-xs font-medium text-white/80 line-clamp-2 mb-1.5">
            {product.name}
          </h3>

          <div className="mt-auto flex items-center gap-2">
            <p className="text-sm font-bold text-white">
              {currency}{product.price}
            </p>
          </div>

          {isLowStock && (
            <span className="mt-1 text-[10px] text-yellow-400 font-semibold">
              Only {stockValue} left
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
