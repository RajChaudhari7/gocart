'use client'
import Title from './Title'
import Link from 'next/link'

const BestSelling = () => {

  return (
    <section className="relative bg-gradient-to-b from-[#020617] to-black">
      <div className="px-6 py-24 max-w-7xl mx-auto">

        <Title
          title="Shop"
          description="Choose how you want to shop"
          href="/shop"
          theme="dark"
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Shop by Shop */}
          <Link href="/shop">
            <div className="cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center hover:scale-[1.03] transition">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Shop by Shop
              </h2>
              <p className="text-gray-400">
                Browse products by selecting your favorite store
              </p>
            </div>
          </Link>

          {/* Shop by Product */}
          <Link href="/shop">
            <div className="cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center hover:scale-[1.03] transition">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Shop by Product
              </h2>
              <p className="text-gray-400">
                Explore all available products in one place
              </p>
            </div>
          </Link>

        </div>
      </div>
    </section>
  )
}

export default BestSelling