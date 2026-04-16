'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import toast from "react-hot-toast"
import Image from "next/image"
import { X } from "lucide-react"

export default function ReturnPage() {

  const { orderId } = useParams()
  const router = useRouter()
  const { getToken } = useAuth()

  const [items, setItems] = useState([])
  const [selected, setSelected] = useState({})
  const [reason, setReason] = useState("")
  const [showReason, setShowReason] = useState(false)

  const reasons = [
    { label: "Damaged product", value: "DAMAGED" },
    { label: "Wrong item received", value: "WRONG_ITEM" },
    { label: "No longer needed", value: "NOT_NEEDED" },
    { label: "Quality not good", value: "QUALITY_ISSUE" },
  ]


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

    if (!reason) {
      toast.error("Please select reason")
      return
    }

    const token = await getToken()

    await axios.post("/api/return/create", {
      orderId,
      products,
      reason
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    toast.success("OTP sent to your email")

    setStep("SUCCESS")
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  if (step === "SUCCESS") {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center text-center px-6">

        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <span className="text-3xl">✅</span>
        </div>

        <h2 className="text-xl font-semibold mb-2">
          Return Request Submitted
        </h2>

        <p className="text-sm text-white/60 mb-6">
          Seller will verify your OTP and process the return.
        </p>

        <button
          onClick={() => router.push("/orders")}
          className="px-6 py-2 rounded-full bg-emerald-600"
        >
          Go to Orders
        </button>

      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black text-white overflow-y-auto">

      {/* ❌ CLOSE BUTTON (FORCED FIXED) */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-[1000] p-3 rounded-full bg-white/10 backdrop-blur-md"
      >
        <X size={18} />
      </button>

      {/* HEADER */}
      <div className="pt-16 px-4 pb-4">
        <h1 className="text-xl font-semibold">Return Products</h1>
        <p className="text-sm text-white/50">Select items to return</p>
      </div>

      {/* ITEMS */}
      <div className="px-4 space-y-3 pb-24">

        {items.map((item) => {
          const isChecked = selected[item.productId]

          return (
            <div
              key={item.productId}
              onClick={() => toggleItem(item.productId)}
              className={`
                flex gap-3 items-center p-3 rounded-xl border w-full
                ${isChecked
                  ? "bg-emerald-500/10 border-emerald-500"
                  : "bg-white/5 border-white/10"}
              `}
            >

              {/* CHECK */}
              <div className={`w-5 h-5 rounded border flex items-center justify-center
                ${isChecked ? "bg-emerald-500" : "border-white/30"}`}>
                {isChecked && "✓"}
              </div>

              {/* IMAGE */}
              <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={40}
                  height={40}
                />
              </div>

              {/* TEXT */}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {item.product.name}
                </p>
                <p className="text-xs text-white/50">
                  Qty: {item.quantity}
                </p>
              </div>

            </div>
          )
        })}

        {step === "SELECT" && (
          <div className="mt-6 relative">
            <p className="text-sm text-white/60 mb-2">Select reason</p>

            {/* BUTTON */}
            <div
              onClick={() => setShowReason(!showReason)}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-sm cursor-pointer flex justify-between"
            >
              <span className={reason ? "text-white" : "text-white/40"}>
                {reason
                  ? reasons.find(r => r.value === reason)?.label
                  : "Choose reason"}
              </span>

              <span>⌄</span>
            </div>

            {/* DROPDOWN */}
            {showReason && (
              <div className="absolute z-50 mt-2 w-full bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden shadow-xl">

                {reasons.map((r) => (
                  <div
                    key={r.value}
                    onClick={() => {
                      setReason(r.value)
                      setShowReason(false)
                    }}
                    className="px-4 py-3 text-sm hover:bg-white/10 cursor-pointer"
                  >
                    {r.label}
                  </div>
                ))}

              </div>
            )}
          </div>
        )}

      </div>



      {/* 🔻 FIXED RETURN BUTTON (ALWAYS VISIBLE) */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-black border-t border-white/10 p-4">

        <div className="flex items-center justify-between">

          <p className="text-sm text-white/60">
            {selectedCount} selected
          </p>

          <button
            onClick={submitReturn}
            disabled={!selectedCount || !reason}
            className={`px-6 py-2 rounded-full text-sm
    ${selectedCount && reason
                ? "bg-red-600"
                : "bg-gray-600 cursor-not-allowed"}
  `}
          >
            Return
          </button>

        </div>

      </div>

    </div>
  )
}