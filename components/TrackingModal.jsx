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
  const statusHistory = order.statusHistory || {};

  const [lineHeight, setLineHeight] = useState(0);

  // AI CHAT STATE
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi 👋 I can help you with this order. Click a step or ask anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

  // SEND MESSAGE TO AI
  const sendMessage = async (content, stepContext = null) => {
    if (!content) return;

    const userMsg = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowChat(true);

    try {
      const res = await fetch("/api/ai/order-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          status: order.status,
          statusHistory: order.statusHistory,
          step: stepContext,
          messages: [...messages, userMsg],
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry 😕 something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
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
          className="relative w-full max-w-2xl bg-gradient-to-br from-[#0f172a] via-[#020617] to-black border border-white/10 rounded-2xl p-6 text-white"
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

          {/* TRACKING */}
          <div className="relative pl-5">
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-white/30 rounded-full" />

            {lineHeight > 0 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${getLineHeight()}%` }}
                transition={{ duration: 1 }}
                className="absolute left-4 top-0 w-1 bg-emerald-500 rounded-full"
              />
            )}

            {TRACKING_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const formattedDate = formatDateTime(
                statusHistory[step.key]
              );

              return (
                <motion.div
                  key={step.key}
                  onClick={() =>
                    sendMessage(`Explain the "${step.label}" status`, step.key)
                  }
                  className="flex items-center gap-4 mb-5 cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border
                      ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500"
                          : isActive
                          ? "bg-indigo-500 border-indigo-500 animate-pulse"
                          : "bg-white/10 border-white/20"
                      }
                    `}
                  >
                    <Icon size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="text-xs text-white/40">
                      {formattedDate || "Pending"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CHAT BUTTON */}
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full shadow-lg"
          >
            Need help?
          </button>

          {/* CHAT PANEL */}
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="fixed bottom-20 right-6 w-80 bg-[#020617] border border-white/10 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
                  <span className="text-sm font-semibold">Order Assistant</span>
                  <button onClick={() => setShowChat(false)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg max-w-[85%]
                        ${
                          msg.role === "user"
                            ? "ml-auto bg-indigo-600"
                            : "bg-white/10"
                        }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {loading && (
                    <p className="text-xs text-white/40">AI typing…</p>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                  className="flex border-t border-white/10"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your order..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  />
                  <button className="px-4 text-indigo-400">Send</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
