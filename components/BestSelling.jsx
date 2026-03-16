'use client'
import Title from './Title'
import Link from 'next/link'
import { Store, Package } from 'lucide-react'

const BestSelling = () => {
  return (
    <section className="relative bg-gradient-to-b from-[#020617] via-[#020617] to-black">
      <div className="px-6 py-24 max-w-7xl mx-auto">

        <Title
          title="Start Shopping"
          description="Choose how you want to explore products"
          href="/shop"
          theme="dark"
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Shop by Shop */}
          <Link href="/product">
            <div className="group cursor-pointer relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-12 transition-all duration-500 hover:scale-[1.04] hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]">

              <div className="flex flex-col items-center text-center">

                <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition">
                  <Store className="w-10 h-10 text-blue-400" />
                </div>

                <h2 className="text-2xl font-semibold text-white mb-3">
                  Shop by Shop
                </h2>

                <p className="text-gray-400 max-w-xs">
                  Browse products from your favorite stores and discover
                  everything they offer in one place.
                </p>

              </div>
            </div>
          </Link>

          {/* Shop by Product */}
          <Link href="/shop">
            <div className="group cursor-pointer relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-12 transition-all duration-500 hover:scale-[1.04] hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]">

              <div className="flex flex-col items-center text-center">

                <div className="mb-6 p-4 rounded-2xl bg-purple-500/10 group-hover:bg-purple-500/20 transition">
                  <Package className="w-10 h-10 text-purple-400" />
                </div>

                <h2 className="text-2xl font-semibold text-white mb-3">
                  Shop by Product
                </h2>

                <p className="text-gray-400 max-w-xs">
                  Explore all available products across different shops
                  and find exactly what you need quickly.
                </p>

              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  )
}

export default BestSelling