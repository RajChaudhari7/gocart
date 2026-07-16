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

        <div className="min-h-screen bg-slate-950 text-white p-8">

            <h1 className="text-4xl font-black mb-10">

                AI Product Comparison

            </h1>

            <div className="overflow-auto rounded-3xl border border-slate-800">

                <table className="min-w-full">

                    <thead>

                        <tr>

                            <th className="p-6 bg-slate-900 text-left">

                                Feature

                            </th>

                            {products.map(product => (

                                <th
                                    key={product.id}
                                    className="p-6 bg-slate-900 text-center"
                                >

                                    <img
                                        src={product.images?.[0]}
                                        className="w-40 h-40 object-contain mx-auto"
                                    />

                                    <h2 className="mt-4 font-bold">

                                        {product.name}

                                    </h2>

                                </th>

                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        <tr>

                            <td className="p-5 font-bold">

                                Price

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    ₹{product.price}

                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td className="p-5 font-bold">

                                MRP

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    ₹{product.mrp}

                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td className="p-5 font-bold">

                                Brand

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    {product.brand || "-"}

                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td className="p-5 font-bold">

                                Category

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    {product.category}

                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td className="p-5 font-bold">

                                Sub Category

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    {product.subCategory}

                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td className="p-5 font-bold">

                                Stock

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    {product.quantity}

                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td className="p-5 font-bold">

                                Rating

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    ⭐ {product.averageRating.toFixed(1)}

                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td className="p-5 font-bold">

                                Total Sales

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    {product.totalSales}

                                </td>

                            ))}

                        </tr>

                        <tr>

                            <td className="p-5 font-bold">

                                Featured

                            </td>

                            {products.map(product => (

                                <td
                                    key={product.id}
                                    className="text-center"
                                >

                                    {product.featured ? "✅" : "❌"}

                                </td>

                            ))}

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    );

}