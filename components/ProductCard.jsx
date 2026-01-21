'use client'
import { StarIcon, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  const rating =
    product.rating.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden transition hover:scale-[1.03]"
    >
      {/* IMAGE */}
      <div className="relative h-44 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={400}
          className="max-h-36 w-auto transition duration-500 group-hover:scale-110 drop-shadow-xl"
        />

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition bg-black/40">
          <span className="p-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
            <Eye size={16} className="text-white" />
          </span>
          <span className="p-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
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
                className="mt-0.5"
                fill={rating >= index + 1 ? '#22d3ee' : '#334155'}
                stroke="none"
              />
            ))}
        </div>

        {/* PRICE */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-lg font-semibold text-cyan-400">
            {currency}
            {product.price}
          </p>

          <span className="text-xs text-white/50">
            {product.rating.length} reviews
          </span>
        </div>
      </div>

      {/* NEON HOVER BORDER */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition ring-1 ring-cyan-400/40" />
    </Link>
  )
}

export default ProductCard
