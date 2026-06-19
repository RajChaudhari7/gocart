'use client'

import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import Image from 'next/image'

/* DEFAULT CATEGORY IMAGE MAP (Using high-quality Unsplash placeholders) */
const IMAGE_MAP = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800',
  'Clothing': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800',
  'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
  'Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
  'Mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
  'Books & Media': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800',
  'Toys & Games': 'https://images.unsplash.com/photo-1558066110-d71e756647ea?auto=format&fit=crop&q=80&w=800',
  'Sports & Outdoors': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
  'Beauty & Health': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
  // Fallback image for unknown categories
  'Default': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800'
}

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Beauty & Health',
  'Toys & Games',
  'Sports & Outdoors',
  'Books & Media',
]

export default function Categories() {
  const router = useRouter()

  const products = useSelector((state) => state.product.list || [])

  /* ✅ BUILD DYNAMIC CATEGORIES */
  const categories = useMemo(() => {
    const productCategories = products
      .map((p) => p.category)
      .filter(Boolean)

    return Array.from(
      new Set([...DEFAULT_CATEGORIES, ...productCategories])
    )
  }, [products])

  /* ✅ COUNT PRODUCTS PER CATEGORY */
  const categoryCount = useMemo(() => {
    const map = {}

    products.forEach((p) => {
      if (!p.category) return
      map[p.category] = (map[p.category] || 0) + 1
    })

    return map
  }, [products])

  const handleClick = (category) => {
    router.push(`/shop?category=${encodeURIComponent(category)}`)
  }

  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
              Shop by Category
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl">
              Curated collections to help you find exactly what you're looking for.
            </p>
          </div>
          <button
            onClick={() => router.push('/shop')}
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors hidden md:block"
          >
            Browse All Products →
          </button>
        </div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => {
            const imageSrc = IMAGE_MAP[cat] || IMAGE_MAP['Default']
            const count = categoryCount[cat] || 0

            return (
              <div
                key={index}
                onClick={() => handleClick(cat)}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] cursor-pointer bg-slate-900 border border-slate-800 shadow-xl"
              >
                {/* BACKGROUND IMAGE */}
                <Image
                  src={imageSrc}
                  alt={cat}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />

                {/* DARK OVERLAY GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                {/* CONTENT BORDER HOVER EFFECT */}
                <div className="absolute inset-4 border border-white/0 group-hover:border-white/20 rounded-2xl transition-colors duration-500 z-10" />

                {/* TEXT CONTENT */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-20 flex flex-col justify-end h-full">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 drop-shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    {cat}
                  </h3>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      {count} {count === 1 ? 'Item' : 'Items'}
                    </span>
                    <span className="w-4 h-[1px] bg-indigo-400/50 block"></span>
                  </div>
                </div>

              </div>
            )
          })}
        </div>

        {/* MOBILE BROWSE ALL BUTTON */}
        <button
          onClick={() => router.push('/shop')}
          className="w-full mt-8 py-4 rounded-xl border border-slate-800 text-slate-300 font-semibold md:hidden hover:bg-slate-900 transition-colors"
        >
          Browse All Products
        </button>

      </div>
    </section>
  )
}