"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

export default function TrendingProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrendingProducts();
    }, []);

    const fetchTrendingProducts = async () => {
        try {
            const { data } = await axios.get(
                "/api/trending-products"
            );

            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("TRENDING PRODUCTS ERROR:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="mt-10 md:mt-16">
                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        border-orange-500/20
                        bg-gradient-to-br
                        from-slate-950
                        via-slate-950
                        to-orange-950/30
                        p-4
                        md:p-8
                        shadow-2xl
                        shadow-orange-950/20
                    "
                >
                    {/* Decorative glow */}

                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

                    {/* Loading heading */}

                    <div className="relative z-10 mb-8 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
                            <Flame
                                size={23}
                                className="text-orange-400"
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-white md:text-3xl">
                                Trending Products
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Products shoppers are loving right now
                            </p>
                        </div>
                    </div>

                    {/* Loading skeleton */}

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
                            >
                                <div className="aspect-square animate-pulse bg-slate-800" />

                                <div className="space-y-3 p-4">
                                    <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />

                                    <div className="h-4 w-full animate-pulse rounded bg-slate-800" />

                                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />

                                    <div className="h-6 w-24 animate-pulse rounded bg-slate-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mt-10 md:mt-16"
        >
            <div
                className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-orange-500/20
                    bg-gradient-to-br
                    from-slate-950
                    via-slate-950
                    to-orange-950/30
                    p-4
                    md:p-8
                    shadow-2xl
                    shadow-orange-950/20
                "
            >
                {/* Background decoration */}

                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-red-500/5 blur-3xl" />

                {/* Header */}

                <div className="relative z-10 mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{
                                scale: [1, 1.08, 1],
                                rotate: [0, -4, 4, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1.5,
                            }}
                            className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-orange-500/20
                                bg-gradient-to-br
                                from-orange-500/20
                                to-red-500/10
                                shadow-lg
                                shadow-orange-500/10
                            "
                        >
                            <Flame
                                size={24}
                                className="fill-orange-400 text-orange-400"
                            />
                        </motion.div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-black text-white md:text-3xl">
                                    Trending Products
                                </h2>

                                <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-300">
                                    <TrendingUp size={12} />
                                    Live
                                </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                                Most viewed, purchased and loved by shoppers
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-400 sm:flex">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
                        Updated automatically
                    </div>
                </div>

                {/* Desktop */}

                <div className="relative z-10 hidden grid-cols-3 gap-6 md:grid xl:grid-cols-5">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="
                                relative
                                rounded-3xl
                                transition
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-2xl
                                hover:shadow-orange-500/10
                            "
                        >
                            <ProductCard
                                product={product}
                                storeIsActive={
                                    product.store?.isActive === true
                                }
                                trending
                                trendingRank={index + 1}
                            />
                        </div>
                    ))}
                </div>

                {/* Mobile */}

                <div className="relative z-10 md:hidden">
                    <div
                        className="
                            flex
                            snap-x
                            snap-mandatory
                            gap-4
                            overflow-x-auto
                            pb-3
                            scrollbar-hide
                        "
                    >
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                className="
                                    min-w-[175px]
                                    max-w-[175px]
                                    flex-shrink-0
                                    snap-start
                                "
                            >
                                <ProductCard
                                    product={product}
                                    storeIsActive={
                                        product.store?.isActive === true
                                    }
                                    trending
                                    trendingRank={index + 1}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}