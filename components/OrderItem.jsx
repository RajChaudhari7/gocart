'use client'

import Image from "next/image"
import { CreditCard } from "lucide-react"
import { useSelector } from "react-redux"
import { useState } from "react"
import RatingModal from "./RatingModal"
import { motion, AnimatePresence } from "framer-motion"

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

  /* ---------------- DESKTOP ROW ---------------- */
  const DesktopRow = (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`hidden md:table-row bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${isCanceled ? 'opacity-50' : ''}`}
    >
      {/* PRODUCT */}
      <td className="py-6 pl-6 align-top">
        {order.orderItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 mb-4 last:mb-0">
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
              <p className="font-medium text-white">{item.product.name}</p>
              <p className="text-sm text-white/60">{currency}{item.price} × {item.quantity}</p>
              <p className="text-xs text-white/40">{new Date(order.createdAt).toDateString()}</p>
            </div>
          </div>
        ))}
      </td>

      {/* TOTAL */}
      <td className="text-center font-semibold align-top">{currency}{order.total}</td>

      {/* PAYMENT */}
      <td className="text-center align-top">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm">
          <CreditCard size={14} /> {paymentLabel}
        </div>
      </td>

      {/* ADDRESS */}
      <td className="text-white/60 max-w-xs align-top">
        <p className="font-medium text-white">{order.address.name}</p>
        <p>{order.address.city}, {order.address.state}</p>
      </td>

      {/* ACTION */}
      <td className="text-center align-top space-x-2">
        {!isCanceled && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTrack}
              className="px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 text-sm"
            >
              Track
            </motion.button>

            {!isDelivered && onCancel && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-4 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 text-sm"
              >
                Cancel
              </motion.button>
            )}
          </>
        )}

        {isCanceled && <span className="text-red-400 text-sm">Cancelled</span>}
        {isDelivered && <span className="text-emerald-400 text-sm">Completed</span>}
      </td>
    </motion.tr>
  )

  /* ---------------- MOBILE CARD ---------------- */
  const MobileCard = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-4 ${isCanceled ? 'opacity-50' : ''}`}
    >
      {order.orderItems.map((item, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="w-20 aspect-square bg-white/10 rounded-xl flex items-center justify-center">
            <Image
              src={item.product.images[0]}
              alt={item.product.name}
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">{item.product.name}</p>
            <p className="text-sm text-white/60">{currency}{item.price} × {item.quantity}</p>
            <p className="text-xs text-white/40">{new Date(order.createdAt).toDateString()}</p>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center">
        <span className="text-sm text-white/60">Payment</span>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs">
          <CreditCard size={12} /> {paymentLabel}
        </span>
      </div>

      <p className="text-sm text-white/60">{order.address.name}, {order.address.city}, {order.address.state}</p>

      <div className="flex gap-2">
        {!isCanceled && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTrack}
              className="flex-1 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-sm"
            >
              Track
            </motion.button>

            {!isDelivered && onCancel && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-sm"
              >
                Cancel
              </motion.button>
            )}
          </>
        )}

        {isCanceled && <span className="text-red-400 text-sm">Cancelled</span>}
        {isDelivered && <span className="text-emerald-400 text-sm">Completed</span>}
      </div>
    </motion.div>
  )

  return (
    <>
      <AnimatePresence mode="wait">
        {!mobile ? DesktopRow : (
          <tr className="md:hidden">
            <td colSpan={6}>{MobileCard}</td>
          </tr>
        )}
      </AnimatePresence>

      {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
    </>
  )
}

export default OrderItem
