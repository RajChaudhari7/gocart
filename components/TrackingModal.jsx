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
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-3 sm:px-6"
      >
        <motion.div
          initial={{ scale: 0.95, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}

          className="w-full max-w-2xl 
    max-h-[90vh] overflow-hidden 
    bg-gradient-to-br from-[#020617] via-[#020617]/95 to-black
    border border-white/10 
    rounded-2xl shadow-2xl text-white flex flex-col"
        >

          {/* 🔝 HEADER (sticky feel) */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 backdrop-blur-xl sticky top-0 bg-black/40 z-10">
            <h2 className="text-lg sm:text-xl font-semibold tracking-wide">
              Track Order
            </h2>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X />
            </button>
          </div>

          {/* 🔽 SCROLLABLE CONTENT */}
          <div className="overflow-y-auto px-5 py-4 space-y-6">

            {/* 🛍 PRODUCTS */}
            <div className="space-y-4">
              {order.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-white/60">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-emerald-400">
                    {currency}{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            {/* 💳 PAYMENT */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Payment</span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
                {order.paymentMethod}
              </span>
            </div>

            {/* 🚚 DRIVER */}
            {order.driver && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                <p className="text-xs text-white/50 mb-2">Delivery Partner</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.driver.name}</p>

                    <a
                      href={`tel:${order.driver.phone}`}
                      className="text-sm text-emerald-400 hover:underline"
                    >
                      📞 {order.driver.phone}
                    </a>
                  </div>

                  <span className="text-xs text-white/40">
                    Assigned
                  </span>
                </div>
              </div>
            )}

            {/* 📍 TIMELINE */}
            <div className="relative pl-6">
              {/* base line */}
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-white/20"></div>

              {/* animated line */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${getLineHeight()}%` }}
                transition={{ duration: 1 }}
                className="absolute left-4 top-0 w-[2px] bg-emerald-500"
              />

              {TRACKING_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                const updatedAt = statusHistory[step.key];
                const formattedDate = formatDateTime(updatedAt);

                return (
                  <div key={step.key} className="flex gap-4 mb-6">

                    {/* ICON */}
                    <div
                      className={`
                  w-9 h-9 flex items-center justify-center rounded-full border
                  ${isCompleted && "bg-emerald-500 border-emerald-500"}
                  ${isActive && "bg-indigo-500 border-indigo-500 animate-pulse"}
                  ${!isCompleted && !isActive && "bg-white/10 border-white/20"}
                `}
                    >
                      <Icon size={16} />
                    </div>

                    {/* TEXT */}
                    <div>
                      <p className={`text-sm font-medium 
                  ${isCompleted || isActive ? "text-white" : "text-white/60"}`}>
                        {step.label}
                      </p>

                      <p className="text-xs text-white/40">
                        {formattedDate || "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
