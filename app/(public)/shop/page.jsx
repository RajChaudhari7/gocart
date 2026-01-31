'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

/* ✅ ALL DEFAULT CATEGORIES */
const DEFAULT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Beauty & Health',
  'Toys & Games',
  'Sports & Outdoors',
  'Books & Media',
  'Food & Drink',
  'Hobbies & Crafts',
]

function ShopContent() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search')

  const products = useSelector((state) => state.product.list || [])

  /* 🔥 Dynamic highest price */
  const highestPrice = useMemo(() => {
    return products.length > 0
      ? Math.max(...products.map(p => Number(p.price) || 0))
      : 0
  }, [products])

  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('')
  const [maxPrice, setMaxPrice] = useState(0)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  useEffect(() => {
    setMaxPrice(highestPrice)
  }, [highestPrice])

  /* 🔥 FILTER + SORT */
  const filteredProducts = useMemo(() => {
    return products
      .filter(p =>
        search
          ? p.name?.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .filter(p =>
        category === 'all'
          ? true
          : p.category?.toLowerCase() === category.toLowerCase()
      )
      .filter(p => Number(p.price) <= Number(maxPrice))
      .sort((a, b) => {
        if (sort === 'low-high') return Number(a.price) - Number(b.price)
        if (sort === 'high-low') return Number(b.price) - Number(a.price)
        return 0
      })
  }, [products, search, category, maxPrice, sort])

  /* ✅ BUILD CATEGORIES */
  const allCategories = useMemo(() => {
    const productCategories = products
      .map(p => p.category)
      .filter(Boolean)

    return Array.from(
      new Set([
        'all',
        ...DEFAULT_CATEGORIES,
        ...productCategories
      ])
    )
  }, [products])

  return (
    <section className="min-h-screen bg-[#020617] text-white">

      {/* ================= HEADER ================= */}
      <div className="relative h-[28vh] pt-24 flex items-center justify-center overflow-hidden border-b border-white/5">
        
        {/* Glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-3
            drop-shadow-[0_10px_40px_rgba(34,211,238,0.6)]"
          >
            THE{' '}
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r
              from-cyan-400 to-emerald-400
              drop-shadow-[0_0_30px_rgba(34,211,238,1)]"
            >
              COLLECTION
            </span>
          </motion.h1>

          {/* Floating subtitle */}
          <motion.p
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-white/40 text-[10px] tracking-[0.4em] uppercase"
          >
            Premium Marketplace
          </motion.p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ================= SIDEBAR ================= */}
          <aside className="hidden lg:block w-64 space-y-10 sticky top-32 h-fit">
            <div>
              <h3 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-6">
                Categories
              </h3>
              <div className="flex flex-col gap-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left text-sm py-1 transition-all ${
                      category === cat
                        ? 'text-cyan-400 font-bold translate-x-2'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
                  Price Range
                </h3>
                <span className="text-cyan-400 font-mono text-xs">
                  ₹{maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={highestPrice}
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </aside>

          {/* ================= PRODUCT GRID ================= */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <p className="text-xs text-white/40 uppercase tracking-widest">
                {filteredProducts.length} Products Found
              </p>
              <div className="flex gap-4">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none cursor-pointer text-white/60 hover:text-white"
                >
                  <option className="bg-[#020617]" value="">
                    Sort By
                  </option>
                  <option className="bg-[#020617]" value="low-high">
                    Low to High
                  </option>
                  <option className="bg-[#020617]" value="high-low">
                    High to Low
                  </option>
                </select>
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden p-2 bg-white/5 rounded-full"
                >
                  <SlidersHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* 🔥 GRID: 2 on mobile, 3 on tablet, 4 on desktop */}
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="
                  grid
                  grid-cols-2
                  md:grid-cols-3
                  xl:grid-cols-4
                  gap-4 sm:gap-6
                "
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= MOBILE FILTER DRAWER ================= */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilter(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 inset-x-0 bg-[#0a0a0a] z-[101] rounded-t-[2.5rem] p-8 border-t border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setShowMobileFilter(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-bold text-white/30 uppercase mb-4">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs ${
                          category === cat
                            ? 'bg-white text-black'
                            : 'bg-white/5 text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-white/30 uppercase mb-4">
                    Max Price: ₹{maxPrice}
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max={highestPrice}
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
          Loading...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}
