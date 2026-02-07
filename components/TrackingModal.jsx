"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Package,
  Archive,
  Truck,
  MapPin,
  CheckCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const TRACKING_STEPS = [
  { key: "ORDER_PLACED", label: "Order Placed", icon: Package },
  { key: "PACKED", label: "Packed", icon: Archive },
  { key: "PROCESSING", label: "Processing", icon: Archive },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery", icon: MapPin },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

const TRACK_INDEX = {
  ORDER_PLACED: 0,
  PACKED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TrackingModal({ order, onClose }) {
  if (!order) return null;

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
  const currentStep = TRACK_INDEX[order.status] ?? 0;
  const [lineHeight, setLineHeight] = useState(0);

  const statusHistory = order.statusHistory || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setLineHeight(currentStep);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const getLineHeight = () => {
    const stepHeight = 100 / (TRACKING_STEPS.length - 1);
    return lineHeight * stepHeight;
  };

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
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-full max-w-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-black border border-white/10 rounded-2xl p-6 text-white"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Track Order</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
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
                  <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                </div>

                <p className="text-sm font-semibold">
                  {currency}
                  {item.price * item.quantity}
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
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-white/30 rounded-full"></div>

            {lineHeight > 0 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${getLineHeight()}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute left-4 top-0 w-1 bg-emerald-500 rounded-full"
              />
            )}

            {TRACKING_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;

              const updatedAt = statusHistory[step.key];
              const formattedDate = formatDateTime(updatedAt);

              const stepCircleClasses = `
                flex items-center justify-center w-10 h-10 rounded-full border relative z-10
                ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                ${isActive ? "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse" : ""}
                ${!isCompleted && !isActive ? "bg-white/10 border-white/20 text-white/40" : ""}
              `;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-4 relative mb-5 last:mb-0"
                  style={{ minHeight: "55px" }}
                >
                  <div className={stepCircleClasses}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted || isActive ? "text-white" : "text-white/70"
                      }`}
                    >
                      {step.label}
                    </p>

                    {formattedDate ? (
                      <span className="text-xs text-white/40">
                        {formattedDate}
                      </span>
                    ) : (
                      <span className="text-xs text-white/30 italic">
                        Pending
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
