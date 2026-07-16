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
import { Scale } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCompare,
  removeFromCompare,
} from "@/lib/features/compare/compareSlice";

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
  const dispatch = useDispatch();

  const compareItems = useSelector(
    (state) => state.compare.products || []
  );

  const isCompared = compareItems.some(
    (item) => item.id === product.id
  );

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
  const paginate = (newDirection, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation() // Prevents the card's Link from triggering
    }
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

  const toggleCompare = (e) => {

    e.preventDefault();
    e.stopPropagation();

    if (isCompared) {

      dispatch(removeFromCompare(product.id));

    } else {

      dispatch(addToCompare(product));

    }

  };

  // ================= 3D TILT (Desktop Only) =================
  const handleMouseMove = (e) => {
    if (!cardRef.current || isOutOfStock || isShopClosed || window.innerWidth < 768) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Very subtle tilt for a premium feel
    const rotateY = ((x / rect.width) - 0.5) * 6
    const rotateX = -((y / rect.height) - 0.5) * 6

    cardRef.current.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(10px)
    `
  }

  const resetTilt = () => {
    if (!cardRef.current || window.innerWidth < 768) return
    cardRef.current.style.transform = `
      perspective(1200px)
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
      {/* 
        The entire card is now wrapped in a Link. 
        It functions as a giant clickable area to view the product details.
      */}
      <Link href={`/product/${product.id}`} className="block h-full outline-none">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className={`relative flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-300 ease-out will-change-transform
          bg-slate-900 border border-slate-800 shadow-xl shadow-black/20
          ${!isOutOfStock && !isShopClosed ? 'hover:shadow-indigo-500/10 hover:border-indigo-500/50 hover:bg-slate-800/80' : ''}
          ${isOutOfStock ? 'opacity-70 grayscale-[0.5]' : ''}`}
        >

          {/* SHOP CLOSED OVERLAY */}
          {isShopClosed && (
            <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-full border border-orange-500/30">
                <Ban size={24} className="text-orange-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-orange-400">STORE CLOSED</span>
            </div>
          )}

          {/* OUT OF STOCK OVERLAY */}
          {isOutOfStock && !isShopClosed && (
            <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-red-500/20 rounded-full border border-red-500/30">
                <Ban size={24} className="text-red-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-red-400">OUT OF STOCK</span>
            </div>
          )}

          {/* IMAGE CONTAINER */}
          <div className="relative w-full aspect-square sm:h-[260px] bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-4 md:p-6 overflow-hidden flex items-center justify-center">

            <button
              onClick={toggleCompare}
              className={`absolute top-3 right-3 z-30 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all
                  ${isCompared
                  ? "bg-cyan-500 text-white border-cyan-400"
                  : "bg-slate-900/70 text-slate-300 border-slate-700 hover:bg-slate-800"
                }
                `}
            >
              <Scale size={18} />
            </button>

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
                // Stop propagation on drag start so it doesn't trigger the link click immediately
                onPointerDownCapture={(e) => e.stopPropagation()}
                className="absolute inset-0 flex items-center justify-center p-6 cursor-grab active:cursor-grabbing"
              >


                <Image
                  src={currentImage}
                  alt={product.name || 'Product image'}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-contain drop-shadow-2xl pointer-events-none p-4"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* DESKTOP ARROWS */}
            {hasMultiple && !isOutOfStock && (
              <>
                <button
                  onClick={(e) => paginate(-1, e)}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 border border-slate-700 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-800 hover:scale-110 z-20 backdrop-blur-md"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={(e) => paginate(1, e)}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 border border-slate-700 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-800 hover:scale-110 z-20 backdrop-blur-md"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* PAGINATION DOTS */}
            {hasMultiple && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === imageIndex ? 'w-5 bg-indigo-500' : 'w-1.5 bg-slate-600'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-4 md:p-5 flex flex-col flex-grow relative z-10 border-t border-slate-800/80">

            <div className="flex justify-between items-start mb-2.5">
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                {product.category || 'Premium'}
              </span>
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-slate-300 font-medium">{rating}.0</span>
                </div>
              )}
            </div>

            <h3 className="text-sm md:text-base font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-4">
              {product.name}
            </h3>

            <div className="mt-auto flex items-end justify-between">
              <div className="flex flex-col">
                {product.mrp && product.mrp > product.price && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 line-through">
                      {currency}{Number(product.mrp).toLocaleString()}
                    </span>
                    <span className="text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </span>
                  </div>
                )}

                <p className={`text-lg md:text-xl font-black tracking-tight ${isOutOfStock ? 'text-slate-500' : 'text-white'}`}>
                  {currency}{Number(product.price).toLocaleString()}
                </p>
              </div>

              {/* Status Indicator inside Content Area */}
              {isLowStock && !isOutOfStock && (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-amber-400">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Low Stock</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard