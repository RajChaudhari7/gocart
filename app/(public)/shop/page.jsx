'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { MoveLeftIcon, SlidersHorizontal, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search')

  const products = useSelector((state) => state.product.list)

  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...products.map(p => p.category)])
  )

  // FILTER STATES
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // TEMP STATES for mobile drawer
  const [tempCategory, setTempCategory] = useState(category)
  const [tempSort, setTempSort] = useState(sort)
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice)

  const drawerRef = useRef(null)

  // Click outside to close
  useEffect(() => {
    if (!showMobileFilter) return

    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setShowMobileFilter(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMobileFilter])

  // FILTER LOGIC
  const filteredProducts = products
    .filter(product =>
      search
        ? product.name.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .filter(product =>
      category === 'all' ? true : product.category === category
    )
    .filter(product =>
      maxPrice ? product.price <= Number(maxPrice) : true
    )
    .sort((a, b) => {
      if (sort === 'low-high') return a.price - b.price
      if (sort === 'high-low') return b.price - a.price
      return 0
    })

  const applyMobileFilters = () => {
    setCategory(tempCategory)
    setSort(tempSort)
    setMaxPrice(tempMaxPrice)
    setShowMobileFilter(false)
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#020617] to-black text-white px-4 sm:px-6">
      <div className="max-w-7xl mx-auto py-12">

        {/* HEADER */}
        <h1
          onClick={() => router.push('/shop')}
          className="text-xl sm:text-2xl text-white/60 mb-8 flex items-center gap-2 cursor-pointer hover:text-white transition"
        >
          {search && <MoveLeftIcon size={20} />}
          All <span className="text-white font-semibold">Products</span>
        </h1>

        {/* MOBILE FILTER BUTTON */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 mb-6
          rounded-lg bg-white/10 backdrop-blur border border-white/10"
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>

        <div className="grid lg:grid-cols-[280px_1fr] gap-10">

          {/* DESKTOP FILTER */}
          <aside
            className="hidden lg:block sticky top-28 h-fit rounded-2xl
            bg-white/5 backdrop-blur-xl border border-white/10 p-6"
          >
            <h2 className="text-lg font-semibold mb-6">Filters</h2>

            {/* CATEGORY */}
            <div className="mb-6">
              <p className="font-medium mb-2 text-white/80">Category</p>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* PRICE */}
            <div className="mb-6">
              <p className="font-medium mb-2 text-white/80">Max Price</p>
              <input
                type="number"
                placeholder="Enter max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2"
              />
            </div>

            {/* SORT */}
            <div>
              <p className="font-medium mb-2 text-white/80">Sort</p>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="">Default</option>
                <option value="low-high">Price: Low → High</option>
                <option value="high-low">Price: High → Low</option>
              </select>
            </div>
          </aside>

          {/* PRODUCTS */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-white/50">No products found</p>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER WITH SWIPE */}
      <AnimatePresence>
        {showMobileFilter && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={drawerRef}
              className="w-full max-w-xs h-full bg-[#020617] border-l border-white/10 p-6 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              drag="y" // <-- enable vertical drag
              dragConstraints={{ top: 0, bottom: 300 }} // max drag down
              dragElastic={0.2}
              onDragEnd={(event, info) => {
                if (info.point.y > 150) setShowMobileFilter(false) // close if swiped down enough
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setShowMobileFilter(false)}>
                  <X />
                </button>
              </div>

              {/* CATEGORY */}
              <select
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 mb-4"
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* MAX PRICE */}
              <input
                type="number"
                placeholder="Max price"
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 mb-4"
              />

              {/* SORT */}
              <select
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 mb-6"
                value={tempSort}
                onChange={(e) => setTempSort(e.target.value)}
              >
                <option value="">Default</option>
                <option value="low-high">Low → High</option>
                <option value="high-low">High → Low</option>
              </select>

              <button
                onClick={applyMobileFilters}
                className="w-full py-3 rounded-lg bg-gradient-to-r
                from-cyan-400 to-emerald-400 text-black font-semibold"
              >
                Apply Filters
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  )
}
