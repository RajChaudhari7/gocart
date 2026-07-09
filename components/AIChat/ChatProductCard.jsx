"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Store, ArrowRight } from "lucide-react";

export default function ChatProductCard({ product }) {

    return (

        <Link
            href={`/product/${product.id}`}
            className="
            group

            flex
            gap-3

            bg-slate-900

            border
            border-slate-800

            hover:border-cyan-500/60

            rounded-2xl

            p-3

            transition-all
            duration-300

            hover:shadow-lg
            hover:shadow-cyan-500/10
            "
        >

            {/* Image */}

            <div
                className="
                relative

                w-20
                h-20

                rounded-xl

                overflow-hidden

                bg-slate-800

                shrink-0
                "
            >

                <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover"
                />

            </div>

            {/* Details */}

            <div className="flex flex-col flex-1 min-w-0">

                <h3
                    className="
                    font-semibold
                    text-white

                    line-clamp-2

                    group-hover:text-cyan-400

                    transition
                    "
                >

                    {product.name}

                </h3>

                <div className="flex items-center gap-1 mt-2">

                    <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="text-xs text-slate-300">

                        {Number(product.averageRating || 0).toFixed(1)}

                    </span>

                </div>

                <div className="flex items-center gap-1 mt-2">

                    <Store
                        size={13}
                        className="text-slate-500"
                    />

                    <span
                        className="
                        text-xs
                        text-slate-400

                        truncate
                        "
                    >

                        {product.store?.name}

                    </span>

                </div>

                <div className="flex items-center justify-between mt-auto pt-3">

                    <div>

                        <p className="text-cyan-400 font-bold">

                            ₹{product.price}

                        </p>

                        {product.mrp > product.price && (

                            <p className="text-xs text-slate-500 line-through">

                                ₹{product.mrp}

                            </p>

                        )}

                    </div>

                    <div
                        className="
                        flex
                        items-center
                        gap-1

                        text-cyan-400

                        text-xs
                        font-semibold

                        group-hover:translate-x-1

                        transition
                        "
                    >

                        View

                        <ArrowRight size={14} />

                    </div>

                </div>

            </div>

        </Link>

    );

}