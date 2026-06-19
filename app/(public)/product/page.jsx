'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

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
  const categoryFromURL = searchParams.get('category')
  const router = useRouter()

  const products = useSelector((state) => state.product.list || [])

  const [category, setCategory] = useState(categoryFromURL || 'all')
  const [sort, setSort] = useState('')
  const [priceRange, setPriceRange] = useState('ALL')
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [searchInput, setSearchInput] = useState(search || '')

  // Sync category from URL
  useEffect(() => {
    if (categoryFromURL) {
      setCategory(categoryFromURL)
    }
  }, [categoryFromURL])

  // Debounced Search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchInput.trim() === '') {
        router.push('/shop') // Assumes this page is /shop
      } else {
        router.push(`/shop?search=${encodeURIComponent(searchInput)}`)
      }
    }, 400)

    return () => clearTimeout(delay)
  }, [searchInput, router])

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

  /* ✅ DYNAMIC CATEGORIES (Only Available Ones) */
  const allCategories = useMemo(() => {
    // 1. Extract categories from available products
    const productCategories = products
      .map((p) => p.category?.trim())
      .filter(Boolean) // Remove null/undefined

    // 2. Create a Set to remove duplicates, then convert back to array
    const uniqueCategories = Array.from(new Set(productCategories))

    // 3. Add 'all' to the beginning of the list
    return ['all', ...uniqueCategories]
  }, [products])

  return (
    <section className="min-h-screen bg-slate-950 text-slate-200">

      {/* ================= HEADER ================= */}
      <div className="relative pt-32 pb-16 flex flex-col items-center justify-center border-b border-slate-800/60 bg-slate-900/20">
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 text-white"
          >
            THE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              COLLECTION
            </span>
          </motion.h1>
          <p className="text-slate-400 text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">
            Discover Premium Products
          </p>
        </div>
      </div>

      {/* ================= SEARCH BAR (STICKY) ================= */}
      <div className="sticky top-[70px] md:top-[80px] z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 rounded-full 
              bg-slate-900 border border-slate-800 
              text-white placeholder-slate-500 
              outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 
              transition-all duration-300 text-sm sm:text-base shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ================= DESKTOP SIDEBAR ================= */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-10 sticky top-40 h-fit">

            {/* CATEGORIES */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-5">
                Categories
              </h3>
              <div className="flex flex-col gap-1.5 border-l border-slate-800 pl-4">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left text-sm py-1.5 transition-all duration-200 capitalize ${category === cat
                        ? 'text-indigo-400 font-bold -translate-x-1'
                        : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-5">
                Price Range
              </h3>
              <div className="flex flex-col gap-1.5 border-l border-slate-800 pl-4">
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setPriceRange(range.value)}
                    className={`text-left text-sm py-1.5 transition-all duration-200 ${priceRange === range.value
                        ? 'text-indigo-400 font-bold -translate-x-1'
                        : 'text-slate-400 hover:text-white'
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

            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-slate-800/80">
              <p className="text-sm font-medium text-slate-400">
                Showing <span className="text-white font-bold">{filteredProducts.length}</span> Products
              </p>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none bg-slate-900 border border-slate-800 text-sm font-semibold text-white px-4 py-2 pr-8 rounded-lg outline-none focus:border-indigo-500 cursor-pointer transition-colors"
                  >
                    <option value="">Sort By: Default</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>

                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
              </div>
            </div>

            {/* Grid */}
            {filteredProducts.length > 0 ? (
              <AnimatePresence mode="popLayout">
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeIsActive={product.store?.isActive === true}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search size={48} className="text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                <p className="text-slate-400">Try adjusting your filters or search query.</p>
                <button
                  onClick={() => { setCategory('all'); setPriceRange('ALL'); setSearchInput(''); }}
                  className="mt-6 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MOBILE FILTER MODAL ================= */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilter(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] lg:hidden"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 z-[101] rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto lg:hidden shadow-2xl"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white">Filters & Sorting</h2>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-300"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-8">
                {/* CATEGORIES */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat)
                          setShowMobileFilter(false)
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition border ${category === cat
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRICE RANGE */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Price Range
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setPriceRange(range.value)
                          setShowMobileFilter(false)
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition border ${priceRange === range.value
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
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
        <div className="h-screen flex items-center justify-center bg-slate-950 text-indigo-400 font-semibold tracking-widest uppercase text-sm">
          Loading Collection...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}