'use client'

import { Suspense, useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function ShopContent() {

  const searchParams = useSearchParams()
  const search = searchParams.get('search')

  const [stores, setStores] = useState([])

  // FETCH STORES FROM API
  useEffect(() => {
    const fetchStores = async () => {
      const res = await fetch('/api/store/all')
      const data = await res.json()
      setStores(data.stores)
    }

    fetchStores()
  }, [])

  /* FILTER STORES */
  const filteredStores = useMemo(() => {
    return stores.filter((store) =>
      search
        ? store.name?.toLowerCase().includes(search.toLowerCase())
        : true
    )
  }, [stores, search])

  return (
    <section className="min-h-screen bg-[#020617] text-white">

      {/* HEADER */}
      <div className="relative h-[28vh] pt-24 flex items-center justify-center border-b border-white/5">
        <div className="text-center">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-3"
          >
            ALL{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              SHOPS
            </span>
          </motion.h1>

          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase">
            Discover Stores
          </p>

        </div>
      </div>

      {/* SHOP GRID */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12">

        <p className="text-xs text-white/40 uppercase tracking-widest mb-8">
          {filteredStores.length} Shops Found
        </p>

        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-[1.04] transition cursor-pointer"
            >

              <div className="flex flex-col items-center text-center">

                <img
                  src={store.logo || '/store.png'}
                  alt={store.name}
                  className="w-16 h-16 object-cover rounded-full mb-4"
                />

                <h2 className="text-lg font-semibold text-white">
                  {store.name}
                </h2>

                <p className="text-xs text-white/40 mt-1">
                  {store.category || 'Local Store'}
                </p>

              </div>

            </div>
          ))}
        </motion.div>

      </div>

    </section>
  )
}

export default function Shops() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
          Loading...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}