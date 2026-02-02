'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = () => {
  const displayQuantity = 8
  const products = useSelector(state => state.product.list)

  return (
    <section className="relative bg-gradient-to-b from-[#020617] to-black">
      <div className="px-6 py-24 max-w-7xl mx-auto">

        <Title
          title="Best Selling"
          description={`Showing ${products.length < displayQuantity
              ? products.length
              : displayQuantity
            } of ${products.length} products`}
          href="/shop"
          theme="dark"
        />

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {products
            .filter(p => p.quantity > 0) // 🔥 only here
            .slice()
            .sort((a, b) => b.rating?.length - a.rating?.length)
            .slice(0, displayQuantity)
            .map(product => (
              <ProductCard key={product.id} product={product} />
            ))}

        </div>
      </div>
    </section>
  )
}

export default BestSelling
