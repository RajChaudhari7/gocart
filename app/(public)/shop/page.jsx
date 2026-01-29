'use client'

import { Suspense, useState, useRef, useEffect, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import { MoveLeftIcon, SlidersHorizontal, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games']

function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search')

  // Fixed: Added safety check for products list
  const products = useSelector((state) => state.product.list || [])

  const allCategories = useMemo(() => 
    Array.from(new Set(['all', ...DEFAULT_CATEGORIES, ...products.map((p) => p.category)]))
  , [products])

  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('')
  const [maxPrice, setMaxPrice] = useState(5000) 
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!products) return []
    
    return products
      .filter(p => search ? p.name.toLowerCase().includes(search.toLowerCase()) : true)
      .filter(p => category === 'all' ? true : p.category === category)
      .filter(p => p.price <= maxPrice)
      .sort((a, b) => {
        if (sort === 'low-high') return a.price - b.price
        if (sort === 'high-low') return b.price - a.price
        return 0
      })
  }, [products, search, category, maxPrice, sort])

  return (
    <section className="min-h-screen bg-[#020617] text-white">
      {/* Editorial Header */}
      <div className="relative h-[25vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent" />
        <div className="relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-2"
          >
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">COLLECTION</span>
          </motion.h1>
          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase">Premium Marketplace</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR */}
          <aside className="hidden lg:block w-64 space-y-10 sticky top-32 h-fit">
            <div>
              <h3 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-6">Categories</h3>
              <div className="flex flex-col gap-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-left text-sm py-1 transition-all ${
                      category === cat ? 'text-cyan-400 font-bold translate-x-2' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Price Range</h3>
                <span className="text-cyan-400 font-mono text-xs">₹{maxPrice}</span>
              </div>
              <input
                type="range" min="0" max="5000" step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                <p className="text-xs text-white/40 uppercase tracking-widest">{filteredProducts.length} Artifacts found</p>
                <div className="flex gap-4">
                     <select 
                        value={sort} 
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none cursor-pointer text-white/60 hover:text-white"
                     >
                        <option className="bg-[#020617]" value="">Sort By</option>
                        <option className="bg-[#020617]" value="low-high">Low to High</option>
                        <option className="bg-[#020617]" value="high-low">High to Low</option>
                     </select>
                     <button onClick={() => setShowMobileFilter(true)} className="lg:hidden p-2 bg-white/5 rounded-full">
                        <SlidersHorizontal size={16} />
                     </button>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilter(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]" 
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-0 inset-x-0 bg-[#0a0a0a] z-[101] rounded-t-[2.5rem] p-8 border-t border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setShowMobileFilter(false)}><X size={24}/></button>
              </div>
              <div className="space-y-8">
                <div>
                    <h3 className="text-[10px] font-bold text-white/30 uppercase mb-4">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                        {allCategories.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-xs ${category === cat ? 'bg-white text-black' : 'bg-white/5'}`}>{cat}</button>
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
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#020617] text-white">Loading...</div>}>
      <ShopContent />
    </Suspense>
  )
}