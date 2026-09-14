"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    Calendar,
    CreditCard,
    MapPin,
    Package,
    Star,
    Truck,
    XCircle,
    Store,
    AlertTriangle,
    X,
} from "lucide-react";

import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

const STATUS_COLOR = {
    ORDER_PLACED:
        "bg-blue-50 text-blue-700 border-blue-200",

    ORDER_CONFIRMED:
        "bg-indigo-50 text-indigo-700 border-indigo-200",

    ORDER_PACKING:
        "bg-amber-50 text-amber-700 border-amber-200",

    ORDER_PACKED:
        "bg-orange-50 text-orange-700 border-orange-200",

    DRIVER_ASSIGNED:
        "bg-cyan-50 text-cyan-700 border-cyan-200",

    REACHED_SHOP:
        "bg-purple-50 text-purple-700 border-purple-200",

    PICKED_UP:
        "bg-sky-50 text-sky-700 border-sky-200",

    OUT_FOR_DELIVERY:
        "bg-pink-50 text-pink-700 border-pink-200",

    DELIVERY_INITIATED:
        "bg-emerald-50 text-emerald-700 border-emerald-200",

    DELIVERED:
        "bg-green-50 text-green-700 border-green-200",

    CANCELLED:
        "bg-red-50 text-red-700 border-red-200",
};

