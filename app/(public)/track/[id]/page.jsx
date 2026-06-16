"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
    ClipboardList,
    CheckSquare,
    Box,
    Package,
    UserCheck,
    Store,
    ShoppingBag,
    Truck,
    MapPin,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

// ✅ UPDATED: All new tracking statuses in chronological order
const TRACKING_STEPS = [
    { key: "ORDER_PLACED", label: "Order Placed", icon: ClipboardList },
    { key: "ORDER_CONFIRMED", label: "Order Confirmed", icon: CheckSquare },
    { key: "ORDER_PACKING", label: "Packing Order", icon: Box },
    { key: "ORDER_PACKED", label: "Order Packed", icon: Package },
    { key: "DRIVER_ASSIGNED", label: "Driver Assigned", icon: UserCheck },
    { key: "REACHED_SHOP", label: "Driver Reached Shop", icon: Store },
    { key: "PICKED_UP", label: "Order Picked Up", icon: ShoppingBag },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
    { key: "DELIVERY_INITIATED", label: "Delivery Initiated", icon: MapPin },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

// ✅ UPDATED: Index mapper for the progress line animation
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
    const router = useRouter();
    const params = useParams();
    const { getToken } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lineHeight, setLineHeight] = useState(0);

    // Fetch the specific order using the ID from the URL
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get(`/api/orders/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrder(data.order);
            } catch (error) {
                toast.error(error?.response?.data?.error || "Failed to load order");
                router.push('/orders');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchOrder();
    }, [params.id]);

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
    const currentStep = order ? TRACK_INDEX[order.status] ?? 0 : 0;
    const statusHistory = order?.statusHistory || {};

    useEffect(() => {
        if (!loading && order) {
            const timer = setTimeout(() => {
                setLineHeight(currentStep);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentStep, loading, order]);

    const getLineHeight = () => {
        const stepHeight = 100 / (TRACKING_STEPS.length - 1);
        return lineHeight * stepHeight;
    };

    if (loading) return <Loading />;
    if (!order) return null;

    return (
        <section className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6 py-24">
            <div className="max-w-3xl mx-auto">

                {/* Page Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => router.push('/orders')}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Track Order</h1>
                        <p className="text-white/60 text-sm mt-1">Order ID: {order.id}</p>
                    </div>
                </div>

                {/* Tracking Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full bg-gradient-to-br from-[#020617] via-[#020617]/95 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="px-6 py-8 sm:px-8 space-y-8">

                        {/* 🛍 PRODUCTS */}
                        <div className="space-y-4">
                            {order.orderItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                                >
                                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center p-2">
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            width={48}
                                            height={48}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-lg">{item.product.name}</p>
                                        <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-lg font-semibold text-emerald-400">
                                        {currency}{item.price * item.quantity}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 💳 PAYMENT */}
                        <div className="flex items-center justify-between text-base p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-white/60">Payment Method</span>
                            <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 font-medium tracking-wide">
                                {order.paymentMethod}
                            </span>
                        </div>

                        {/* 🚚 DRIVER */}
                        {order.driver && (
                            <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                                <p className="text-sm text-white/50 mb-3">Delivery Partner</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-lg">{order.driver.name}</p>
                                        <a
                                            href={`tel:${order.driver.phone}`}
                                            className="text-base text-emerald-400 hover:underline mt-1 inline-block"
                                        >
                                            📞 {order.driver.phone}
                                        </a>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium">
                                        Assigned
                                    </span>
                                </div>
                            </div>
                        )}

                        <hr className="border-white/10" />

                        {/* 📍 TIMELINE */}
                        <div className="relative pl-6 pt-4 pb-2">
                            {/* base line */}
                            <div className="absolute left-4 top-4 bottom-8 w-[2px] bg-white/20"></div>

                            {/* animated line */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${getLineHeight()}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="absolute left-4 top-4 w-[2px] bg-emerald-500"
                            />

                            {TRACKING_STEPS.map((step, index) => {
                                const Icon = step.icon;
                                const isCompleted = index < currentStep;
                                const isActive = index === currentStep;
                                const updatedAt = statusHistory[step.key];
                                const formattedDate = formatDateTime(updatedAt);

                                return (
                                    <div key={step.key} className="flex gap-6 mb-8 last:mb-0">
                                        {/* ICON */}
                                        <div
                                            className={`
                                                relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors duration-300
                                                ${isCompleted ? "bg-emerald-500 border-emerald-500 text-black" : ""}
                                                ${isActive ? "bg-[#020617] border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : ""}
                                                ${!isCompleted && !isActive ? "bg-[#020617] border-white/20 text-white/40" : ""}
                                            `}
                                        >
                                            <Icon size={18} />
                                        </div>

                                        {/* TEXT */}
                                        <div className="-mt-1">
                                            <p className={`text-base font-semibold ${isCompleted || isActive ? "text-white" : "text-white/60"}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-sm text-white/40 mt-1">
                                                {formattedDate || "Pending"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
}