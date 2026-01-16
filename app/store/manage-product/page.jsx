'use client'

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"

export default function StoreManageProducts() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const { getToken } = useAuth()
    const { user } = useUser()

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    const fetchProducts = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/product', {
                headers: { Authorization: `Bearer ${token}` }
            })

            setProducts(
                data.products
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(p => ({
                        ...p,
                        editPrice: p.price,
                        editQuantity: p.quantity
                    }))
            )

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const updateProduct = async (product) => {
        try {
            const token = await getToken()

            const { data } = await axios.put(
                '/api/store/product',
                {
                    productId: product.id,
                    price: Number(product.editPrice),
                    quantity: Number(product.editQuantity)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setProducts(prev =>
                prev.map(p =>
                    p.id === product.id
                        ? {
                            ...p,
                            price: product.editPrice,
                            quantity: product.editQuantity,
                            inStock: product.editQuantity > 0
                        }
                        : p
                )
            )

            toast.success(data.message)

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    useEffect(() => {
        if (user) fetchProducts()
    }, [user])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">
                Manage <span className="text-slate-800 font-medium">Products</span>
            </h1>

            <table className="w-full max-w-6xl text-left ring ring-slate-200 rounded text-sm">
                <thead className="bg-slate-50 uppercase tracking-wider text-gray-700">
                    <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Action</th>
                    </tr>
                </thead>

                <tbody className="text-slate-700">
                    {products.map(product => (
                        <tr key={product.id} className="border-t hover:bg-gray-50">
                            {/* NAME */}
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image
                                        width={40}
                                        height={40}
                                        src={product.images[0]}
                                        alt=""
                                        className="rounded shadow"
                                    />
                                    {product.name}
                                </div>
                            </td>

                            {/* MRP */}
                            <td className="px-4 py-3 hidden md:table-cell">
                                {currency}{product.mrp}
                            </td>

                            {/* EDIT PRICE */}
                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    value={product.editPrice}
                                    onChange={e =>
                                        setProducts(prev =>
                                            prev.map(p =>
                                                p.id === product.id
                                                    ? { ...p, editPrice: e.target.value }
                                                    : p
                                            )
                                        )
                                    }
                                    className="w-24 px-2 py-1 border rounded"
                                />
                            </td>

                            {/* EDIT QUANTITY */}
                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    min={0}
                                    value={product.editQuantity}
                                    onChange={e =>
                                        setProducts(prev =>
                                            prev.map(p =>
                                                p.id === product.id
                                                    ? { ...p, editQuantity: e.target.value }
                                                    : p
                                            )
                                        )
                                    }
                                    className="w-20 px-2 py-1 border rounded"
                                />
                            </td>

                            {/* STOCK STATUS */}
                            <td className="px-4 py-3">
                                {product.inStock ? (
                                    <span className="text-green-600 font-medium">In Stock</span>
                                ) : (
                                    <span className="text-red-600 font-medium">Out</span>
                                )}
                            </td>

                            {/* SAVE */}
                            <td className="px-4 py-3">
                                <button
                                    onClick={() =>
                                        toast.promise(updateProduct(product), {
                                            loading: "Saving...",
                                        })
                                    }
                                    className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900"
                                >
                                    Save
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
