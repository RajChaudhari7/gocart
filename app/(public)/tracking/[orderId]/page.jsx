"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
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

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-white/50 bg-white/5 animate-pulse">Loading Live Map...</div>
});

export default function TrackingPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { getToken } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lineHeight, setLineHeight] = useState(0);

    // Real-time driver location state
    const [driverLocation, setDriverLocation] = useState(null);

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

    // Fetch Order Data
    useEffect(() => {

        if (!orderId) return;

        let interval;

        const fetchOrderDetails = async (showLoader = false) => {

            try {

                if (showLoader) {
                    setLoading(true);
                }

                const token = await getToken();

                const { data } = await axios.get(
                    `/api/orders/${orderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setOrder(data.order || data);

            } catch (error) {

                console.log(error);

            } finally {

                if (showLoader) {
                    setLoading(false);
                }

            }

        };

        // Initial Load
        fetchOrderDetails(true);

        // Refresh every 5 seconds
        interval = setInterval(() => {

            fetchOrderDetails(false);

        }, 5000);

        return () => clearInterval(interval);

    }, [orderId, getToken]);

    useEffect(() => {

        if (!order?.driver?.id) return;

        if (!order.driver.latitude) return;

        setDriverLocation({
            lat: order.driver.latitude,
            lng: order.driver.longitude
        });

    }, [order]);


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

                        {/* OTP Block - Visible ONLY when Delivery is Initiated */}
                        {order.status === "DELIVERY_INITIATED" && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse"></div>
                                <p className="text-xs text-emerald-300/70 mb-2 uppercase tracking-wider font-semibold">Delivery Verification Code</p>

                                <div className="text-3xl md:text-4xl font-bold tracking-[0.25em] text-white bg-black/40 py-4 rounded-xl border border-emerald-500/30">
                                    {order.deliveryOtp?.length === 6 ? order.deliveryOtp : "CHECK EMAIL"}
                                </div>

                                <p className="text-xs text-white/50 mt-3">Share this code with the driver to receive your package.</p>
                            </div>
                        )}

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

                                {/* Order Summary */}
                                <div className="mt-6 border-t border-white/10 pt-4 space-y-3">

                                    <div className="flex justify-between text-white/60">
                                        <span>Products Total</span>
                                        <span>
                                            {currency}
                                            {(order.total - (order.deliveryFee || 0)).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-white/60">
                                        <span>Delivery Fee</span>
                                        <span>
                                            {currency}
                                            {(order.deliveryFee || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-lg font-bold text-emerald-400 border-t border-white/10 pt-3">
                                        <span>Total Paid</span>
                                        <span>
                                            {currency}
                                            {order.total.toFixed(2)}
                                        </span>
                                    </div>

                                </div>
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

                        {/* Driver Details Card */}
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

                    {/* RIGHT COLUMN: Map & Timeline */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* LIVE MAP WIDGET */}
                        {driverLocation && order.status !== "DELIVERED" && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden backdrop-blur-xl shadow-2xl h-[350px] relative z-0">

                                <LiveMap
                                    driverLocation={driverLocation}
                                    customerLocation={{
                                        lat: order.address?.latitude || order.store?.latitude,
                                        lng: order.address?.longitude || order.store?.longitude
                                    }}
                                />

                                {/* Floating Status Badge */}
                                <div className="absolute top-5 left-5 bg-black/80 text-emerald-400 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg z-[1000]">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Live Navigation
                                </div>
                            </div>
                        )}
                        {/* TIMELINE */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative">
                            <h2 className="text-lg font-semibold mb-8 border-b border-white/10 pb-4">Tracking Timeline</h2>

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
                          w-10 h-10 flex items-center justify-center rounded-full border-2 relative z-10 -ml-5 shadow-lg bg-[#020617]
                          ${isCompleted ? "border-emerald-400 text-emerald-400" : ""}
                          ${isActive ? "border-indigo-400 text-indigo-400 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]" : ""}
                          ${!isCompleted && !isActive ? "border-white/20 text-white/40" : ""}
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
                                                    {formattedDate || (isCompleted ? "Completed" : isActive ? "In Progress..." : "Pending update...")}
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