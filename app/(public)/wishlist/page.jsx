"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { clearWishlist } from "@/lib/features/wishlist/wishlistSlice";
import WishlistGrid from "@/components/wishlist/WishlistGrid";
import axios from "axios";
import { toast } from "sonner";

export default function WishlistPage() {
    const dispatch = useDispatch();

    const wishlist = useSelector(
        (state) => state.wishlist.products || []
    );

    const clearAllWishlist = async () => {
        try {
            await Promise.all(
                wishlist.map((product) =>
                    axios.delete(`/api/wishlist/${product.id}`)
                )
            );

            dispatch(clearWishlist());

            toast.success("Wishlist cleared ❤️");
        } catch (error) {
            toast.error("Unable to clear wishlist.");
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-28 pb-20">

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* HEADER */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">

                                <Heart
                                    className="text-red-500 fill-red-500"
                                    size={28}
                                />

                            </div>

                            <div>

                                <h1 className="text-3xl md:text-4xl font-black text-slate-900">

                                    My Wishlist

                                </h1>

                                <p className="text-slate-500 mt-1">

                                    {wishlist.length} saved product
                                    {wishlist.length !== 1 && "s"}

                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="flex flex-wrap gap-3">

                        <Link
                            href="/product"
                            className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-cyan-500 hover:text-cyan-600 transition"
                        >
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </Link>

                        {wishlist.length > 0 && (
                            <button
                                onClick={clearAllWishlist}
                                className="flex items-center gap-2 rounded-2xl bg-red-500 hover:bg-red-600 px-5 py-3 font-semibold text-white transition"
                            >
                                <Trash2 size={18} />
                                Clear Wishlist
                            </button>
                        )}

                    </div>

                </div>

                {/* EMPTY STATE */}

                {wishlist.length === 0 ? (

                    <div className="rounded-3xl bg-white border border-slate-200 p-16 text-center shadow-sm">

                        <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center">

                            <Heart
                                size={40}
                                className="text-red-500"
                            />

                        </div>

                        <h2 className="mt-8 text-3xl font-black text-slate-900">

                            Your Wishlist is Empty

                        </h2>

                        <p className="mt-3 text-slate-500 max-w-lg mx-auto">

                            Save products you love so you can
                            easily find them later.

                        </p>

                        <Link
                            href="/product"
                            className="inline-flex mt-8 items-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-600 px-8 py-4 font-semibold text-white transition"
                        >
                            Browse Products
                        </Link>

                    </div>

                ) : (

                    <WishlistGrid
                        products={wishlist}
                    />

                )}

            </div>

        </main>
    );
}