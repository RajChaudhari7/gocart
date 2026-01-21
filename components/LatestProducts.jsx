'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = () => {
  const displayQuantity = 4
  const products = useSelector(state => state.product.list)

  return (
    <section className="relative bg-gradient-to-b from-black to-[#020617]">
      <div className="px-6 py-24 max-w-7xl mx-auto">

        <Title
          title="Latest Products"
          description={`Showing ${
            products.length < displayQuantity
              ? products.length
              : displayQuantity
          } of ${products.length} products`}
          href="/shop"
          theme="dark"
        />

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {products
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, displayQuantity)
            .map((product, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:scale-[1.03] transition"
              >
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

export default LatestProducts
