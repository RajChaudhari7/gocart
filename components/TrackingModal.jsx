'use client'

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  Package,
  Archive,
  Truck,
  MapPin,
  CheckCircle,
  X
} from "lucide-react"

const TRACKING_STEPS = [
  { key: 'CONFIRMED', label: 'Order Placed', icon: Package },
  { key: 'PACKED', label: 'Packed', icon: Archive },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

const TRACK_INDEX = {
  CONFIRMED: 0,
  PACKED: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
}

export default function TrackingModal({ order, onClose }) {
  if (!order) return null

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
  const currentStep = TRACK_INDEX[order.status] ?? 0

  // % height for animated line
  const progressPercent =
    (currentStep / (TRACKING_STEPS.length - 1)) * 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full max-w-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-black border border-white/10 rounded-2xl p-6 text-white"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Track Order</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              <X />
            </button>
          </div>

          {/* PRODUCTS */}
          <div className="space-y-4 mb-6">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
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
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-white/60">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-semibold">
                  {currency}{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          {/* PAYMENT */}
          <div className="flex items-center justify-between mb-8 text-sm">
            <span className="text-white/60">Payment Method</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
              {order.paymentMethod}
            </span>
          </div>

          {/* TRACKING TIMELINE */}
          <div className="relative pl-5">
            {/* Animated Gradient Progress Line */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute left-4 top-5 w-1 rounded-full origin-top
                         bg-gradient-to-b from-emerald-400 via-cyan-400 to-indigo-500
                         shadow-[0_0_12px_rgba(52,211,153,0.8)]"
            />

            {TRACKING_STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index < currentStep
              const isActive = index === currentStep

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 relative mb-6 last:mb-0"
                >
                  {/* Step circle with glow */}
                  <motion.div
                    initial={false}
                    animate={{
                      boxShadow:
                        isCompleted || isActive
                          ? '0 0 18px rgba(52,211,153,0.9)'
                          : '0 0 0 rgba(0,0,0,0)',
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border relative z-10
                      ${isCompleted
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                        : ''}
                      ${isActive
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-400'
                        : ''}
                      ${!isCompleted && !isActive
                        ? 'bg-white/10 border-white/20 text-white/40'
                        : ''}
                    `}
                  >
                    <Icon size={18} />
                  </motion.div>

                  {/* Step label */}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted || isActive
                          ? 'text-white'
                          : 'text-white/50'
                      }`}
                    >
                      {step.label}
                    </p>

                    {(isCompleted || isActive) && (
                      <span className="text-xs text-white/40">
                        Updated
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
