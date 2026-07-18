"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Heart,
    ShoppingCart,
    Eye,
    Star,
    AlertCircle,
    Ban,
} from "lucide-react";

import { useDispatch } from "react-redux";
import { removeFromWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { addToCart } from "@/lib/features/cart/cartSlice";

import axios from "axios";
import { toast } from "sonner";

const LOW_STOCK_LIMIT = 10;

export default function WishlistCard({ product }) {
    const dispatch = useDispatch();

    const currency =
        process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

    const image =
        product.images?.[0] || "/placeholder.png";

    const rating =
        product.rating?.length > 0
            ? (
                product.rating.reduce(
                    (a, b) => a + b.rating,
                    0
                ) / product.rating.length
            ).toFixed(1)
            : 0;

    const stock = Number(product.quantity);

    const isOutOfStock = stock <= 0;

    const isLowStock =
        stock > 0 && stock < LOW_STOCK_LIMIT;

    const discount =
        product.mrp > product.price
            ? Math.round(
                ((product.mrp - product.price) /
                    product.mrp) *
                100
            )
            : 0;

    const removeWishlist = async () => {
        try {
            await axios.delete(
                `/api/wishlist/${product.id}`
            );

            dispatch(removeFromWishlist(product.id));

            toast.success(
                "Removed from wishlist ❤️"
            );
        } catch {
            toast.error("Unable to remove.");
        }
    };

    const cartHandler = () => {
        dispatch(addToCart(product));

        toast.success("Added to cart 🛒");
    };

    return (
        <div className="group rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300">

            {/* IMAGE */}

            <div className="relative aspect-square bg-slate-100">

                <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition duration-300"
                />

                {product.featured && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-yellow-400 text-black text-[10px] font-bold">
                        ⭐ Featured
                    </span>
                )}

                <button
                    onClick={removeWishlist}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 transition"
                >
                    <Heart
                        size={18}
                        className="fill-red-500 text-red-500"
                    />
                </button>
            </div>

            {/* CONTENT */}

            <div className="p-5 space-y-3">

                <p className="text-xs uppercase tracking-wider text-cyan-600 font-semibold">
                    {product.store?.name}
                </p>

                <h2 className="font-bold text-slate-900 line-clamp-2">
                    {product.name}
                </h2>

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-1">

                        <Star
                            size={15}
                            className="fill-yellow-400 text-yellow-400"
                        />

                        <span className="text-sm font-medium">
                            {rating}
                        </span>

                    </div>

                    {isOutOfStock ? (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                            <Ban size={14} />
                            Out of Stock
                        </span>
                    ) : isLowStock ? (
                        <span className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                            <AlertCircle size={14} />
                            Low Stock
                        </span>
                    ) : (
                        <span className="text-xs text-green-600 font-semibold">
                            In Stock
                        </span>
                    )}
                </div>

                <div>

                    {discount > 0 && (
                        <div className="flex items-center gap-2 mb-1">

                            <span className="line-through text-slate-400 text-sm">
                                {currency}
                                {product.mrp}
                            </span>

                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                                {discount}% OFF
                            </span>

                        </div>
                    )}

                    <p className="text-2xl font-black">
                        {currency}
                        {product.price}
                    </p>

                </div>

                {/* ACTIONS */}

                <div className="grid grid-cols-3 gap-3 pt-2">

                    <button
                        onClick={cartHandler}
                        disabled={isOutOfStock}
                        className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white py-2 flex justify-center items-center transition disabled:opacity-40"
                    >
                        <ShoppingCart size={18} />
                    </button>

                    <Link
                        href={`/product/${product.id}`}
                        className="rounded-xl border border-slate-300 hover:border-cyan-500 py-2 flex justify-center items-center transition"
                    >
                        <Eye size={18} />
                    </Link>

                    <button
                        onClick={removeWishlist}
                        className="rounded-xl border border-red-200 hover:bg-red-50 text-red-500 py-2 flex justify-center items-center transition"
                    >
                        <Heart
                            size={18}
                            className="fill-red-500"
                        />
                    </button>

                </div>

            </div>

        </div>
    );
}