'use client'

import { Suspense, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search')

  const products = useSelector(state => state.product.list)

  // FILTER STATES
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("")
  const [price, setPrice] = useState(100000)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // FILTER LOGIC
  const filteredProducts = products
    .filter(product =>
      search
        ? product.name.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .filter(product =>
      category === "all" ? true : product.category === category
    )
    .filter(product => product.price <= price)
    .sort((a, b) => {
      if (sort === "low-high") return a.price - b.price
      if (sort === "high-low") return b.price - a.price
      return 0
    })

  return (
    <div className="min-h-[70vh] mx-4 sm:mx-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1
          onClick={() => router.push('/shop')}
          className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"
        >
          {search && <MoveLeftIcon size={20} />}
          All <span className="text-slate-700 font-medium">Products</span>
        </h1>

        {/* MOBILE FILTER BUTTON */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="md:hidden w-full border rounded-lg py-2 mb-4"
        >
          Filters
        </button>

        <div className="flex gap-8">

          {/* DESKTOP FILTER */}
          <div className="hidden md:block w-64 p-4 border rounded-xl h-fit">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>

            {/* CATEGORY */}
            <div className="mb-4">
              <p className="font-medium mb-2">Category</p>
              <select
                className="w-full border rounded-md p-2"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="all">All</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
              </select>
            </div>

            {/* PRICE */}
            <div className="mb-4">
              <p className="font-medium mb-2">Max Price: ₹{price}</p>
              <input
                type="range"
                min="0"
                max="100000"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* SORT */}
            <div>
              <p className="font-medium mb-2">Sort</p>
              <select
                className="w-full border rounded-md p-2"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="">Default</option>
                <option value="low-high">Price: Low → High</option>
                <option value="high-low">Price: High → Low</option>
              </select>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-slate-500">No products found</p>
            )}
          </div>
        </div>

        {/* MOBILE FILTER MODAL */}
        {showMobileFilter && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
            <div className="bg-white w-full p-4 rounded-t-2xl">

              <h2 className="text-lg font-semibold mb-4">Filters</h2>

              {/* CATEGORY */}
              <select
                className="w-full border p-2 mb-3"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
              </select>

              {/* PRICE */}
              <p className="mb-1">Max Price: ₹{price}</p>
              <input
                type="range"
                min="0"
                max="100000"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full mb-4"
              />

              {/* SORT */}
              <select
                className="w-full border p-2 mb-4"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="">Default</option>
                <option value="low-high">Low → High</option>
                <option value="high-low">High → Low</option>
              </select>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-full border py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-full bg-black text-white py-2 rounded-lg"
                >
                  Apply
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  )
}
