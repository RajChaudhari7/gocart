'use client'

import { assets } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"
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

    const [loading, setLoading] = useState(false)
    const [aiUsed, setAiUsed] = useState(false)

    // 🔹 NEW: custom category
    const [customCategory, setCustomCategory] = useState("")

    // 🔹 Discount state
    const [discount, setDiscount] = useState(0)

    const onChangeHandler = (e) => {
        const { name, value } = e.target
        const numValue = Number(value)

        if (name === "price" && numValue > productInfo.mrp) {
            toast.error("Offer price cannot exceed Actual price")
            return
        }

        setProductInfo({ ...productInfo, [name]: value })
    }

    // 🔹 Auto discount calculation
    useEffect(() => {
        if (productInfo.mrp > 0 && productInfo.price > 0) {
            const percent = Math.round(
                ((productInfo.mrp - productInfo.price) / productInfo.mrp) * 100
            )
            setDiscount(percent > 0 ? percent : 0)
        } else {
            setDiscount(0)
        }
    }, [productInfo.mrp, productInfo.price])

    // 🔹 Slider handler
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
                                    category: data.category,
                                    quantity: data.quantity ?? prev.quantity
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

        // 🔹 NEW: resolve final category
        const finalCategory =
            productInfo.category === "Others"
                ? customCategory.trim()
                : productInfo.category

        if (!finalCategory) {
            return toast.error("Please enter a category")
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
            formData.append('category', finalCategory) // 🔹 USE FINAL CATEGORY

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

            setImages({ 1: null, 2: null, 3: null, 4: null })
            setDiscount(0)
            setCustomCategory("")

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })}
            className="text-slate-500 mb-28"
        >
            <h1 className="text-2xl">
                Add New <span className="text-slate-800 font-medium">Products</span>
            </h1>

            <p className="mt-7">Product Images</p>

            <div className="flex gap-3 mt-4">
                {Object.keys(images).map(key => (
                    <label key={key}>
                        <Image
                            width={300}
                            height={300}
                            className="h-15 w-auto border rounded cursor-pointer"
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

            <label className="flex flex-col gap-2 my-6">
                Name
                <input
                    type="text"
                    name="name"
                    value={productInfo.name}
                    onChange={onChangeHandler}
                    className="max-w-sm p-2 px-4 border rounded"
                    required
                />
            </label>

            <label className="flex flex-col gap-2 my-6">
                Description
                <textarea
                    name="description"
                    rows={5}
                    value={productInfo.description}
                    onChange={onChangeHandler}
                    className="max-w-sm p-2 px-4 border rounded resize-none"
                    required
                />
            </label>

            <div className="flex gap-5">
                <label className="flex flex-col gap-2">
                    Actual Price (₹)
                    <input type="number" name="mrp" value={productInfo.mrp} onChange={onChangeHandler} required />
                </label>

                <label className="flex flex-col gap-2">
                    Offer Price (₹)
                    <input type="number" name="price" value={productInfo.price} onChange={onChangeHandler} required />
                </label>

                <label className="flex flex-col gap-2">
                    Quantity
                    <input type="number" name="quantity" min={0} value={productInfo.quantity} onChange={onChangeHandler} required />
                </label>
            </div>

            {/* Discount */}
            {productInfo.mrp > 0 && (
                <div className="max-w-sm my-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Discount: {discount}%</span>
                        <span className="text-green-600">
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

            <select
                className="max-w-sm p-2 px-4 my-6 border rounded"
                value={productInfo.category}
                onChange={e => setProductInfo({ ...productInfo, category: e.target.value })}
                required
            >
                <option value="">Select category</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            {/* 🔹 NEW: custom category input */}
            {productInfo.category === "Others" && (
                <input
                    type="text"
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="max-w-sm p-2 px-4 mb-6 border rounded"
                    required
                />
            )}

            <button disabled={loading} className="bg-slate-800 text-white px-6 py-2 rounded">
                Add Product
            </button>
        </form>
    )
}
