"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  Package,
  Archive,
  Truck,
  MapPin,
  CheckCircle,
  ArrowLeft,
  CreditCard
} from "lucide-react";
import Loading from "@/components/Loading";

const TRACKING_STEPS = [
  { key: "ORDER_PLACED", label: "Order Placed", icon: Package },
  { key: "ORDER_CONFIRMED", label: "Order Confirmed", icon: CheckCircle },
  { key: "ORDER_PACKING", label: "Order Packing", icon: Archive },
  { key: "ORDER_PACKED", label: "Order Packed", icon: Archive },
  { key: "DRIVER_ASSIGNED", label: "Driver Assigned", icon: Truck },
  { key: "REACHED_SHOP", label: "Driver Reached Shop", icon: MapPin },
  { key: "PICKED_UP", label: "Order Picked Up", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out For Delivery", icon: Truck },
  { key: "DELIVERY_INITIATED", label: "Delivery Initiated", icon: MapPin },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

const TRACK_INDEX = {
  ORDER_PLACED: 0,
  ORDER_CONFIRMED: 1,
  ORDER_PACKING: 2,
  ORDER_PACKED: 3,
  DRIVER_ASSIGNED: 4,
  REACHED_SHOP: 5,
  PICKED_UP: 6,
  OUT_FOR_DELIVERY: 7,
  DELIVERY_INITIATED: 8,
  DELIVERED: 9,
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

export default function TrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineHeight, setLineHeight] = useState(0);

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        
        // Ensure you have an endpoint that accepts a single orderId 
        // Example: /api/orders/[id] OR /api/orders?orderId=...
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setOrder(data.order || data);
      } catch (error) {
        toast.error("Failed to load tracking data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, getToken]);

  const currentStep = order ? (TRACK_INDEX[order.status] ?? 0) : 0;
  const statusHistory = order?.statusHistory || {};

  useEffect(() => {
    if (!order) return;
    const timer = setTimeout(() => {
      setLineHeight(currentStep);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep, order]);

  const getLineHeight = () => {
    const stepHeight = 100 / (TRACKING_STEPS.length - 1);
    return lineHeight * stepHeight;
  };

  if (loading) return <Loading />;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-white">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6 py-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Back Button */}
        <div className="mb-10">
          <button 
            onClick={() => router.push('/orders')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition mb-6 w-fit"
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">Track Your Order</h1>
          <p className="text-white/50 mt-2">Order ID: {order.id}</p>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Order Details & Driver */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Products Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-4">Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base leading-tight">{item.product.name}</p>
                      <p className="text-xs text-white/60 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">
                      {currency}{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Payment Summary */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="text-white/60 flex items-center gap-2">
                  <CreditCard size={16} /> Payment
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  {order.paymentMethod}
                </span>
              </div>
            </div>

            {/* Driver Details Card (If Assigned) */}
            {order.driver && order.driverAccepted && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                <p className="text-xs text-indigo-300/70 mb-3 uppercase tracking-wider font-semibold">Assigned Delivery Partner</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">{order.driver.name}</p>
                    <a
                      href={`tel:${order.driver.phone}`}
                      className="text-sm text-indigo-400 hover:text-indigo-300 mt-1 inline-flex items-center gap-2"
                    >
                      📞 {order.driver.phone}
                    </a>
                  </div>
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/40">
                    <Truck size={20} className="text-indigo-400" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative h-full">
              <h2 className="text-lg font-semibold mb-8 border-b border-white/10 pb-4">Live Tracking Timeline</h2>
              
              <div className="relative pl-6">
                {/* Static Base Line */}
                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-white/10"></div>

                {/* Animated Progress Line */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${getLineHeight()}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute left-4 top-0 w-[2px] bg-emerald-500"
                />

                {/* Timeline Steps */}
                {TRACKING_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStep;
                  const isActive = index === currentStep;
                  const updatedAt = statusHistory[step.key];
                  const formattedDate = formatDateTime(updatedAt);

                  return (
                    <div key={step.key} className="flex gap-6 mb-8 last:mb-0 relative">
                      {/* Icon */}
                      <div
                        className={`
                          w-10 h-10 flex items-center justify-center rounded-full border-2 relative z-10 -ml-5 shadow-lg
                          ${isCompleted ? "bg-emerald-500 border-emerald-400 text-black" : ""}
                          ${isActive ? "bg-indigo-500 border-indigo-400 text-white animate-pulse" : ""}
                          ${!isCompleted && !isActive ? "bg-[#020617] border-white/20 text-white/40" : ""}
                        `}
                      >
                        <Icon size={18} />
                      </div>

                      {/* Text Context */}
                      <div className="pt-2">
                        <p className={`text-base font-semibold tracking-wide
                          ${isCompleted || isActive ? "text-white" : "text-white/40"}`}>
                          {step.label}
                        </p>
                        <p className={`text-sm mt-1 ${isCompleted || isActive ? "text-white/60" : "text-white/30"}`}>
                          {formattedDate || "Pending update..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}