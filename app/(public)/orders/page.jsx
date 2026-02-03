'use client'

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { IndianRupee, CreditCard, Truck, CheckCircle, XCircle } from "lucide-react"

const statusConfig = {
  PLACED: {
    label: "Order Placed",
    color: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    icon: Truck,
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle,
  },
  CANCELED: {
    label: "Canceled",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: XCircle,
  },
}

export default function OrderItem({ order, onCancel, mobile = false }) {
  const status = statusConfig[order.status] || statusConfig.PLACED
  const StatusIcon = status.icon

  if (mobile) {
    // MOBILE CARD VIEW
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex gap-4">
          <Image
            src={order.product.image}
            alt={order.product.title}
            width={70}
            height={70}
            className="rounded-xl object-cover"
          />

          <div className="flex-1">
            <h3 className="font-semibold leading-tight">
              {order.product.title}
            </h3>
            <p className="text-sm text-white/50">
              ₹{order.product.price} × {order.quantity}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold">
                ₹{order.total}
              </span>

              <StatusBadge status={status} StatusIcon={StatusIcon} />
            </div>

            <div className="mt-3 flex justify-end">
              {order.status !== 'DELIVERED' && (
                <button
                  onClick={onCancel}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // DESKTOP ROW VIEW
  return (
    <tr className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
      {/* PRODUCT */}
      <td className="pl-6 py-5">
        <div className="flex items-center gap-4">
          <Image
            src={order.product.image}
            alt={order.product.title}
            width={64}
            height={64}
            className="rounded-xl object-cover"
          />
          <div>
            <p className="font-semibold">{order.product.title}</p>
            <p className="text-sm text-white/50">
              ₹{order.product.price} × {order.quantity}
            </p>
            <p className="text-xs text-white/40">
              {new Date(order.createdAt).toDateString()}
            </p>
          </div>
        </div>
      </td>

      {/* TOTAL */}
      <td className="text-center font-semibold">
        ₹{order.total}
      </td>

      {/* PAYMENT (FIXED ALIGNMENT) */}
      <td className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10">
          <CreditCard size={14} />
          <span className="text-sm">Cash on Delivery</span>
        </div>
      </td>

      {/* ADDRESS */}
      <td>
        <div className="text-sm leading-relaxed">
          <p className="font-medium">{order.address.name}</p>
          <p className="text-white/60">
            {order.address.city}, {order.address.state}
          </p>
        </div>
      </td>

      {/* STATUS (ANIMATED) */}
      <td className="text-center">
        <StatusBadge status={status} StatusIcon={StatusIcon} />
      </td>

      {/* ACTION */}
      <td className="text-center">
        {order.status !== 'DELIVERED' ? (
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition"
          >
            Cancel
          </button>
        ) : (
          <span className="text-emerald-400 text-sm">Completed</span>
        )}
      </td>
    </tr>
  )
}

/* ---------------- PREMIUM STATUS BADGE ---------------- */

function StatusBadge({ status, StatusIcon }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status.label}
        initial={{ opacity: 0, y: 6, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${status.color}`}
      >
        <StatusIcon size={14} />
        {status.label}
      </motion.div>
    </AnimatePresence>
  )
}
