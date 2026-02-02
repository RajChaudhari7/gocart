'use client'

import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"

const LOW_STOCK_LIMIT = 10

export default function StoreManageProducts() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const { getToken } = useAuth()
    const { user } = useUser()

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])

    // ================= FETCH PRODUCTS =================
    const fetchProducts = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/product', {
                headers: { Authorization: `Bearer ${token}` }
            })

            const sorted = data.products.sort((a, b) => {
                if (a.quantity > 0 && b.quantity === 0) return -1
                if (a.quantity === 0 && b.quantity > 0) return 1

                if (a.quantity < LOW_STOCK_LIMIT && b.quantity >= LOW_STOCK_LIMIT) return -1
                if (a.quantity >= LOW_STOCK_LIMIT && b.quantity < LOW_STOCK_LIMIT) return 1

                return new Date(b.createdAt) - new Date(a.createdAt)
            })

            setProducts(
                sorted.map(p => ({
                    ...p,
                    editPrice: p.price,
                    editQuantity: p.quantity,
                    originalPrice: p.price,
                    originalQuantity: p.quantity,
                    isEditing: false
                }))
            )

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    // ================= SAVE PRODUCT =================
    const saveProduct = async (product) => {
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
                            originalPrice: product.editPrice,
                            originalQuantity: product.editQuantity,
                            inStock: product.editQuantity > 0,
                            isEditing: false
                        }
                        : p
                )
            )

            toast.success(data.message)

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    // ================= DELETE PRODUCT =================
    const deleteProduct = async (productId) => {
        if (!confirm("Are you sure you want to delete this product?")) return

        try {
            const token = await getToken()

            const { data } = await axios.delete(
                '/api/store/product',
                {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { productId }
                }
            )

            setProducts(prev => prev.filter(p => p.id !== productId))
            toast.success(data.message)

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const getStockBadge = (qty) => {
        if (qty === 0) {
            return <span className="text-red-600 font-semibold">Out of Stock</span>
        }
        if (qty < LOW_STOCK_LIMIT) {
            return <span className="text-yellow-600 font-semibold">Low Stock ({qty})</span>
        }
        return <span className="text-green-600 font-semibold">In Stock</span>
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
                <thead className="bg-slate-50 uppercase text-gray-700">
                    <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 hidden md:table-cell">MRP</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map(product => (
                        <tr
                            key={product.id}
                            className={`border-t ${
                                product.quantity === 0 ? 'bg-red-50 opacity-80' : 'hover:bg-gray-50'
                            }`}
                        >
                            <td className="px-4 py-3 flex gap-2 items-center">
                                <Image
                                    width={40}
                                    height={40}
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="rounded shadow"
                                />
                                {product.name}
                            </td>

                            <td className="px-4 py-3 hidden md:table-cell">
                                {currency}{product.mrp}
                            </td>

                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    disabled={!product.isEditing}
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

                            <td className="px-4 py-3">
                                <input
                                    type="number"
                                    disabled={!product.isEditing}
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

                            <td className="px-4 py-3">
                                {getStockBadge(product.quantity)}
                            </td>

                            <td className="px-4 py-3 flex gap-2">
                                {!product.isEditing ? (
                                    <>
                                        <button
                                            disabled={product.quantity === 0}
                                            onClick={() => setProducts(prev =>
                                                prev.map(p =>
                                                    p.id === product.id ? { ...p, isEditing: true } : p
                                                )
                                            )}
                                            className={`px-4 py-2 rounded text-white ${
                                                product.quantity === 0
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => saveProduct(product)}
                                            className="px-4 py-2 bg-slate-800 text-white rounded"
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={() =>
                                                setProducts(prev =>
                                                    prev.map(p =>
                                                        p.id === product.id
                                                            ? {
                                                                ...p,
                                                                editPrice: p.originalPrice,
                                                                editQuantity: p.originalQuantity,
                                                                isEditing: false
                                                            }
                                                            : p
                                                    )
                                                )
                                            }
                                            className="px-4 py-2 bg-gray-300 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
