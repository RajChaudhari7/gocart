"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function FeaturedProductsTable({ storeId }) {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    useEffect(() => {

        fetchProducts();

    }, []);

    const fetchProducts = async () => {

        try {

            const { data } = await axios.get(
                `/api/admin/featured/${storeId}`
            );

            setProducts(data);

        } finally {

            setLoading(false);

        }

    };

    const toggleFeatured = async (product) => {

        try {

            await axios.patch(
                `/api/admin/products/${product.id}/feature`,
                {
                    featured: !product.featured
                }
            );

            setProducts(prev =>
                prev.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            featured: !item.featured
                        }
                        : item
                )
            );

            if (!product.featured) {

                toast.success(
                    "Product added to Featured Collection ✨"
                );

            } else {

                toast.success(
                    "Product removed from Featured Collection"
                );

            }

        } catch (error) {

            toast.error(
                "Unable to update featured product."
            );

        }

    };

    const filtered = products.filter(product =>

        product.name
            .toLowerCase()
            .includes(search.toLowerCase())

    );

    if (loading) {

        return (

            <div className="space-y-4">

                {Array.from({ length: 8 }).map((_, i) => (

                    <div
                        key={i}
                        className="h-20 rounded-xl bg-slate-200 animate-pulse"
                    />

                ))}

            </div>

        );

    }

    return (

        <div>

            <div className="mb-6 flex items-center gap-4">

                <div className="relative w-80">

                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-slate-400"
                    />

                    <input

                        value={search}

                        onChange={(e) =>
                            setSearch(e.target.value)
                        }

                        placeholder="Search product..."

                        className="pl-10 pr-4 py-3 rounded-xl border w-full"

                    />

                </div>

            </div>

            {/* Desktop */}

            <div className="hidden lg:block overflow-hidden rounded-3xl border">

                <table className="w-full">

                    <thead>

                        <tr className="bg-slate-50">

                            <th className="p-5 text-left">
                                Product
                            </th>

                            <th>
                                Price
                            </th>

                            <th>
                                Stock
                            </th>

                            <th>
                                Rating
                            </th>

                            <th>
                                Sales
                            </th>

                            <th>
                                Views
                            </th>

                            <th>
                                Featured
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {filtered.map(product => (

                            <tr
                                key={product.id}
                                className="border-t hover:bg-slate-50"
                            >

                                <td className="p-5">

                                    <div className="flex gap-4 items-center">

                                        <Image

                                            src={product.images?.[0]}

                                            alt=""

                                            width={60}

                                            height={60}

                                            className="rounded-xl"

                                        />

                                        <div>

                                            <h2 className="font-semibold">

                                                {product.name}

                                            </h2>

                                            <p className="text-sm text-slate-500">

                                                {product.category}

                                            </p>

                                        </div>

                                    </div>

                                </td>

                                <td>

                                    ₹{product.price}

                                </td>

                                <td>

                                    <span className={`px-3 py-1 rounded-full text-xs

                                    ${product.quantity > 10

                                            ? "bg-green-100 text-green-700"

                                            : "bg-orange-100 text-orange-700"

                                        }`}>

                                        {product.quantity}

                                    </span>

                                </td>

                                <td>

                                    ⭐ {product.averageRating.toFixed(1)}

                                </td>

                                <td>

                                    {product.totalSales}

                                </td>

                                <td>

                                    {product.totalViews}

                                </td>

                                <td>

                                    <button
                                        onClick={() => toggleFeatured(product)}
                                        className={`
        relative
        w-14
        h-8
        rounded-full
        transition-all
        duration-300
        shadow-inner
        ${product.featured
                                                ? "bg-emerald-500"
                                                : "bg-slate-300"
                                            }
    `}
                                    >

                                        <span
                                            className={`
            absolute
            top-1
            left-1
            w-6
            h-6
            rounded-full
            bg-white
            shadow-lg
            transition-all
            duration-300
            ${product.featured
                                                    ? "translate-x-6"
                                                    : ""
                                                }
        `}
                                        />

                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* Mobile */}

            <div className="grid lg:hidden gap-5">

                {filtered.map(product => (

                    <div

                        key={product.id}

                        className="rounded-2xl border p-4 bg-white"

                    >

                        <div className="flex gap-4">

                            <Image

                                src={product.images?.[0]}

                                width={80}

                                height={80}

                                alt=""

                                className="rounded-xl"

                            />

                            <div className="flex-1">

                                <h2 className="font-bold">

                                    {product.name}

                                </h2>

                                <p>

                                    ₹{product.price}

                                </p>

                                <p>

                                    ⭐ {product.averageRating.toFixed(1)}

                                </p>

                                <p>

                                    Stock : {product.quantity}

                                </p>

                            </div>

                        </div>

                        <button

                            onClick={() => toggleFeatured(product)}

                            className={`

        mt-5

        w-full

        py-3

        rounded-xl

        font-semibold

        transition-all

        duration-300

        ${product.featured
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-800 text-white hover:bg-slate-700"
                                }

    `}

                        >

                            {product.featured
                                ? "✓ Featured Product"
                                : "Feature Product"}

                        </button>

                    </div>

                ))}

            </div>

        </div>

    );

}