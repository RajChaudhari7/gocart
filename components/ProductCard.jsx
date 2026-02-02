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

  const rating =
    product.rating?.length > 0
      ? Math.floor(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0

  const hasMultiple = images.length > 1
  const stockValue = Number(product.quantity || 0)
  const isOutOfStock = stockValue <= 0
  const isLowStock = stockValue > 0 && stockValue < LOW_STOCK_LIMIT

  // ================= SLIDER FUNCTIONS =================
  const nextImage = (e) => {
    e?.stopPropagation()
    if (!hasMultiple) return
    setIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e) => {
    e?.stopPropagation()
    if (!hasMultiple) return
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 40) nextImage()
    if (diff < -40) prevImage()
  }

  const currentImage =
    images[index] || images[0] || '/placeholder.png'

  // ================= 3D TILT =================
  const handleMouseMove = (e) => {
    if (!cardRef.current || isOutOfStock) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const rotateY = ((x / rect.width) - 0.5) * 15
    const rotateX = -((y / rect.height) - 0.5) * 15

    cardRef.current.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(20px)
      scale(1.08)
    `
    cardRef.current.style.boxShadow = `
      0 ${-rotateX*1.5}px ${Math.abs(rotateX*6)+20}px rgba(34,211,238,0.25),
      0 ${rotateY*1.5}px ${Math.abs(rotateY*6)+20}px rgba(0,0,0,0.25)
    `
  }

  const resetTilt = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(20px)
      scale(1.05)
    `
    cardRef.current.style.boxShadow = `0 20px 40px rgba(0,0,0,0.25)`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="group relative"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        animate={{ y: [0, -12, 0] }} // card floating
        transition={{ duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        className="relative flex flex-col h-full rounded-xl overflow-hidden border transition-all duration-300 will-change-transform
        bg-[#0a0a0a] border-white/5"
        style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.25)', transformStyle: 'preserve-3d' }}
      >
        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center gap-2">
            <Ban size={28} className="text-red-400" />
            <span className="text-sm font-semibold tracking-wide text-red-400">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* IMAGE */}
        <div
          className="relative w-full h-[180px] bg-[#111] flex items-center justify-center p-3 select-none overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Floating parent div */}
          <motion.div
            animate={{ x: [0, 3, -3, 0], y: [0, -2, 2, 0] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
            className="relative w-full h-full"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index} // must update key for fade effect
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className={`${isOutOfStock ? 'grayscale' : ''} w-full h-full relative`}
              >
                <Image
                  src={currentImage}
                  alt={product.name || 'Product image'}
                  fill
                  className="object-contain"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ARROWS */}
          {hasMultiple && !isOutOfStock && (
            <>
              <button
                onClick={prevImage}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition z-20"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition z-20"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* VIEW ICON */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
              <Link
                href={`/product/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 bg-white text-black rounded-full hover:bg-cyan-400 transition"
              >
                <Eye size={18} />
              </Link>
            </div>
          )}
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

          {isOutOfStock ? (
            <h3 className="text-xs font-medium text-white/40 line-clamp-2 mb-1.5">
              {product.name}
            </h3>
          ) : (
            <Link href={`/product/${product.id}`}>
              <h3 className="text-xs font-medium text-white/80 group-hover:text-cyan-400 transition line-clamp-2 mb-1.5">
                {product.name}
              </h3>
            </Link>
          )}

          <div className="mt-auto flex items-center gap-2">
            <p className={`text-sm font-bold ${isOutOfStock ? 'text-white/40' : 'text-white'}`}>
              {currency}{product.price}
            </p>
            {!isOutOfStock && (
              <p className="text-[10px] text-white/30 line-through">
                {currency}{Math.round(product.price * 1.2)}
              </p>
            )}
          </div>

          {isLowStock && (
            <span className="mt-1 text-[10px] text-yellow-400 font-semibold">
              Only {stockValue} left
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProductCard
