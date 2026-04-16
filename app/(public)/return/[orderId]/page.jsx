'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"
import Image from "next/image"
import { motion } from "framer-motion"

export default function ReturnPage() {

  const { orderId } = useParams()
  const { getToken } = useAuth()

  const [items, setItems] = useState([])
  const [selected, setSelected] = useState({})

  const fetchOrder = async () => {
    const token = await getToken()

    const { data } = await axios.get(`/api/return/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    setItems(data.items)
  }

  useEffect(() => {
    fetchOrder()
  }, [])

  const toggleItem = (id) => {
    setSelected(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const submitReturn = async () => {
    const products = Object.keys(selected).filter(k => selected[k])

    if (!products.length) {
      toast.error("Select at least one product")
      return
    }

    const token = await getToken()

    await axios.post("/api/return/create", {
      orderId,
      products
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    toast.success("OTP sent to your email")
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-black text-white px-4 sm:px-6 py-8">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Return Products
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Select items you want to return
        </p>
      </div>

      {/* ITEMS */}
      <div className="max-w-4xl mx-auto space-y-4">

        {items.map((item, idx) => {
          const isChecked = selected[item.productId]

          return (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => toggleItem(item.productId)}
              className={`
                flex gap-4 items-center p-4 rounded-2xl border cursor-pointer
                transition-all duration-300
                ${isChecked
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-white/5 border-white/10 hover:bg-white/10"}
              `}
            >

              {/* CHECKBOX */}
              <div className={`
                w-5 h-5 rounded-md border flex items-center justify-center
                ${isChecked ? "bg-emerald-500 border-emerald-500" : "border-white/30"}
              `}>
                {isChecked && <span className="text-xs">✔</span>}
              </div>

              {/* IMAGE */}
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>

              {/* INFO */}
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">
                  {item.product.name}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Quantity: {item.quantity}
                </p>
              </div>

            </motion.div>
          )
        })}

      </div>

      {/* STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-4">

        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">

          <p className="text-sm text-white/60">
            {selectedCount} item{selectedCount !== 1 && "s"} selected
          </p>

          <button
            onClick={submitReturn}
            className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 transition text-sm font-medium"
          >
            Return Selected
          </button>

        </div>
      </div>

    </div>
  )
}