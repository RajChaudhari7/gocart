'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"
import Image from "next/image"
import { motion } from "framer-motion"
import { X } from "lucide-react"

export default function ReturnPage() {

  const { orderId } = useParams()
  const router = useRouter()
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
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-black text-white">

      {/* 🔝 HEADER */}
      <div className="sticky top-0 z-20 bg-black/70 backdrop-blur-xl border-b border-white/10">

        <div className="flex items-center justify-between px-4 py-4 max-w-4xl mx-auto">

          {/* CLOSE BUTTON */}
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X size={18} />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Return Products
            </h1>
            <p className="text-xs text-white/50">
              Select items to return
            </p>
          </div>

          {/* Spacer for balance */}
          <div className="w-8" />
        </div>
      </div>

      {/* 📦 ITEMS */}
      <div className="w-full max-w-4xl mx-auto px-4 py-5 space-y-4">

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
                flex gap-3 items-center p-4 rounded-xl border cursor-pointer
                transition-all duration-300 w-full
                ${isChecked
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-white/5 border-white/10 hover:bg-white/10"}
              `}
            >

              {/* CHECKBOX */}
              <div className={`
                min-w-[20px] h-5 rounded-md border flex items-center justify-center
                ${isChecked ? "bg-emerald-500 border-emerald-500" : "border-white/30"}
              `}>
                {isChecked && <span className="text-xs">✔</span>}
              </div>

              {/* IMAGE */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-lg flex items-center justify-center">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Qty: {item.quantity}
                </p>
              </div>

            </motion.div>
          )
        })}

      </div>

      {/* 🔻 STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-xl border-t border-white/10">

        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">

          <p className="text-xs sm:text-sm text-white/60">
            {selectedCount} selected
          </p>

          <button
            onClick={submitReturn}
            className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 transition text-sm font-medium"
          >
            Return
          </button>

        </div>
      </div>

      {/* SPACE FOR FOOTER */}
      <div className="h-20" />

    </div>
  )
}