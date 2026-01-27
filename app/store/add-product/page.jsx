'use client'

import { assets } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Image from "next/image"
import { useState, useMemo } from "react"
import { toast } from "react-hot-toast"

export default function StoreAddProduct() {

    const { getToken } = useAuth()

    const categories = [
        'Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health',
        'Toys & Games', 'Sports & Outdoors', 'Books & Media',
        'Food & Drink', 'Hobbies & Crafts', 'Others'
    ]

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        quantity: 0,
        category: "",
    })
    const [customCategory, setCustomCategory] = useState("")
    const [loading, setLoading] = useState(false)
    const [aiUsed, setAiUsed] = useState(false)

    /* 🔹 NEW */
    const [discount, setDiscount] = useState(0)

    /* 🔒 UPDATED: Price validation */
    const onChangeHandler = (e) => {
        const { name, value } = e.target

        if (name === "price" && Number(value) > productInfo.mrp) {
            toast.error("Offer price can’t exceed MRP")
            return
        }

        setProductInfo({
            ...productInfo,
            [name]: Number(value) || value
        })
    }

    /* 🔥 Auto Discount Calculation (existing) */
    const discountPercent = useMemo(() => {
        const { mrp, price } = productInfo
        if (mrp > 0 && price > 0 && price < mrp) {
            return Math.round(((mrp - price) / mrp) * 100)
        }
        return 0
    }, [productInfo.mrp, productInfo.price])

    /* 🎚️ NEW: Discount slider logic */
    const handleDiscountChange = (value) => {
        setDiscount(value)

        if (productInfo.mrp > 0) {
            const discountedPrice =
                productInfo.mrp - (productInfo.mrp * value) / 100

            setProductInfo(prev => ({
                ...prev,
                price: Math.round(discountedPrice)
            }))
        }
    }

    const handleImageUpload = async (key, file) => {
        setImages(prev => ({ ...prev, [key]: file }))

        if (key === "1" && file && !aiUsed) {
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onloadend = async () => {
                const base64String = reader.result.split(",")[1]
                const mimeType = file.type
                const token = await getToken()

                await toast.promise(
                    axios.post('/api/store/ai', {
                        base64Image: base64String,
                        mimeType
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    {
                        loading: "Analyzing image with AI...",
                        success: (res) => {
                            const data = res.data
                            if (data?.name) {
                                setProductInfo(prev => ({
                                    ...prev,
                                    name: data.name,
                                    description: data.description,
                                    mrp: data.mrp,
                                    price: data.price,
                                    category: data.category
                                }))
                                setAiUsed(true)
                                return "AI filled product info 🎉"
                            }
                            return "AI analysis failed"
                        },
                        error: (err) => err?.response?.data?.error || err.message
                    }
                )
            }
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        const finalCategory =
            productInfo.category === "Others"
                ? customCategory.trim()
                : productInfo.category

        if (!finalCategory) return toast.error("Please enter category")
        if (productInfo.quantity === 0) return toast.error("Product is out of stock")
        if (!images[1] && !images[2] && !images[3] && !images[4])
            return toast.error("Please upload at least one image")

        try {
            setLoading(true)

            const formData = new FormData()
            formData.append('name', productInfo.name)
            formData.append('description', productInfo.description)
            formData.append('mrp', productInfo.mrp)
            formData.append('price', productInfo.price)
            formData.append('quantity', productInfo.quantity)
            formData.append('category', finalCategory)

            Object.keys(images).forEach(key => {
                images[key] && formData.append('images', images[key])
            })

            const token = await getToken()
            const { data } = await axios.post('/api/store/product', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            toast.success(data.message)

            setProductInfo({
                name: "",
                description: "",
                mrp: 0,
                price: 0,
                quantity: 0,
                category: "",
            })
            setCustomCategory("")
            setImages({ 1: null, 2: null, 3: null, 4: null })
            setDiscount(0)

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })}
            className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm text-slate-600 mb-28"
        >
            <h1 className="text-3xl font-semibold text-slate-800 mb-6">
                Add New Product
            </h1>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-5 mb-4">
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Actual Price (₹)</span>
                    <input type="number" name="mrp" value={productInfo.mrp} onChange={onChangeHandler} className="p-3 border rounded-lg" required />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Offer Price (₹)</span>
                    <input type="number" name="price" value={productInfo.price} onChange={onChangeHandler} className="p-3 border rounded-lg" required />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Quantity</span>
                    <input type="number" name="quantity" min={0} value={productInfo.quantity} onChange={onChangeHandler} className="p-3 border rounded-lg" required />
                </label>
            </div>

            {/* 🎚️ Discount Slider */}
            {productInfo.mrp > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Discount: {discount}%</span>
                        <span className="text-green-600 font-medium">
                            You save ₹{productInfo.mrp - productInfo.price}
                        </span>
                    </div>

                    <input
                        type="range"
                        min={0}
                        max={90}
                        value={discount}
                        onChange={(e) => handleDiscountChange(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            )}

            {/* Discount badge (existing) */}
            {discountPercent > 0 && (
                <div className="mb-6">
                    <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700 animate-slideFade">
                        🔥 {discountPercent}% OFF
                    </span>
                </div>
            )}

            <button
                disabled={loading}
                className="w-full py-3 rounded-lg font-medium text-white bg-slate-900 hover:bg-slate-700 transition disabled:opacity-60"
            >
                {loading ? "Adding Product..." : "Add Product"}
            </button>
        </form>
    )
}
