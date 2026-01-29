'use client'

import { StarIcon, Eye, Plus, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const images = product.images || []
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Background Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />

      <div className="relative flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 group-hover:border-white/20">
        
        {/* IMAGE SECTION */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0f0f0f]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full w-full"
            >
              <Image
                src={images[index]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Luxury Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />

          {/* Quick Actions Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-500 delay-75">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-cyan-400 transition">
              <Plus size={14} /> Quick Add
            </button>
            <Link 
                href={`/product/${product.id}`}
                className="p-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-white hover:text-black transition"
            >
              <Eye size={16} />
            </Link>
          </div>

          {/* Image Navigation Arrows (Desktop) */}
          {images.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={(e) => { e.preventDefault(); paginate(-1); }} className="p-1 rounded-full bg-black/40 text-white hover:bg-black/60">
                 <span className="sr-only">Prev</span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
               </button>
               <button onClick={(e) => { e.preventDefault(); paginate(1); }} className="p-1 rounded-full bg-black/40 text-white hover:bg-black/60">
                 <span className="sr-only">Next</span>
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
              {product.category || 'New Tech'}
            </p>
            <div className="flex items-center gap-1">
              <StarIcon size={10} fill="#22d3ee" stroke="none" />
              <span className="text-[10px] text-white/70 font-medium">{rating}.0</span>
            </div>
          </div>

          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-medium text-white/90 group-hover:text-cyan-400 transition-colors line-clamp-1 mb-4">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 line-through mb-1">
                {currency}{Math.round(product.price * 1.2)}
              </p>
              <p className="text-xl font-light tracking-tight text-white">
                {currency}{product.price}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex -space-x-1.5 mb-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full border border-[#0a0a0a] ${i === 0 ? 'bg-cyan-500' : i === 1 ? 'bg-purple-500' : 'bg-white'}`} />
                ))}
              </div>
              <span className="text-[10px] text-gray-500">Available Colors</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard