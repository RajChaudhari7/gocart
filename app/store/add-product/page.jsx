'use client'

import { assets } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import {
    BrowserMultiFormatReader,
    BarcodeFormat
} from "@zxing/browser";

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
        barcode: "",
    })

    const [loading, setLoading] = useState(false)
    const [aiUsed, setAiUsed] = useState(false)
    const [customCategory, setCustomCategory] = useState("")
    const [discount, setDiscount] = useState(0)
    const [barcodeExists, setBarcodeExists] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [storeCategory, setStoreCategory] = useState("")
    const [attributes, setAttributes] = useState({})

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const token = await getToken()

                const { data } = await axios.get('/api/store/me', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                setStoreCategory(
                    data.category === "Other"
                        ? data.customCategory
                        : data.category
                )

            } catch (err) {
                toast.error("Failed to load store info")
            }
        }

        fetchStore()
    }, [])

    const onChangeHandler = (e) => {
        const { name, value } = e.target

        if (
            barcodeExists &&
            ["name", "description", "mrp", "price", "category"].includes(name)
        ) return

        if (name === "price" && Number(value) > Number(productInfo.mrp)) {
            toast.error("Offer price cannot exceed MRP")
            return
        }

        setProductInfo(prev => ({
            ...prev,
            [name]: value,
        }))
    }

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

    const handleBarcodeLookup = async (barcodeValue) => {
        if (!barcodeValue || barcodeValue.trim() === "") return

        const cleanBarcode = barcodeValue.trim()

        try {
            const token = await getToken()

            const { data } = await axios.get(
                `/api/store/barcode/${cleanBarcode}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (data.found && data.product) {
                setBarcodeExists(true)

                toast.success("Product exists. Stock will be updated 📦")

                setProductInfo(prev => ({
                    ...prev,
                    name: data.product.name,
                    description: data.product.description,
                    category: data.product.category,
                    mrp: data.product.mrp,
                    price: data.product.price,
                    quantity: "",
                }))
            } else {
                setBarcodeExists(false)
                toast("New product. Fill details ✍️", { icon: "ℹ️" })
            }
        } catch (error) {
            console.error("BARCODE LOOKUP ERROR:", error)
            toast.error("Barcode lookup failed")
        }
    }

    const startBarcodeScan = async () => {
        setScanning(true);
    };

    useEffect(() => {
        let codeReader;

        const initializeScanner = async () => {
            try {
                const videoElement = document.getElementById("barcode-video");
                const devices = await BrowserMultiFormatReader.listVideoInputDevices();

                let selectedDeviceId = devices[0].deviceId;
                const rearCamera = devices.find((device) =>
                    /back|rear|environment/i.test(device.label)
                );
                if (rearCamera) selectedDeviceId = rearCamera.deviceId;

                codeReader = new BrowserMultiFormatReader();

                const formats = [
                    BarcodeFormat.EAN_13,
                    BarcodeFormat.UPC_A,
                    BarcodeFormat.EAN_8,
                    BarcodeFormat.CODE_128,
                    BarcodeFormat.CODE_39,
                    BarcodeFormat.ITF,
                    BarcodeFormat.QR_CODE,
                    BarcodeFormat.DATA_MATRIX,
                    BarcodeFormat.PDF_417,
                ];

                await codeReader.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoElement,
                    (result, error) => {
                        if (result) {
                            const scannedCode = result.getText();

                            if (videoElement.srcObject) {
                                videoElement.srcObject.getTracks().forEach((track) => track.stop());
                                videoElement.srcObject = null;
                            }

                            setScanning(false);

                            setProductInfo((prev) => ({
                                ...prev,
                                barcode: scannedCode,
                            }));

                            handleBarcodeLookup(scannedCode);
                        }

                        if (error && !error.message.includes("No MultiFormat Readers were able to detect the code")) {
                            toast.error("Barcode scanning failed");
                            setScanning(false);
                        }
                    },
                    { formats }
                );

            } catch (err) {
                toast.error("Camera permission denied or scanning failed");
                setScanning(false);
            }
        };

        if (scanning) initializeScanner()

        return () => {
            if (codeReader) codeReader.reset()
        };

    }, [scanning]);

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        const finalCategory =
            productInfo.category === "Others"
                ? customCategory.trim()
                : productInfo.category

        if (!finalCategory) return toast.error("Please enter a category")
        if (productInfo.quantity === 0) return toast.error("Product is out of stock")

        if (
            !barcodeExists &&
            !images[1] &&
            !images[2] &&
            !images[3] &&
            !images[4]
        ) {
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
            formData.append("attributes", JSON.stringify(attributes))

            // ✅ barcode optional
            if (productInfo.barcode) {
                formData.append("barcode", productInfo.barcode)
            }

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
                barcode: ""
            })

            setImages({ 1: null, 2: null, 3: null, 4: null })
            setDiscount(0)
            setCustomCategory("")
            setBarcodeExists(false)

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })}
            className="mb-28"
        >
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-8">

                <h1 className="text-xl font-semibold text-slate-800">
                    Add New Product
                </h1>

                {/* Images */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                        Product Images
                    </label>

                    <div className="grid grid-cols-4 gap-4">
                        {Object.keys(images).map(key => (
                            <label key={key} className="border rounded-xl p-2 cursor-pointer">
                                <Image
                                    width={300}
                                    height={300}
                                    className="w-full h-24 object-contain"
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
                </div>

                {/* Barcode */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Barcode (Optional)
                    </label>

                    <div className="flex gap-2 mt-1">
                        <input
                            type="text"
                            value={productInfo.barcode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\s/g, "");
                                setProductInfo(prev => ({
                                    ...prev,
                                    barcode: value,
                                }));
                                setBarcodeExists(false);
                            }}
                            onBlur={() => {
                                if (productInfo.barcode) {
                                    handleBarcodeLookup(productInfo.barcode)
                                }
                            }}
                            placeholder="Enter or scan barcode"
                            className="flex-1 p-3 border rounded-lg"
                        />

                        <button
                            type="button"
                            onClick={startBarcodeScan}
                            className="px-4 rounded-lg bg-slate-900 text-white text-sm"
                        >
                            📷 Scan
                        </button>
                    </div>

                    {scanning && (
                        <div className="mt-3">
                            <video
                                id="barcode-video"
                                className="w-full h-64 border rounded-lg object-cover"
                                playsInline
                            />
                        </div>
                    )}
                </div>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Product Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={productInfo.name}
                        onChange={onChangeHandler}
                        placeholder="Enter product name"
                        className="w-full mt-1 p-3 border rounded-lg"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows={4}
                        value={productInfo.description}
                        onChange={onChangeHandler}
                        placeholder="Enter product description"
                        className="w-full mt-1 p-3 border rounded-lg"
                        required
                    />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            MRP (₹)
                        </label>
                        <input
                            type="number"
                            name="mrp"
                            value={productInfo.mrp}
                            onChange={onChangeHandler}
                            placeholder="Enter MRP"
                            className="w-full mt-1 p-3 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Offer Price (₹)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={productInfo.price}
                            onChange={onChangeHandler}
                            placeholder="Enter offer price"
                            className="w-full mt-1 p-3 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            min={0}
                            value={productInfo.quantity}
                            onChange={onChangeHandler}
                            placeholder="Enter quantity"
                            className="w-full mt-1 p-3 border rounded-lg"
                            required
                        />
                    </div>
                </div>

                {/* Dynamic Fields based on Store Category */}
                {storeCategory === "Clothing" && (
                    <div className="space-y-4">

                        {/* Size */}
                        <input
                            type="text"
                            placeholder="Size (S, M, L...)"
                            className="p-3 border rounded-lg w-full"
                            onChange={(e) =>
                                setAttributes({ ...attributes, size: e.target.value })
                            }
                        />

                        {/* Color Picker */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Select Colors
                            </p>

                            {/* Color Input */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    className="w-12 h-12 p-1 border rounded-lg cursor-pointer"
                                    onChange={(e) => {
                                        const newColor = e.target.value

                                        // prevent duplicates
                                        if (!attributes.colors?.includes(newColor)) {
                                            setAttributes({
                                                ...attributes,
                                                colors: [...(attributes.colors || []), newColor]
                                            })
                                        }
                                    }}
                                />

                                <span className="text-sm text-gray-500">
                                    Pick multiple colors
                                </span>
                            </div>

                            {/* Selected Colors Preview */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {attributes.colors?.map((color, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full"
                                    >
                                        {/* Color circle */}
                                        <div
                                            className="w-5 h-5 rounded-full border"
                                            style={{ backgroundColor: color }}
                                        />

                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = attributes.colors.filter((c) => c !== color)
                                                setAttributes({ ...attributes, colors: updated })
                                            }}
                                            className="text-xs text-red-500"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {storeCategory === "Grocery" && (
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Weight (e.g. 1kg)"
                            className="p-3 border rounded-lg"
                            onChange={(e) =>
                                setAttributes({ ...attributes, weight: e.target.value })
                            }
                        />

                        <input
                            type="date"
                            className="p-3 border rounded-lg"
                            onChange={(e) =>
                                setAttributes({ ...attributes, expiry: e.target.value })
                            }
                        />
                    </div>
                )}

                {storeCategory === "Electronics" && (
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Brand"
                            className="p-3 border rounded-lg"
                            onChange={(e) =>
                                setAttributes({ ...attributes, brand: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Warranty (e.g. 1 Year)"
                            className="p-3 border rounded-lg"
                            onChange={(e) =>
                                setAttributes({ ...attributes, warranty: e.target.value })
                            }
                        />
                    </div>
                )}

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">
                        Category
                    </label>

                    <select
                        className="w-full mt-1 p-3 border rounded-lg"
                        value={productInfo.category}
                        onChange={e => setProductInfo({ ...productInfo, category: e.target.value })}
                        required
                    >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Custom Category */}
                {productInfo.category === "Others" && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Custom Category
                        </label>
                        <input
                            type="text"
                            placeholder="Enter custom category"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full mt-1 p-3 border rounded-lg"
                            required
                        />
                    </div>
                )}



                {/* Submit */}
                <button
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl"
                >
                    {loading ? "Adding Product..." : "Add Product"}
                </button>

            </div>
        </form>
    )
}