export default function OrderCard({
    order,
    onTrack,
    onRate,
    onRefresh,
}) {
    const { getToken } = useAuth();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const cancelOrder = async () => {
        if (order.status === "DELIVERED") return;

        setIsCancelling(true);

        try {
            const token = await getToken();

            await axios.post(
                "/api/orders/cancel",
                {
                    orderId: order.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setShowCancelModal(false);

            toast.success("Order cancelled successfully");

            onRefresh();
        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                err.message ||
                "Unable to cancel order"
            );
        } finally {
            setIsCancelling(false);
        }
    };

    const statusLabel = order.status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.3,
            }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
        >
            {/* ================= HEADER ================= */}

            <div className="border-b border-slate-100 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Package size={17} />
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Order
                                </p>

                                <h2 className="truncate text-sm sm:text-base font-bold text-slate-900">
                                    #{order.id}
                                </h2>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-500">

                            <span className="flex items-center gap-1.5">
                                <Calendar
                                    size={14}
                                    className="text-slate-400"
                                />

                                {new Date(
                                    order.createdAt
                                ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>

                            <span className="flex items-center gap-1.5">
                                <CreditCard
                                    size={14}
                                    className="text-slate-400"
                                />

                                {order.paymentMethod}
                            </span>

                        </div>
                    </div>

                    <span
                        className={`w-fit rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-bold ${STATUS_COLOR[order.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
                    >
                        {statusLabel}
                    </span>

                </div>
            </div>

            {/* ================= PRODUCTS ================= */}

            <div className="p-4 sm:p-6">

                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Items in your order
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {order.orderItems?.length || 0}{" "}
                            {order.orderItems?.length === 1
                                ? "item"
                                : "items"}
                        </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                        <Package size={15} />
                    </div>
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50">

                    {order.orderItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-3 sm:gap-4 p-3 sm:p-4"
                        >
                            {/* Product Image */}

                            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <Image
                                    src={
                                        item.product.images[0]
                                    }
                                    width={96}
                                    height={96}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/* Product Details */}

                            <div className="min-w-0 flex-1 py-0.5">

                                <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-slate-900">
                                    {item.product.name}
                                </h3>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-white border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500">
                                        Qty: {item.quantity}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                        ×
                                    </span>

                                    <span className="text-xs text-slate-500">
                                        {currency}
                                        {Number(item.price).toFixed(2)}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm font-black text-emerald-600">
                                    {currency}
                                    {(
                                        Number(item.price) *
                                        Number(item.quantity)
                                    ).toFixed(2)}
                                </p>

                            </div>
                        </div>
                    ))}

                </div>

                {/* ================= DETAILS ================= */}

                <div className="mt-6 grid gap-4 lg:grid-cols-2">

                    {/* DELIVERY ADDRESS */}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-3">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <MapPin size={15} />
                            </div>

                            <p className="text-sm font-bold text-slate-900">
                                Delivery Address
                            </p>

                        </div>

                        <div className="pl-10">
                            <p className="text-sm font-semibold text-slate-800">
                                {order.address?.name}
                            </p>

                            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500">
                                {order.address?.city}
                                {order.address?.city &&
                                    order.address?.state
                                    ? ", "
                                    : ""}
                                {order.address?.state}
                            </p>
                        </div>
                    </div>

                    {/* ORDER SUMMARY */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">

                        <div className="flex items-center gap-2 mb-4">

                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <CreditCard size={15} />
                            </div>

                            <p className="text-sm font-bold text-slate-900">
                                Order Summary
                            </p>

                        </div>

                        <div className="space-y-2.5">

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">
                                    Products
                                </span>

                                <span className="font-medium text-slate-700">
                                    {currency}
                                    {(
                                        Number(order.total) -
                                        Number(order.deliveryFee)
                                    ).toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">
                                    Delivery
                                </span>

                                <span className="font-medium text-slate-700">
                                    {currency}
                                    {Number(
                                        order.deliveryFee
                                    ).toFixed(2)}
                                </span>
                            </div>

                            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">

                                <span className="text-sm font-bold text-slate-900">
                                    Total
                                </span>

                                <span className="text-lg font-black text-emerald-600">
                                    {currency}
                                    {Number(
                                        order.total
                                    ).toFixed(2)}
                                </span>

                            </div>

                        </div>
                    </div>

                </div>

                {/* ================= ACTIONS ================= */}

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">

                    {/* Track */}

                    <button
                        onClick={onTrack}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
                    >
                        <Truck size={17} />
                        Track Order
                    </button>

                    {/* Cancel */}

                    {order.status !== "DELIVERED" &&
                        order.status !== "CANCELLED" && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98]"
                            >
                                <XCircle size={17} />
                                Cancel
                            </button>
                        )}

                    {/* Rate */}

                    {order.status === "DELIVERED" && (
                        <button
                            onClick={onRate}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.98]"
                        >
                            <Star size={17} />
                            Rate Order
                        </button>
                    )}

                </div>

            </div>

            {/* ================= CANCEL MODAL ================= */}

            <AnimatePresence>
                {showCancelModal && (
                    <>
                        {/* BACKDROP */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                if (!isCancelling) {
                                    setShowCancelModal(false);
                                }
                            }}
                            className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm"
                        />

                        {/* MODAL WRAPPER */}
                        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                    y: 20,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.9,
                                    y: 20,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
                            >
                                {/* TOP DECORATION */}
                                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-100 blur-3xl" />

                                <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-amber-100 blur-3xl" />

                                {/* CLOSE BUTTON */}
                                <button
                                    type="button"
                                    disabled={isCancelling}
                                    onClick={() => setShowCancelModal(false)}
                                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
                                >
                                    <X size={17} />
                                </button>

                                <div className="relative p-6 sm:p-7">

                                    {/* ICON */}
                                    <motion.div
                                        initial={{ scale: 0.7, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 15,
                                            delay: 0.05,
                                        }}
                                        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500 shadow-sm"
                                    >
                                        <AlertTriangle
                                            size={30}
                                            strokeWidth={2}
                                        />
                                    </motion.div>

                                    {/* TITLE */}
                                    <div className="mt-5 text-center">
                                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                                            Cancel Order
                                        </span>

                                        <h2 className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">
                                            Are you sure?
                                        </h2>

                                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                            Do you really want to cancel this order?
                                            Once cancelled, you may not be able to
                                            restore it.
                                        </p>
                                    </div>

                                    {/* ORDER INFO */}
                                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500">
                                                <Package size={18} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Order
                                                </p>

                                                <p className="truncate text-sm font-bold text-slate-900">
                                                    #{order.id}
                                                </p>
                                            </div>

                                            <div className="ml-auto text-right">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Total
                                                </p>

                                                <p className="text-sm font-black text-slate-900">
                                                    {currency}
                                                    {Number(
                                                        order.total
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                        </div>
                                    </div>

                                    {/* WARNING */}
                                    <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                        <AlertTriangle
                                            size={17}
                                            className="mt-0.5 shrink-0 text-amber-600"
                                        />

                                        <p className="text-xs leading-5 text-amber-800">
                                            If this order has already been prepared
                                            or dispatched, cancellation may not be
                                            possible.
                                        </p>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="mt-6 grid grid-cols-2 gap-3">

                                        {/* KEEP ORDER */}
                                        <button
                                            type="button"
                                            disabled={isCancelling}
                                            onClick={() =>
                                                setShowCancelModal(false)
                                            }
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            Keep Order
                                        </button>

                                        {/* CONFIRM CANCEL */}
                                        <button
                                            type="button"
                                            disabled={isCancelling}
                                            onClick={cancelOrder}
                                            className="relative overflow-hidden rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isCancelling ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <motion.span
                                                        animate={{
                                                            rotate: 360,
                                                        }}
                                                        transition={{
                                                            duration: 0.8,
                                                            repeat: Infinity,
                                                            ease: "linear",
                                                        }}
                                                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                                                    />

                                                    Cancelling...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <XCircle size={16} />
                                                    Yes, Cancel
                                                </span>
                                            )}
                                        </button>

                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}