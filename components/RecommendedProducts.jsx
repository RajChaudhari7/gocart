"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

export default function RecommendedProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {

        try {

            const { data } = await axios.get("/api/recommendations");

            setProducts(data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {
        return (
            <section className="mt-16">

                <div className="rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-6 md:p-8">

                    <div className="flex items-center gap-3 mb-8">

                        <Sparkles
                            className="text-cyan-400"
                            size={26}
                        />

                        <div>

                            <h2 className="text-2xl md:text-3xl font-black text-white">

                                Recommended For You

                            </h2>

                            <p className="text-slate-400 text-sm">

                                Based on your shopping history

                            </p>

                        </div>

                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">

                        {products.map(product => (

                            <ProductCard
                                key={product.id}
                                product={product}
                                storeIsActive={product.store?.isActive}
                            />

                        ))}

                    </div>

                </div>

            </section>
        );
    }

    if (products.length === 0) return null;

    return (

        <section className="py-14">

            <div className="flex items-center justify-between mb-8">

                <div>

                    <div className="flex items-center gap-3">

                        <Sparkles
                            className="text-cyan-400"
                            size={26}
                        />

                        <h2 className="text-3xl font-black text-white">

                            Recommended For You

                        </h2>

                    </div>

                    <p className="text-slate-400 mt-2">

                        Based on your shopping history

                    </p>

                </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">

                {products.map((product) => (

                    <ProductCard
                        key={product.id}
                        product={product}
                        storeIsActive={product.store?.isActive === true}
                    />

                ))}

            </div>

        </section>

    );

}