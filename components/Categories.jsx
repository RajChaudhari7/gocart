'use client'

import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import {
  Laptop,
  Shirt,
  Watch,
  Smartphone,
  Home,
  Book,
  Gamepad2,
  Dumbbell,
  Sparkles,
} from 'lucide-react'

/* DEFAULT CATEGORY ICON MAP */
const ICON_MAP = {
  Electronics: Laptop,
  Clothing: Shirt,
  Fashion: Shirt,
  Watches: Watch,
  Mobiles: Smartphone,
  'Home & Kitchen': Home,
  'Books & Media': Book,
  'Toys & Games': Gamepad2,
  'Sports & Outdoors': Dumbbell,
  'Beauty & Health': Sparkles,
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
    router.push(`/product?category=${encodeURIComponent(category)}`)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[#020617] to-black text-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Shop by Category
          </h2>
          <p className="text-white/40 mt-3 text-sm">
            Explore products across all categories
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((cat, index) => {
            const Icon = ICON_MAP[cat] || Laptop

            return (
              <div
                key={index}
                onClick={() => handleClick(cat)}
                className="group cursor-pointer bg-white/5 border border-white/10 
                hover:border-cyan-400/40 
                p-6 rounded-2xl flex flex-col items-center justify-center 
                transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {/* ICON */}
                <div className="p-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 mb-4">
                  <Icon size={28} className="text-cyan-400" />
                </div>

                {/* NAME */}
                <p className="text-sm font-semibold text-center">
                  {cat}
                </p>

                {/* COUNT */}
                <span className="text-xs text-white/40 mt-1">
                  {categoryCount[cat] || 0} items
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}