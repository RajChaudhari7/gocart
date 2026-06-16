'use client'

import Image from "next/image"
import { CreditCard } from "lucide-react"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

const OrderItem = ({
  order,
  mobile,
  onCancel,
  onVerifyOtp,
  onRate
}) => {

  const router = useRouter()

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  const { ratings } = useSelector(state => state.rating)

  const paymentLabel = {
    STRIPE: 'Card / Stripe',
    RAZORPAY: 'Razorpay',
    COD: 'Cash on Delivery',
    UPI: 'UPI',
  }[order.paymentMethod] || order.paymentMethod


  const isDelivered = order.status === 'DELIVERED'
  const isDeliveryInitiated = order.status === "DELIVERY_INITIATED"
  const isCanceled = order.status === 'CANCELLED'

  const isFinalState = isCanceled || isDelivered

  const canCancel =
    order.status !== "DELIVERED" &&
    order.status !== "CANCELLED"


  /* ---------------- DESKTOP ROW ---------------- */

  const DesktopRow = (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`hidden md:table-row 
        bg-gradient-to-r from-white/[0.04] to-white/[0.02]
        backdrop-blur-2xl border border-white/10 
        rounded-2xl hover:border-white/20 transition-all duration-300
        ${isFinalState ? 'opacity-60' : ''}`}
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
              <p className="text-sm text-white/60">
                {currency}{item.price} × {item.quantity}
              </p>
              <p className="text-xs text-white/40">
                {new Date(order.createdAt).toDateString()}
              </p>
            </div>

          </div>

        ))}

      </td>


      {/* TOTAL */}
      <td className="text-center font-semibold align-top">
        {currency}{order.total}
      </td>


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
      <td className="text-center align-top">
        <div className="flex flex-wrap justify-center gap-2">

          {!isCanceled && (
            <>
              {/* TRACK */}
              <button
                onClick={() => router.push(`/track/${order.id}`)}
                className="px-4 py-1.5 rounded-full text-sm bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 transition"
              >
                Track
              </button>

              {/* VERIFY OTP */}
              {isDeliveryInitiated && (
                <button
                  onClick={onVerifyOtp}
                  className="px-4 py-1.5 rounded-full text-sm 
            bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 
            hover:bg-emerald-500/25 transition"
                >
                  Verify OTP
                </button>
              )}

              {/* RATE */}
              {isDelivered && onRate && (
                <button
                  onClick={onRate}
                  className="px-4 py-1.5 rounded-full text-sm 
            bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 
            hover:bg-yellow-500/25 transition"
                >
                  ⭐ Rate
                </button>
              )}

              {/* CANCEL */}
              {canCancel && onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-1.5 rounded-full text-sm 
            bg-red-500/15 text-red-400 border border-red-500/30 
            hover:bg-red-500/25 transition"
                >
                  Cancel
                </button>
              )}
            </>
          )}

          {isCanceled && <span className="text-red-400 text-sm">Cancelled</span>}
          {isDelivered && (
            <span className="text-emerald-400 text-sm">Completed</span>
          )}
        </div>
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
      className={`rounded-2xl 
    bg-gradient-to-br from-white/[0.05] to-white/[0.02]
    backdrop-blur-2xl border border-white/10 
    p-5 space-y-5 shadow-lg
    ${isFinalState ? 'opacity-60' : ''}`}
    >

      {/* PRODUCTS */}
      {order.orderItems.map((item, idx) => (
        <div key={idx} className="flex gap-4">

          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
            <Image
              src={item.product.images[0]}
              alt={item.product.name}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>

          <div className="flex-1">
            <p className="font-medium text-white text-sm leading-tight">
              {item.product.name}
            </p>

            <p className="text-xs text-white/60 mt-1">
              {currency}{item.price} × {item.quantity}
            </p>

            <p className="text-[11px] text-white/40 mt-1">
              {new Date(order.createdAt).toDateString()}
            </p>
          </div>
        </div>
      ))}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2">

        {!isCanceled && (
          <>
            <button
              onClick={() => router.push(`/track/${order.id}`)}
              className="flex-1 min-w-[45%] px-4 py-2 rounded-full text-sm bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
            >
              Track
            </button>

            {isDeliveryInitiated && (
              <button
                onClick={onVerifyOtp}
                className="flex-1 min-w-[45%] px-4 py-2 rounded-full text-sm
              bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              >
                Verify OTP
              </button>
            )}

            {/* ⭐ FIXED: RATE BUTTON NOW IN MOBILE */}
            {isDelivered && onRate && (
              <button
                onClick={onRate}
                className="flex-1 min-w-[45%] px-4 py-2 rounded-full text-sm
              bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
              >
                ⭐ Rate
              </button>
            )}

            {canCancel && onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 min-w-[45%] px-4 py-2 rounded-full text-sm
              bg-red-500/15 text-red-400 border border-red-500/30"
              >
                Cancel
              </button>
            )}
          </>
        )}

        {isCanceled && <span className="text-red-400 text-sm">Cancelled</span>}
        {isDelivered && (
          <span className="text-emerald-400 text-sm">Completed</span>
        )}
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
    </>
  )
}

export default OrderItem