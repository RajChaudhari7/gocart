'use client'

import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"
import axios from "axios"
import toast from "react-hot-toast"

export default function StoreShop() {
  const { username } = useParams()
  const [products, setProducts] = useState([])
  const [storeInfo, setStoreInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStoreData = async () => {
    try {
      const { data } = await axios.get(`/api/store/data?username=${username}`)
      setStoreInfo(data.store)
      setProducts(data.store.Product)
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStoreData()
  }, [])

  if (loading) return <Loading />

  return (
    <section className="min-h-[70vh] px-4 sm:px-6 py-12 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white animate-fade-in">

      {/* STORE HEADER */}
      {storeInfo && (
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-white/10 to-white/5 
                        backdrop-blur-xl rounded-3xl p-6 sm:p-10 
                        flex flex-col md:flex-row items-center gap-8 
                        border border-white/10 shadow-2xl">

          {/* LOGO */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border border-white/20">
            <Image
              src={storeInfo.logo}
              alt={storeInfo.name}
              fill
              className="object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* INFO */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {storeInfo.name}
            </h1>

            <p className="text-slate-300 mt-4 max-w-xl mx-auto md:mx-0">
              {storeInfo.description}
            </p>

            <div className="mt-6 flex flex-col gap-3 text-slate-400 text-sm">
              {storeInfo.address && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MapPinIcon size={16} />
                  <span>{storeInfo.address}</span>
                </div>
              )}

              {storeInfo.email && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MailIcon size={16} />
                  <span>{storeInfo.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto mt-16">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">
          Shop Products
        </h2>

        {products.length === 0 ? (
          <p className="text-slate-400 text-center py-20">
            No products available
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                theme="dark"
                storeIsActive={product.store?.isActive === true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
