'use client'

import { ArrowRight, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ProductDescription = ({ product }) => {
  const [selectedTab, setSelectedTab] = useState("Description")

  return (
    <section className="px-4 sm:px-6 max-w-7xl mx-auto mt-20 animate-fade-in">
      
      {/* TABS */}
      <div className="inline-flex bg-white/5 border border-white/10 rounded-xl mb-8">
        {["Description", "Reviews"].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-6 py-2 text-sm font-semibold rounded-xl transition
              ${tab === selectedTab
                ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-black"
                : "text-slate-400 hover:text-white"}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
        {selectedTab === "Description" && (
          <p className="text-slate-300 leading-relaxed">
            {product.description}
          </p>
        )}

        {selectedTab === "Reviews" && (
          <div className="space-y-6">
            {product.rating.length === 0 && (
              <p className="text-center text-slate-400">No reviews yet</p>
            )}

            {product.rating.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <Image
                  src={item.user.image}
                  alt={item.user.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <div className="flex gap-1 mb-1">
                    {Array(5).fill("").map((_, i) => (
                      <StarIcon
                        key={i}
                        size={14}
                        fill={item.rating >= i + 1 ? "#00C950" : "#334155"}
                        className="text-transparent"
                      />
                    ))}
                  </div>
                  <p className="text-slate-300">{item.review}</p>
                  <p className="text-sm font-semibold mt-1">{item.user.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STORE */}
      <div className="mt-10 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
        <Image src={product.store.logo} alt="" width={56} height={56} className="rounded-full" />
        <div>
          <p className="text-slate-300">Product by</p>
          <p className="font-semibold">{product.store.name}</p>
          <Link href={`/shop/${product.store.username}`} className="text-cyan-400 text-sm inline-flex items-center gap-1">
            View Store <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProductDescription
