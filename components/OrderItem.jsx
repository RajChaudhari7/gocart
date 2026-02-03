'use client'

import Image from "next/image"
import { CreditCard, CheckCircle, Truck, Package, Circle } from "lucide-react"
import { useSelector } from "react-redux"
import Rating from "./Rating"
import { useState } from "react"
import RatingModal from "./RatingModal"
import { motion, AnimatePresence } from "framer-motion"

const STATUS_FLOW = [
  { key: 'PLACED', label: 'Placed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

const statusConfig = {
  CONFIRMED: 'PLACED',
  PLACED: 'PLACED',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
}

const badgeConfig = {
  PLACED: 'text-yellow-400 bg-yellow-400/15 border-yellow-400/30',
  SHIPPED: 'text-cyan-400 bg-cyan-400/15 border-cyan-400/30',
  OUT_FOR_DELIVERY: 'text-indigo-400 bg-indigo-400/15 border-indigo-400/30',
  DELIVERED: 'text-emerald-400 bg-emerald-400/15 border-emerald-400/30',
  CANCELLED: 'text-red-400 bg-red-400/15 border-red-400/30',
}

const OrderItem = ({ order, mobile, onCancel }) => {
  // ✅ BUILD SAFE GUARD
  if (!order) return null

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const [ratingModal, setRatingModal] = useState(null)
  const { ratings = [] } = useSelector(state => state.rating || {})

  const paymentLabel = {
    STRIPE: 'Card / Stripe',
    RAZORPAY: 'Razorpay',
    COD: 'Cash on Delivery',
    UPI: 'UPI',
  }[order.paymentMethod] || order.paymentMethod || 'N/A'

  const normalizedStatus =
    statusConfig[order.status] || 'PLACED'

  const isDelivered = normalizedStatus === 'DELIVERED'
  const isCanceled = normalizedStatus === 'CANCELLED'

  const currentStepIndex = STATUS_FLOW.findIndex(
    s => s.key === normalizedStatus
  )

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <tr className="hidden md:table-row bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">

        {/* PRODUCT */}
        <td className="py-6 pl-6 align-top">
          <div className="flex flex-col gap-6">
            {(order.orderItems || []).map((item, index) => {
              const existingRating = ratings.find(
                r => r.orderId === order.id && r.productId === item?.product?.id
              )

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 aspect-square bg-white/10 rounded-xl flex items-center justify-center">
                    <Image
                      src={item?.product?.images?.[0] || '/placeholder.png'}
                      alt={item?.product?.name || 'Product'}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      {item?.product?.name}
                    </p>
                    <p className="text-sm text-white/60">
                      {currency}{item?.price} × {item?.quantity}
                    </p>
                    <p className="text-xs text-white/40">
                      {order.createdAt
                        ? new Date(order.createdAt).toDateString()
                        : ''}
                    </p>

                    {existingRating ? (
                      <Rating value={existingRating.rating} />
                    ) : (
                      isDelivered && (
                        <button
                          onClick={() =>
                            setRatingModal({
                              orderId: order.id,
                              productId: item?.product?.id,
                            })
                          }
                          className="text-emerald-400 text-sm hover:underline"
                        >
                          Rate Product
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </td>

        {/* TOTAL */}
        <td className="text-center font-semibold align-top">
          {currency}{order.total || 0}
        </td>

        {/* PAYMENT */}
        <td className="text-center align-top">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm">
            <CreditCard size={14} />
            {paymentLabel}
          </div>
        </td>

        {/* ADDRESS */}
        <td className="text-white/60 max-w-xs align-top">
          <p className="font-medium text-white">
            {order.address?.name}
          </p>
          <p>
            {order.address?.city}, {order.address?.state}
          </p>
        </td>

        {/* ===== LIVE STATUS TIMELINE ===== */}
        <td className="align-top">
          <div className="flex items-center gap-3">
            {STATUS_FLOW.map((step, idx) => {
              const Icon = step.icon
              const isActive = idx <= currentStepIndex

              return (
                <div key={step.key} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border
                      ${isActive
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-white/10 border-white/20 text-white/40'
                      }`}
                  >
                    <Icon size={16} />
                  </div>

                  {idx < STATUS_FLOW.length - 1 && (
                    <div
                      className={`w-8 h-[2px]
                        ${isActive ? 'bg-emerald-400' : 'bg-white/20'}`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div
            className={`mt-2 inline-flex px-4 py-1.5 rounded-full text-xs border ${badgeConfig[normalizedStatus]}`}
          >
            {normalizedStatus.replace(/_/g, ' ')}
          </div>
        </td>

        {/* ACTION */}
        <td className="text-center align-top">
          {!isCanceled && onCancel && !isDelivered && (
            <button
              onClick={onCancel}
              className="px-4 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition text-sm"
            >
              Cancel
            </button>
          )}

          {isDelivered && (
            <span className="text-emerald-400 text-sm">
              Completed
            </span>
          )}
        </td>
      </tr>

      {ratingModal && (
        <RatingModal
          ratingModal={ratingModal}
          setRatingModal={setRatingModal}
        />
      )}
    </>
  )
}

export default OrderItem
