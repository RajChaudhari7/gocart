"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { History } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ContinueBrowsing() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {

        try {

            const { data } = await axios.get(
                "/api/continue-browsing"
            );

            setProducts(data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <section className="mt-10 md:mt-16">

                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 md:p-8">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">

                            <History
                                className="text-indigo-400"
                                size={22}
                            />

                        </div>

                        <div>

                            <h2 className="text-2xl md:text-3xl font-black text-white">

                                Continue Browsing

                            </h2>

                            <p className="text-slate-400 text-sm">

                                Pick up where you left off

                            </p>

                        </div>

                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">

                        {Array.from({ length: 5 }).map((_, index) => (

                            <div
                                key={index}
                                className="h-72 rounded-2xl bg-slate-800 animate-pulse"
                            />

                        ))}

                    </div>

                </div>

            </section>

        );

    }

    if (products.length === 0)
        return null;

    return (

        <section className="mt-10 md:mt-16">

            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-black backdrop-blur-xl p-4 md:p-8 shadow-2xl shadow-black/40">
                <div className="flex items-center gap-3 mb-6">

                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">

                        <History
                            className="text-indigo-400"
                            size={22}
                        />

                    </div>

                    <div>

                        <h2 className="text-2xl md:text-3xl font-black text-white">

                            Continue Browsing

                        </h2>

                        <p className="text-slate-400 text-sm">

                            Pick up where you left off

                        </p>

                    </div>

                </div>

                {/* Desktop */}

                <div className="hidden md:grid grid-cols-3 xl:grid-cols-5 gap-6">

                    {products.map(product => (

                        <ProductCard
                            key={product.id}
                            product={product}
                            storeIsActive={product.store?.isActive === true}
                        />

                    ))}

                </div>

                {/* Mobile */}

                <div className="md:hidden">

                    <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">

                        {products.map(product => (

                            <div
                                key={product.id}
                                className="min-w-[170px] max-w-[170px] snap-start flex-shrink-0"
                            >

                                <ProductCard
                                    product={product}
                                    storeIsActive={product.store?.isActive === true}
                                />

                            </div>

                        ))}

                    </div>

                </div>

            </div>

        </section>

    );

}