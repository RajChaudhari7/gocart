'use client'

import { assets } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import {
    BrowserMultiFormatReader,
    BarcodeFormat,
    DecodeHintType,
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
    const [videoStream, setVideoStream] = useState(null)




    const onChangeHandler = (e) => {
        const { name, value } = e.target

        // Block editing fields if barcode exists
        if (
            barcodeExists &&
            ["name", "description", "mrp", "price", "category"].includes(name)
        ) {
            return
        }

        // Price validation
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
        if (!barcodeValue) return

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
                    quantity: "", // 🔥 seller adds new stock
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
        let codeReader = null;

        const initializeScanner = async () => {
            try {
                const videoElement = document.getElementById("barcode-video");
                if (!videoElement) throw new Error("Video element not found");

                // Request camera permissions
                const devices = await BrowserMultiFormatReader.listVideoInputDevices();
                if (devices.length === 0) {
                    throw new Error("No camera found or permission denied");
                }

                let selectedDeviceId = devices[0].deviceId;
                const rearCamera = devices.find((device) =>
                    /back|rear|environment/i.test(device.label)
                );
                if (rearCamera) selectedDeviceId = rearCamera.deviceId;

                codeReader = new BrowserMultiFormatReader();

                await codeReader.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoElement,
                    (result, error) => {
                        if (result) {
                            const scannedCode = result.getText();
                            console.log("BARCODE SCANNED:", scannedCode);

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

                        if (error) {
                            if (
                                error.name === "NotFoundException" ||
                                error.message.includes("NotFoundException")
                            )
                                return;
                            console.error("Barcode scan error:", error);
                            toast.error("Barcode scanning failed");
                            setScanning(false);
                        }
                    }
                );
            } catch (err) {
                console.error("SCAN ERROR:", err);
                toast.error(
                    err.message.includes("Permission denied")
                        ? "Camera permission denied. Please allow camera access."
                        : "Barcode scanning failed: " + err.message
                );
                setScanning(false);
            }
        };

        if (scanning) {
            initializeScanner();
        }

        return () => {
            if (codeReader) {
                try {
                    codeReader.reset();
                } catch (e) {
                    console.error("Failed to reset scanner:", e);
                }
            }
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
            formData.append("barcode", productInfo.barcode)


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
            className="mb-28"
        >
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-10 space-y-8">

                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Add New Product
                </h1>

                {/* Images */}
                <div>
                    <p className="mb-3 text-sm text-slate-600">Product Images</p>
                    <div className="grid grid-cols-4 gap-3 sm:gap-4">
                        {Object.keys(images).map(key => (
                            <label key={key} className="border rounded-xl p-2 cursor-pointer hover:shadow transition">
                                <Image
                                    width={300}
                                    height={300}
                                    className="w-full h-20 sm:h-24 object-contain"
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
                    <label className="text-sm">Barcode</label>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={productInfo.barcode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\s/g, "")
                                setProductInfo(prev => ({
                                    ...prev,
                                    barcode: value,
                                }))
                                setBarcodeExists(false)
                            }}
                            onBlur={() => handleBarcodeLookup(productInfo.barcode)}
                            placeholder="Scan or enter barcode"
                            className="flex-1 mt-1 p-3 border rounded-lg"
                        />

                        <button
                            type="button"
                            onClick={startBarcodeScan}
                            className="mt-1 px-4 rounded-lg bg-slate-900 text-white text-sm"
                        >
                            📷 Scan
                        </button>
                    </div>

                    {/* Add this video element */}
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




                {/* Name */}
                <div>
                    <label className="text-sm">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={productInfo.name}
                        onChange={onChangeHandler}
                        className="w-full mt-1 p-3 border rounded-lg"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="text-sm">Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        value={productInfo.description}
                        onChange={onChangeHandler}
                        className="w-full mt-1 p-3 border rounded-lg resize-none"
                        required
                    />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm">Actual Price (₹)</label>
                        <input type="number" name="mrp" value={productInfo.mrp} onChange={onChangeHandler} className="w-full mt-1 p-3 border rounded-lg" required />
                    </div>

                    <div>
                        <label className="text-sm">Offer Price (₹)</label>
                        <input type="number" name="price" value={productInfo.price} onChange={onChangeHandler} className="w-full mt-1 p-3 border rounded-lg" required />
                    </div>

                    <div>
                        <label className="text-sm">Quantity</label>
                        <input type="number" name="quantity" min={0} value={productInfo.quantity} onChange={onChangeHandler} className="w-full mt-1 p-3 border rounded-lg" required />
                    </div>
                </div>

                {/* Discount */}
                {productInfo.mrp > 0 && (
                    <div>
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

                {/* Category */}
                <div>
                    <select
                        className="w-full p-3 border rounded-lg"
                        value={productInfo.category}
                        onChange={e => setProductInfo({ ...productInfo, category: e.target.value })}
                        required
                    >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {productInfo.category === "Others" && (
                        <input
                            type="text"
                            placeholder="Enter custom category"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full mt-3 p-3 border rounded-lg"
                            required
                        />
                    )}
                </div>

                {/* Button */}
                <button
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
                >
                    Add Product
                </button>

            </div>
        </form>
    )
}
