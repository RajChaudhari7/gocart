"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function CustomersAlsoBought({ productId }) {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        loadProducts();

    }, [productId]);

    const loadProducts = async () => {

        try {

            const { data } = await axios.get(
                `/api/products/${productId}/also-bought`
            );

            setProducts(data);

        } catch (error) {

            console.log(error);

        }

    };

    if (products.length === 0) return null;

    return (

        <section className="mt-20">

            <div className="flex items-center gap-3 mb-8">

                <div className="h-8 w-1 rounded-full bg-cyan-400" />

                <div>

                    <h2 className="text-2xl md:text-3xl font-black text-white">

                        Customers Also Bought

                    </h2>

                    <p className="text-slate-400 text-sm">

                        Frequently purchased together

                    </p>

                </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">

                {products.map(product => (

                    <ProductCard
                        key={product.id}
                        product={product}
                        storeIsActive={product.store?.isActive}
                    />

                ))}

            </div>

        </section>

    );

}