"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ComparePage() {

    const router = useRouter();

    const products = useSelector(
        state => state.compare.products
    );

    useEffect(() => {

        if (products.length < 2) {

            router.push("/");

        }

    }, [products]);

    if (products.length < 2)
        return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">

            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-20">

                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

                    <h1 className="text-3xl md:text-5xl font-black">
                        AI Product Comparison
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Compare products side-by-side and find the best one.
                    </p>

                </div>

            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8">

                {/* Mobile View */}

                <div className="lg:hidden space-y-6">

                    {products.map((product) => (

                        <div
                            key={product.id}
                            className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl"
                        >

                            <img
                                src={product.images?.[0]}
                                className="w-36 h-36 object-contain mx-auto"
                            />

                            <h2 className="text-xl font-bold text-center mt-4">
                                {product.name}
                            </h2>

                            <div className="mt-6 space-y-3">

                                <InfoRow title="Price" value={`₹${product.price}`} />

                                <InfoRow title="MRP" value={`₹${product.mrp}`} />

                                <InfoRow title="Brand" value={product.brand || "-"} />

                                <InfoRow title="Category" value={product.category} />

                                <InfoRow title="Sub Category" value={product.subCategory} />

                                <InfoRow title="Stock" value={product.quantity} />

                                <InfoRow
                                    title="Rating"
                                    value={`⭐ ${product.averageRating.toFixed(1)}`}
                                />

                                <InfoRow
                                    title="Sales"
                                    value={product.totalSales}
                                />

                                <InfoRow
                                    title="Featured"
                                    value={product.featured ? "✅ Yes" : "❌ No"}
                                />

                            </div>

                        </div>

                    ))}

                </div>

                {/* Desktop View */}

                <div className="hidden lg:block overflow-x-auto rounded-3xl border border-slate-800">

                    <table className="min-w-full border-collapse">

                        <thead>

                            <tr>

                                <th className="sticky left-0 bg-slate-900 z-10 p-6 text-left text-lg font-bold border-r border-slate-800">

                                    Feature

                                </th>

                                {products.map((product) => (

                                    <th
                                        key={product.id}
                                        className="bg-slate-900 p-6 min-w-[260px]"
                                    >

                                        <div className="flex flex-col items-center">

                                            <img
                                                src={product.images?.[0]}
                                                className="w-40 h-40 object-contain"
                                            />

                                            <h2 className="mt-4 font-bold text-lg">
                                                {product.name}
                                            </h2>

                                        </div>

                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            {[
                                ["Price", (p) => `₹${p.price}`],
                                ["MRP", (p) => `₹${p.mrp}`],
                                ["Brand", (p) => p.brand || "-"],
                                ["Category", (p) => p.category],
                                ["Sub Category", (p) => p.subCategory],
                                ["Stock", (p) => p.quantity],
                                ["Rating", (p) => `⭐ ${p.averageRating.toFixed(1)}`],
                                ["Total Sales", (p) => p.totalSales],
                                ["Featured", (p) => (p.featured ? "✅" : "❌")],
                            ].map(([label, getter]) => (

                                <tr
                                    key={label}
                                    className="border-t border-slate-800 hover:bg-slate-900/40 transition"
                                >

                                    <td className="sticky left-0 bg-slate-950 font-bold p-5 border-r border-slate-800">

                                        {label}

                                    </td>

                                    {products.map((product) => (

                                        <td
                                            key={product.id}
                                            className="text-center p-5"
                                        >

                                            {getter(product)}

                                        </td>

                                    ))}

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );

    function InfoRow({ title, value }) {
        return (
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">{title}</span>

                <span className="font-semibold text-white">
                    {value}
                </span>
            </div>
        );
    }

}