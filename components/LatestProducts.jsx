'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = () => {
  const displayQuantity = 4
  const products = useSelector(state => state.product.list)
  const storeIsActive = useSelector(
    state => state.store?.current?.isActive
  )


  return (
    <section className="relative bg-gradient-to-b from-black to-[#020617]">
      <div className="px-6 py-24 max-w-7xl mx-auto">

        <Title
          title="Latest Products"
          description={`Showing ${products.length < displayQuantity
            ? products.length
            : displayQuantity
            } of ${products.length} products`}
          href="/product"
          theme="dark"
        />

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, displayQuantity)
            .map((product, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden"
              >
                <ProductCard
                  product={product}
                  storeIsActive={product.store?.isActive === true}
                />


              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

export default LatestProducts
