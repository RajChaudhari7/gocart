'use client'

import { Suspense, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { MoveLeftIcon, SlidersHorizontal, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'

const CATEGORIES = [
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

  // FILTER STATES
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // FILTER LOGIC
  const filteredProducts = products
    .filter((product) =>
      search
        ? product.name.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .filter((product) =>
      category === 'all' ? true : product.category === category
    )
    .filter((product) =>
      maxPrice ? product.price <= Number(maxPrice) : true
    )
    .sort((a, b) => {
      if (sort === 'low-high') return a.price - b.price
      if (sort === 'high-low') return b.price - a.price
      return 0
    })

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
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
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

      {/* MOBILE FILTER DRAWER */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur">
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl
            bg-[#020617] border-t border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowMobileFilter(false)}>
                <X />
              </button>
            </div>

            <select
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 mb-4"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 mb-4"
            />

            <select
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 mb-6"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Default</option>
              <option value="low-high">Low → High</option>
              <option value="high-low">High → Low</option>
            </select>

            <button
              onClick={() => setShowMobileFilter(false)}
              className="w-full py-3 rounded-lg bg-gradient-to-r
              from-cyan-400 to-emerald-400 text-black font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
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
