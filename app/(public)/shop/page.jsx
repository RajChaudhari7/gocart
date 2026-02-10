'use client'

import { Suspense, useState, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

/* ✅ DEFAULT CATEGORIES */
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

/* ✅ PRICE RANGES */
const PRICE_RANGES = [
  { label: 'All Prices', value: 'ALL' },
  { label: 'Less than ₹500', value: 'UNDER_500' },
  { label: '₹500 – ₹5,000', value: '500_5K' },
  { label: '₹5,000 – ₹10,000', value: '5K_10K' },
  { label: 'Above ₹10,000', value: 'ABOVE_10K' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search')

  const products = useSelector((state) => state.product.list || [])

  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('')
  const [priceRange, setPriceRange] = useState('ALL')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  /* 🔥 FILTER + SORT */
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        search
          ? p.name?.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .filter((p) =>
        category === 'all'
          ? true
          : p.category?.toLowerCase() === category.toLowerCase()
      )
      .filter((p) => {
        const price = Number(p.price) || 0

        switch (priceRange) {
          case 'UNDER_500':
            return price < 500
          case '500_5K':
            return price >= 500 && price <= 5000
          case '5K_10K':
            return price > 5000 && price <= 10000
          case 'ABOVE_10K':
            return price > 10000
          default:
            return true
        }
      })
      .sort((a, b) => {
        if (sort === 'low-high') return Number(a.price) - Number(b.price)
        if (sort === 'high-low') return Number(b.price) - Number(a.price)
        return 0
      })
  }, [products, search, category, priceRange, sort])

  /* ✅ BUILD CATEGORIES */
  const allCategories = useMemo(() => {
    const productCategories = products
      .map((p) => p.category)
      .filter(Boolean)

    return Array.from(
      new Set(['all', ...DEFAULT_CATEGORIES, ...productCategories])
    )
  }, [products])

  return (
    <section className="min-h-screen bg-[#020617] text-white">

      {/* ================= HEADER ================= */}
      <div className="relative h-[28vh] pt-24 flex items-center justify-center border-b border-white/5">
        <div className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-3"
          >
            THE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              COLLECTION
            </span>
          </motion.h1>
          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase">
            Premium Marketplace
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ================= SIDEBAR ================= */}
          <aside className="hidden lg:block w-64 space-y-10 sticky top-32">

            {/* CATEGORIES */}
            <div>
              <h3 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-6">
                Categories
              </h3>
              <div className="flex flex-col gap-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left text-sm py-1 transition ${category === cat
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
              <h3 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-6">
                Price Range
              </h3>
              <div className="flex flex-col gap-2">
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setPriceRange(range.value)}
                    className={`text-left text-sm py-1 transition ${priceRange === range.value
                      ? 'text-cyan-400 font-bold translate-x-2'
                      : 'text-white/50 hover:text-white'
                      }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
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
                  className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none text-white/60"
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

            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} storeIsActive={storeIsActive} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= MOBILE FILTER ================= */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              onClick={() => setShowMobileFilter(false)}
              className="fixed inset-0 bg-black/90 z-[100]"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 bg-[#0a0a0a] z-[101] rounded-t-[2.5rem] p-8 max-h-[85vh] overflow-y-auto"
            >
              {/* HEADER */}
              <div className="flex justify-between mb-8">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setShowMobileFilter(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-10">

                {/* ✅ CATEGORIES (NEW – MOBILE ONLY) */}
                <div>
                  <h3 className="text-[10px] font-bold text-white/30 uppercase mb-4">
                    Categories
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat)
                          setShowMobileFilter(false) // auto close (optional)
                        }}
                        className={`px-4 py-2 rounded-full text-xs capitalize transition ${category === cat
                          ? 'bg-cyan-400 text-black font-bold'
                          : 'bg-white/5 text-white'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRICE RANGE */}
                <div>
                  <h3 className="text-[10px] font-bold text-white/30 uppercase mb-4">
                    Price Range
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setPriceRange(range.value)
                          setShowMobileFilter(false) // auto close (optional)
                        }}
                        className={`px-4 py-2 rounded-full text-xs transition ${priceRange === range.value
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/5 text-white'
                          }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
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
