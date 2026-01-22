'use client'

import { ArrowRight, StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState('Description')

  return (
    <section className="px-4 sm:px-6 max-w-7xl mx-auto mt-24 animate-fade-in">

      {/* TABS */}
      <div className="flex gap-4 border-b border-white/10 pb-4 mb-8">
        {['Description', 'Reviews'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`relative px-6 py-2 text-sm font-semibold transition
              ${tab === selectedTab
                ? 'text-cyan-400'
                : 'text-slate-400 hover:text-white'}
            `}
          >
            {tab}
            {tab === selectedTab && (
              <span className="absolute -bottom-[17px] left-0 w-full h-[2px] bg-cyan-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* CONTENT CARD */}
      <div className="bg-gradient-to-br from-[#020617] to-black 
                      border border-white/10 rounded-3xl 
                      p-6 sm:p-10 shadow-2xl">

        {/* DESCRIPTION */}
        {selectedTab === 'Description' && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-slate-300 leading-relaxed text-[15px]">
              {product.description}
            </p>
          </div>
        )}

        {/* REVIEWS */}
        {selectedTab === 'Reviews' && (
          <div className="space-y-6 animate-fadeIn">

            {product.rating.length === 0 && (
              <p className="text-center text-slate-400">
                No reviews yet. Be the first to review this product.
              </p>
            )}

            {product.rating.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 bg-white/5 border border-white/10 
                           rounded-2xl p-5 hover:bg-white/10 transition"
              >
                <Image
                  src={item.user.image}
                  alt={item.user.name}
                  width={48}
                  height={48}
                  className="rounded-full border border-white/20"
                />

                <div className="flex-1">
                  <div className="flex gap-1 mb-1">
                    {Array(5).fill('').map((_, i) => (
                      <StarIcon
                        key={i}
                        size={14}
                        fill={item.rating >= i + 1 ? '#00C950' : '#334155'}
                        className="text-transparent"
                      />
                    ))}
                  </div>

                  <p className="text-slate-300 text-sm">
                    {item.review}
                  </p>

                  <p className="text-xs font-semibold text-slate-400 mt-2">
                    {item.user.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STORE INFO */}
      <div className="mt-12 flex items-center gap-4 
                      bg-white/5 border border-white/10 
                      rounded-2xl p-6 backdrop-blur-xl shadow-lg">

        <Image
          src={product.store.logo}
          alt={product.store.name}
          width={56}
          height={56}
          className="rounded-full border border-white/20"
        />

        <div className="flex-1">
          <p className="text-xs text-slate-400">Product by</p>
          <p className="font-semibold text-white">
            {product.store.name}
          </p>
        </div>

        <Link
          href={`/shop/${product.store.username}`}
          className="text-cyan-400 text-sm font-medium inline-flex items-center gap-1 hover:underline"
        >
          View Store <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}

export default ProductDescription
