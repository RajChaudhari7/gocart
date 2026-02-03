'use client'

import Image from "next/image"
import {
  CreditCard,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useSelector } from "react-redux"
import Rating from "./Rating"
import { useState } from "react"
import RatingModal from "./RatingModal"
import { motion, AnimatePresence } from "framer-motion"

/* ---------------- STATUS TIMELINE CONFIG ---------------- */

const TIMELINE_STEPS = [
  { key: 'CONFIRMED', label: 'Placed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

const STATUS_INDEX = {
  CONFIRMED: 0,
  SHIPPED: 1,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
}

/* ---------------- MAIN COMPONENT ---------------- */

const OrderItem = ({ order, mobile, onCancel, onTrack }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const [ratingModal, setRatingModal] = useState(null)
  const { ratings } = useSelector(state => state.rating)

  const paymentLabel = {
    STRIPE: 'Card / Stripe',
    RAZORPAY: 'Razorpay',
    COD: 'Cash on Delivery',
    UPI: 'UPI',
  }[order.paymentMethod] || order.paymentMethod

  const isDelivered = order.status === 'DELIVERED'
  const isCanceled = order.status === 'CANCELLED'

  const currentStep = isCanceled
    ? -1
    : (STATUS_INDEX[order.status] ?? 0)

  /* ---------------- DESKTOP ROW ---------------- */
  const DesktopRow = (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        filter: isCanceled ? 'grayscale(100%)' : 'grayscale(0%)',
      }}
      transition={{ duration: 0.4 }}
      className={`hidden md:table-row bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
        ${isCanceled ? 'opacity-60' : ''}`}
    >
      {/* PRODUCT */}
      <td className="py-6 pl-6 align-top">
        <div className="flex flex-col gap-6">
          {order.orderItems.map((item, index) => {
            const existingRating = ratings.find(
              r => r.orderId === order.id && r.productId === item.product.id
            )

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 aspect-square bg-white/10 rounded-xl flex items-center justify-center">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>

                <div>
                  <p className="font-medium text-white">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-white/60">
                    {currency}{item.price} × {item.quantity}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(order.createdAt).toDateString()}
                  </p>

                  <div className="mt-1">
                    {existingRating ? (
                      <Rating value={existingRating.rating} />
                    ) : (
                      isDelivered && !isCanceled && (
                        <button
                          onClick={() =>
                            setRatingModal({
                              orderId: order.id,
                              productId: item.product.id,
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
              </div>
            )
          })}
        </div>
      </td>

      {/* TOTAL */}
      <td className="text-center font-semibold align-top">
        {currency}{order.total}
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
          {order.address.name}
        </p>
        <p>
          {order.address.city}, {order.address.state}
        </p>
      </td>

      {/* STATUS */}
      <td className="align-top">
        <StatusTimeline
          currentStep={currentStep}
          isCanceled={isCanceled}
        />
      </td>

      {/* ACTION */}
      <td className="text-center align-top">
        {!isCanceled && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTrack}
            className="ml-2 px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 transition text-sm"
          >
            Track
          </motion.button>
        )}

        {!isCanceled && onCancel && !isDelivered && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-4 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition text-sm"
          >
            Cancel
          </motion.button>
        )}

        {isDelivered && (
          <span className="text-emerald-400 text-sm">
            Completed
          </span>
        )}
      </td>
    </motion.tr>
  )

  /* ---------------- MOBILE CARD ---------------- */
  const MobileCard = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        filter: isCanceled ? 'grayscale(100%)' : 'grayscale(0%)',
      }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-4
        ${isCanceled ? 'opacity-60' : ''}`}
    >
      {order.orderItems.map((item, idx) => (
        <div
          key={idx}
          className="border-b border-white/10 pb-3 mb-3 last:border-none last:pb-0 last:mb-0"
        >
          <div className="w-20 aspect-square bg-white/10 rounded-xl flex items-center justify-center mb-2">
            <Image
              src={item.product.images[0]}
              alt={item.product.name}
              width={56}
              height={56}
              className="object-contain"
            />
          </div>

          <p className="text-sm font-medium text-white">
            {item.product.name}
          </p>
          <p className="text-xs text-white/60">
            {currency}{item.price} × {item.quantity}
          </p>
        </div>
      ))}

      <StatusTimeline
        currentStep={currentStep}
        mobile
        isCanceled={isCanceled}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Payment</span>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs">
          <CreditCard size={12} />
          {paymentLabel}
        </span>
      </div>

      <p className="text-sm text-white/60">
        {order.address.name}, {order.address.city}, {order.address.state}
      </p>

      {!isCanceled && (
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTrack}
            className="px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-sm"
          >
            Track Order
          </motion.button>

          {!isDelivered && onCancel && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="px-4 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-sm"
            >
              Cancel
            </motion.button>
          )}
        </div>
      )}

    </motion.div>
  )

  return (
    <>
      <AnimatePresence mode="wait">
        {!mobile ? DesktopRow : (
          <tr className="md:hidden">
            <td colSpan={6} className="py-6">
              {MobileCard}
            </td>
          </tr>
        )}
      </AnimatePresence>

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

/* ---------------- STATUS TIMELINE ---------------- */

function StatusTimeline({ currentStep = 0, mobile = false, isCanceled = false }) {
  if (isCanceled) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-8 rounded-full bg-red-500/20 border border-red-500 text-red-400">
          <XCircle size={16} />
        </div>
        <span className="text-sm text-red-400 font-medium">
          Order Cancelled
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${mobile ? 'flex-col gap-4' : 'items-center gap-2'}`}>
      {TIMELINE_STEPS.map((step, index) => {
        const Icon = step.icon
        const isCompleted = index < currentStep
        const isActive = index === currentStep

        return (
          <div key={step.key} className="flex items-center">
            <motion.div
              initial={false}
              animate={{ scale: isActive ? 1.1 : 1 }}
              className={`
                flex items-center justify-center size-8 rounded-full border
                ${isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : ''}
                ${isActive ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]' : ''}
                ${!isCompleted && !isActive ? 'bg-white/10 border-white/20 text-white/40' : ''}
              `}
            >
              <Icon size={16} />
            </motion.div>

            <span
              className={`
                ml-2 mr-3 text-xs whitespace-nowrap
                ${isCompleted || isActive ? 'text-white' : 'text-white/40'}
              `}
            >
              {step.label}
            </span>

            {index < TIMELINE_STEPS.length - 1 && !mobile && (
              <div
                className={`
                  h-[2px] w-8
                  ${isCompleted ? 'bg-emerald-400' : 'bg-white/20'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
