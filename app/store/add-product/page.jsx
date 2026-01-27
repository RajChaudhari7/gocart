'use client'

import { assets } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Image from "next/image"
import { useState } from "react"
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

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
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

        if (!finalCategory) {
            return toast.error("Please enter category")
        }

        if (productInfo.quantity === 0) {
            return toast.error("Product is out of stock")
        }

        if (!images[1] && !images[2] && !images[3] && !images[4]) {
            return toast.error("Please upload at least one image")
        }

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

            {/* Product Images */}
            <p className="font-medium mb-3">Product Images</p>
            <div className="grid grid-cols-4 gap-4 mb-8">
                {Object.keys(images).map(key => (
                    <label
                        key={key}
                        className="border rounded-lg p-3 cursor-pointer hover:border-slate-500 transition"
                    >
                        <Image
                            width={300}
                            height={300}
                            className="h-24 w-full object-contain"
                            src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area}
                            alt=""
                        />
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={e => handleImageUpload(key, e.target.files[0])}
                        />
                    </label>
                ))}
            </div>

            {/* Name */}
            <label className="block mb-5">
                <span className="font-medium">Name</span>
                <input
                    type="text"
                    name="name"
                    value={productInfo.name}
                    onChange={onChangeHandler}
                    className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-slate-400"
                    required
                />
            </label>

            {/* Description */}
            <label className="block mb-6">
                <span className="font-medium">Description</span>
                <textarea
                    name="description"
                    rows={5}
                    value={productInfo.description}
                    onChange={onChangeHandler}
                    className="w-full mt-2 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-slate-400"
                    required
                />
            </label>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-5 mb-6">
                <input type="number" name="mrp" placeholder="Actual Price (₹)" value={productInfo.mrp} onChange={onChangeHandler} className="p-3 border rounded-lg" />
                <input type="number" name="price" placeholder="Offer Price (₹)" value={productInfo.price} onChange={onChangeHandler} className="p-3 border rounded-lg" />
                <input type="number" name="quantity" placeholder="Quantity" value={productInfo.quantity} onChange={onChangeHandler} className="p-3 border rounded-lg" />
            </div>

            {/* Category */}
            <select
                className="w-full p-3 border rounded-lg mb-4 transition focus:ring-2 focus:ring-slate-400"
                value={productInfo.category}
                onChange={e => setProductInfo({ ...productInfo, category: e.target.value })}
                required
            >
                <option value="">Select category</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            {/* Custom Category + Suggestions */}
            {productInfo.category === "Others" && (
                <div className="animate-slideFade mb-6">
                    <input
                        type="text"
                        placeholder="Enter custom category"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-400"
                        required
                    />

                    {customCategory && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {categories
                                .filter(
                                    cat =>
                                        cat.toLowerCase().includes(customCategory.toLowerCase()) &&
                                        cat !== "Others"
                                )
                                .map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCustomCategory(cat)}
                                        className="px-3 py-1 text-sm rounded-full bg-slate-100 hover:bg-slate-800 hover:text-white transition"
                                    >
                                        {cat}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Submit Button */}
            <button
                disabled={loading}
                className="w-full py-3 rounded-lg font-medium text-white bg-slate-900 hover:bg-slate-700 active:scale-[0.98] transition disabled:opacity-60"
            >
                {loading ? "Adding Product..." : "Add Product"}
            </button>
        </form>
    )
}
