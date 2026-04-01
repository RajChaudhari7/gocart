'use client'

import {
  StarIcon,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Ban,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'

const LOW_STOCK_LIMIT = 10

// Framer motion swipe helpers
const swipeConfidenceThreshold = 10000
const swipePower = (offset, velocity) => Math.abs(offset) * velocity

// Variants for the image slider
const sliderVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0
  })
}

const ProductCard = ({ product, storeIsActive }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const isShopClosed = storeIsActive === false

  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : []

  // Track page and direction for sliding animations
  const [[page, direction], setPage] = useState([0, 0])
  const cardRef = useRef(null)

  const imageIndex = Math.abs(page % images.length)
  const currentImage = images[imageIndex] || '/placeholder.png'

  const rating = product.rating?.length > 0
    ? Math.floor(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
    : 0

  const hasMultiple = images.length > 1
  const stockValue = Number(product.quantity || 0)
  const isOutOfStock = stockValue <= 0
  const isLowStock = stockValue > 0 && stockValue < LOW_STOCK_LIMIT

  // ================= SLIDER FUNCTIONS =================
  const paginate = (newDirection) => {
    if (!hasMultiple || isOutOfStock) return
    setPage([page + newDirection, newDirection])
  }

  const handleDragEnd = (e, { offset, velocity }) => {
    if (isOutOfStock || isShopClosed) return
    const swipe = swipePower(offset.x, velocity.x)

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1)
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1)
    }
  }

  // ================= 3D TILT (Desktop Only) =================
  const handleMouseMove = (e) => {
    if (!cardRef.current || isOutOfStock || isShopClosed || window.innerWidth < 768) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const rotateY = ((x / rect.width) - 0.5) * 10 // Reduced for elegance
    const rotateX = -((y / rect.height) - 0.5) * 10

    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(10px)
    `
  }

  const resetTilt = () => {
    if (!cardRef.current || window.innerWidth < 768) return
    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0px)
    `
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="group relative w-full h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 ease-out will-change-transform
        bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        ${!isOutOfStock && !isShopClosed ? 'hover:shadow-[0_8px_40px_rgba(34,211,238,0.1)] hover:border-white/20 hover:bg-white/[0.04]' : ''}
        ${isOutOfStock ? 'opacity-70 grayscale-[0.5]' : ''}`}
      >
        
        {/* SHOP CLOSED OVERLAY */}
        {isShopClosed && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-full border border-orange-500/30">
              <Ban size={24} className="text-orange-400" />
            </div>
            <span className="text-xs font-bold tracking-widest text-orange-400">STORE CLOSED</span>
          </div>
        )}

        {/* OUT OF STOCK OVERLAY */}
        {isOutOfStock && !isShopClosed && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-full border border-red-500/30">
              <Ban size={24} className="text-red-400" />
            </div>
            <span className="text-xs font-bold tracking-widest text-red-400">OUT OF STOCK</span>
          </div>
        )}

        {/* IMAGE CONTAINER (Swipeable) */}
        <div className="relative w-full aspect-square md:h-[240px] bg-gradient-to-b from-white/[0.05] to-transparent p-6 overflow-hidden flex items-center justify-center">
          
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={sliderVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              drag={hasMultiple && !isOutOfStock ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex items-center justify-center p-6 cursor-grab active:cursor-grabbing"
            >
              <Image
                src={currentImage}
                alt={product.name || 'Product image'}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-contain drop-shadow-2xl pointer-events-none p-6"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* DESKTOP ARROWS */}
          {hasMultiple && !isOutOfStock && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); paginate(-1); }}
                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/10 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 z-20 backdrop-blur-md"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); paginate(1); }}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 border border-white/10 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 z-20 backdrop-blur-md"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* PAGINATION DOTS (Mobile Friendly) */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${i === imageIndex ? 'w-4 bg-cyan-400' : 'w-1.5 bg-white/30'}`} 
                />
              ))}
            </div>
          )}

          {/* DESKTOP QUICK VIEW HOVER OVERLAY */}
          {!isOutOfStock && !isShopClosed && (
            <div className="hidden md:flex absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-30">
              <Link
                href={`/product/${product.id}`}
                className="w-full py-2.5 bg-white/10 backdrop-blur-lg border border-white/20 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-500 hover:border-cyan-400 hover:text-black transition-all shadow-lg"
              >
                <ShoppingBag size={16} />
                View Details
              </Link>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-5 flex flex-col flex-grow bg-black/20 relative z-10">
          
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
              {product.category || 'Gear'}
            </span>
            {rating > 0 && (
              <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                <StarIcon size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] text-white/80 font-medium">{rating}.0</span>
              </div>
            )}
          </div>

          <Link href={`/product/${product.id}`} className="block group/link mb-3">
            <h3 className="text-sm md:text-base font-medium text-white/90 group-hover/link:text-cyan-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col">
              {/* Fake Original Price for Premium Look (Remove if not needed) */}
              {!isOutOfStock && (
                <span className="text-[11px] text-white/30 line-through mb-0.5">
                  {currency}{(product.price * 1.2).toFixed(2)}
                </span>
              )}
              <p className={`text-lg font-bold tracking-tight ${isOutOfStock ? 'text-white/40' : 'text-white'}`}>
                {currency}{Number(product.price).toLocaleString()}
              </p>
            </div>

            {isLowStock && (
              <div className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md border border-orange-400/20">
                <AlertCircle size={12} />
                <span className="text-[10px] font-semibold">Only {stockValue} left</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}

export default ProductCard