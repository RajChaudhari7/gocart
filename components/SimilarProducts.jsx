"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

export default function SimilarProducts({ productId }) {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (productId) {
            fetchProducts();
        }

    }, [productId]);

    const fetchProducts = async () => {

        try {

            const { data } = await axios.get(
                `/api/products/${productId}/similar`
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

            <section className="mt-20">

                <div className="flex items-center gap-3 mb-8">

                    <Sparkles
                        className="text-cyan-400"
                        size={24}
                    />

                    <div>

                        <h2 className="text-2xl md:text-3xl font-black text-white">

                            Similar Products

                        </h2>

                        <p className="text-slate-400 text-sm">

                            You may also like

                        </p>

                    </div>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">

                    {Array.from({ length: 5 }).map((_, index) => (

                        <div
                            key={index}
                            className="h-[320px] rounded-2xl bg-slate-800 animate-pulse"
                        />

                    ))}

                </div>

            </section>

        );

    }

    if (products.length === 0) return null;

    return (

        <section className="mt-20">

            <div className="flex items-center gap-3 mb-8">

                <Sparkles
                    className="text-cyan-400"
                    size={24}
                />

                <div>

                    <h2 className="text-2xl md:text-3xl font-black text-white">

                        Similar Products

                    </h2>

                    <p className="text-slate-400 text-sm">

                        You may also like

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

        </section>

    );

}