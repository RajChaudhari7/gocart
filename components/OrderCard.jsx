"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
    Calendar,
    CreditCard,
    MapPin,
    Package,
    Star,
    Truck,
    XCircle,
    Eye,
    Store,
} from "lucide-react";

import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

const STATUS_COLOR = {
    ORDER_PLACED:
        "bg-blue-500/20 text-blue-400 border-blue-500/40",

    ORDER_CONFIRMED:
        "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",

    ORDER_PACKING:
        "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",

    ORDER_PACKED:
        "bg-orange-500/20 text-orange-400 border-orange-500/40",

    DRIVER_ASSIGNED:
        "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",

    REACHED_SHOP:
        "bg-purple-500/20 text-purple-400 border-purple-500/40",

    PICKED_UP:
        "bg-sky-500/20 text-sky-400 border-sky-500/40",

    OUT_FOR_DELIVERY:
        "bg-pink-500/20 text-pink-400 border-pink-500/40",

    DELIVERY_INITIATED:
        "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",

    DELIVERED:
        "bg-green-500/20 text-green-400 border-green-500/40",

    CANCELLED:
        "bg-red-500/20 text-red-400 border-red-500/40",
};

export default function OrderCard({

    order,

    onTrack,

    onRate,

    onRefresh,

}) {

    const { getToken } = useAuth();

    const cancelOrder = async () => {

        if (order.status === "DELIVERED")
            return;

        if (
            !confirm(
                "Cancel this order?"
            )
        )
            return;

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

            toast.success(
                "Order Cancelled"
            );

            onRefresh();

        } catch (err) {

            toast.error(
                err.response?.data?.error ||
                err.message
            );

        }

    };

    return (

        <motion.div

            initial={{
                opacity: 0,
                y: 30,
            }}

            animate={{
                opacity: 1,
                y: 0,
            }}

            transition={{
                duration: 0.35,
            }}

            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/40 transition-all"

        >

            {/* HEADER */}

            <div className="flex flex-col lg:flex-row justify-between gap-5 p-6 border-b border-slate-800">

                <div>

                    <h2 className="font-bold text-lg">

                        Order #

                        <span className="text-indigo-400 ml-2">

                            {order.id}

                        </span>

                    </h2>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/50">

                        <span className="flex items-center gap-2">

                            <Calendar size={15} />

                            {new Date(
                                order.createdAt
                            ).toLocaleDateString(
                                "en-IN",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }
                            )}

                        </span>

                        <span className="flex items-center gap-2">

                            <CreditCard size={15} />

                            {order.paymentMethod}

                        </span>

                    </div>

                </div>

                <span

                    className={`px-4 py-2 rounded-full border text-sm font-semibold h-fit ${STATUS_COLOR[order.status]}`}

                >

                    {order.status.replaceAll(
                        "_",
                        " "
                    )}

                </span>

            </div>

            {/* PRODUCTS */}

            <div className="p-6">

                <div className="space-y-4">

                    {order.orderItems.map(
                        (item) => (

                            <div

                                key={item.id}

                                className="flex gap-4"

                            >

                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">

                                    <Image

                                        src={
                                            item.product
                                                .images[0]
                                        }

                                        width={80}

                                        height={80}

                                        alt=""

                                        className="w-full h-full object-cover"

                                    />

                                </div>

                                <div className="flex-1">

                                    <h3 className="font-semibold">

                                        {
                                            item.product
                                                .name
                                        }

                                    </h3>

                                    <p className="text-sm text-white/50 mt-1">

                                        Qty :
                                        {
                                            item.quantity
                                        }

                                    </p>

                                    <p className="text-emerald-400 font-bold mt-2">

                                        {currency}

                                        {item.price}

                                    </p>

                                </div>

                            </div>

                        )
                    )}

                </div>

                {/* ADDRESS */}

                <div className="mt-8 grid lg:grid-cols-2 gap-6">

                    <div>

                        <p className="text-white/40 text-sm mb-2">

                            Delivery Address

                        </p>

                        <div className="flex gap-3">

                            <MapPin
                                size={18}
                                className="text-indigo-400 mt-1"
                            />

                            <div>

                                <p className="font-medium">

                                    {
                                        order
                                            .address
                                            ?.name
                                    }

                                </p>

                                <p className="text-white/50 text-sm">

                                    {
                                        order
                                            .address
                                            ?.city
                                    }

                                    ,

                                    {
                                        order
                                            .address
                                            ?.state
                                    }

                                </p>

                            </div>

                        </div>

                    </div>

                    <div>

                        <p className="text-white/40 text-sm mb-2">

                            Order Summary

                        </p>

                        <div className="space-y-2">

                            <div className="flex justify-between">

                                <span className="text-white/50">

                                    Products

                                </span>

                                <span>

                                    {currency}

                                    {(
                                        order.total -
                                        order.deliveryFee
                                    ).toFixed(
                                        2
                                    )}

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-white/50">

                                    Delivery

                                </span>

                                <span>

                                    {currency}

                                    {
                                        order.deliveryFee
                                    }

                                </span>

                            </div>

                            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-lg">

                                <span>

                                    Total

                                </span>

                                <span className="text-emerald-400">

                                    {currency}

                                    {order.total.toFixed(
                                        2
                                    )}

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ACTIONS */}

                <div className="mt-8 flex flex-wrap gap-3">

                    <button

                        onClick={onTrack}

                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"

                    >

                        <Truck size={18} />

                        Track

                    </button>

                    {order.status !==
                        "DELIVERED" &&
                        order.status !==
                        "CANCELLED" && (

                            <button

                                onClick={
                                    cancelOrder
                                }

                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition"

                            >

                                <XCircle
                                    size={18}
                                />

                                Cancel

                            </button>

                        )}

                    {order.status ===
                        "DELIVERED" && (

                            <button

                                onClick={onRate}

                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition"

                            >

                                <Star
                                    size={18}
                                />

                                Rate

                            </button>

                        )}

                </div>

            </div>

        </motion.div>

    );

}