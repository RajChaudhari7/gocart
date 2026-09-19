'use client'

import { assets } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner";
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

    // Mapping main categories to their respective sub-categories
    const subCategoriesMap = {
        'Electronics': ['Mobiles', 'Laptops', 'Audio', 'Wearables', 'Accessories', 'Appliances'],
        'Clothing': ['Men\'s Wear', 'Women\'s Wear', 'Kid\'s Wear', 'Shoes', 'Accessories'],
        'Home & Kitchen': ['Furniture', 'Decor', 'Kitchenware', 'Bedding', 'Lighting'],
        'Beauty & Health': ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Supplements'],
        'Toys & Games': ['Action Figures', 'Board Games', 'Puzzles', 'Video Games', 'Soft Toys'],
        'Sports & Outdoors': ['Fitness Equipment', 'Outdoor Gear', 'Team Sports', 'Sportswear'],
        'Books & Media': ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Music & Movies'],
        'Food & Drink': ['Snacks', 'Beverages', 'Groceries', 'Fresh Produce', 'Packaged Food'],
        'Hobbies & Crafts': ['Art Supplies', 'DIY Kits', 'Collectibles', 'Musical Instruments'],
        'Others': []
    }

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })

    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        quantity: 0,
        category: "",
        subCategory: "",
        barcode: "",
    })

    const [loading, setLoading] = useState(false)
    const [aiUsed, setAiUsed] = useState(false)
    const [customCategory, setCustomCategory] = useState("")
    const [customSubCategory, setCustomSubCategory] = useState("") // ✅ Added custom sub-category state
    const [discount, setDiscount] = useState(0)
    const [barcodeExists, setBarcodeExists] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [storeCategory, setStoreCategory] = useState("")
    const [extraFields, setExtraFields] = useState({
        size: "",
        weight: "",
        warranty: ""
    })

    useEffect(() => {
        const fetchStore = async () => {
            const token = await getToken()

            const { data } = await axios.get('/api/store/me', {
                headers: { Authorization: `Bearer ${token}` }
            })

            setStoreCategory(data.category)
        }

        fetchStore()
    }, [])

    const onChangeHandler = (e) => {
        const { name, value } = e.target

        if (
            barcodeExists &&
            ["name", "description", "mrp", "price", "category", "subCategory"].includes(name)
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
                                    subCategory: data.subCategory || prev.subCategory,
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
                    subCategory: data.product.subCategory || "",
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

        // ✅ Handle Custom Category and Custom Sub Category logic
        const finalCategory = productInfo.category === "Others"
            ? customCategory.trim()
            : productInfo.category;

        const finalSubCategory = (productInfo.category === "Others" || productInfo.subCategory === "Others")
            ? customSubCategory.trim()
            : productInfo.subCategory;

        if (!finalCategory) return toast.error("Please enter a category")
        if (!finalSubCategory) return toast.error("Please enter a sub-category")
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
            formData.append('subCategory', finalSubCategory) // ✅ Uses final customized sub category
            formData.append("size", extraFields.size)
            formData.append("weight", extraFields.weight)
            formData.append("warranty", extraFields.warranty)

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
                subCategory: "",
                barcode: ""
            })

            setImages({ 1: null, 2: null, 3: null, 4: null })
            setDiscount(0)
            setCustomCategory("")
            setCustomSubCategory("")
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
                            <label key={key} className="border rounded-xl p-2 cursor-pointer hover:bg-slate-50 transition">
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
                            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                        />

                        <button
                            type="button"
                            onClick={startBarcodeScan}
                            className="px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
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
                        className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
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
                        className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
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
                            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
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
                            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
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
                            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Dynamic Fields Based on Store Category */}
                {storeCategory === "Clothing" && (
                    <div>
                        <label className="block text-sm font-medium">Size</label>
                        <select
                            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                            value={extraFields.size}
                            onChange={(e) => setExtraFields({ ...extraFields, size: e.target.value })}
                        >
                            <option value="">Select Size</option>
                            <option>S</option>
                            <option>M</option>
                            <option>L</option>
                            <option>XL</option>
                        </select>
                    </div>
                )}

                {storeCategory === "Grocery" && (
                    <div>
                        <label className="block text-sm font-medium">Weight</label>
                        <input
                            type="text"
                            placeholder="e.g. 1kg, 500g"
                            value={extraFields.weight}
                            onChange={(e) => setExtraFields({ ...extraFields, weight: e.target.value })}
                            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                    </div>
                )}

                {storeCategory === "Electronics" && (
                    <div>
                        <label className="block text-sm font-medium">Warranty</label>
                        <input
                            type="text"
                            placeholder="e.g. 1 Year"
                            value={extraFields.warranty}
                            onChange={(e) => setExtraFields({ ...extraFields, warranty: e.target.value })}
                            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                        />
                    </div>
                )}

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Main Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Category
                        </label>
                        <select
                            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                            value={productInfo.category}
                            onChange={e => {
                                setProductInfo({
                                    ...productInfo,
                                    category: e.target.value,
                                    subCategory: "" // Reset sub-category when main category changes
                                })
                                setCustomCategory("")
                                setCustomSubCategory("")
                            }}
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sub Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Sub Category
                        </label>
                        <select
                            className="w-full mt-1 p-3 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed focus:ring-2 focus:ring-slate-900 outline-none"
                            value={productInfo.category === "Others" ? "" : productInfo.subCategory}
                            onChange={e => {
                                setProductInfo({ ...productInfo, subCategory: e.target.value })
                                setCustomSubCategory("")
                            }}
                            required={productInfo.category !== "Others"}
                            disabled={!productInfo.category || productInfo.category === "Others"}
                        >
                            <option value="">Select sub-category</option>

                            {/* Standard Sub Categories */}
                            {productInfo.category && productInfo.category !== "Others" && subCategoriesMap[productInfo.category]?.map(subCat => (
                                <option key={subCat} value={subCat}>{subCat}</option>
                            ))}

                            {/* Fallback for standard categories with no map */}
                            {!subCategoriesMap[productInfo.category] && productInfo.category && productInfo.category !== "Others" && (
                                <option value="General">General</option>
                            )}

                            {/* Custom Addition Option */}
                            {productInfo.category && productInfo.category !== "Others" && (
                                <option value="Others" className="font-semibold text-slate-700">+ Add Custom Subcategory</option>
                            )}
                        </select>
                    </div>
                </div>

                {/* ✅ Custom Category / SubCategory Inputs */}
                {(productInfo.category === "Others" || productInfo.subCategory === "Others") && (
                    <div className={`grid grid-cols-1 ${productInfo.category === "Others" ? 'md:grid-cols-2' : ''} gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl`}>

                        {/* Custom Main Category Input */}
                        {productInfo.category === "Others" && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Custom Category Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Pet Supplies"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                    required
                                />
                            </div>
                        )}

                        {/* Custom Sub Category Input */}
                        {(productInfo.category === "Others" || productInfo.subCategory === "Others") && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Custom Sub Category Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dog Food"
                                    value={customSubCategory}
                                    onChange={(e) => setCustomSubCategory(e.target.value)}
                                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                    required
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Submit */}
                <button
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl disabled:bg-slate-700 disabled:cursor-not-allowed hover:bg-slate-800 transition"
                >
                    {loading ? "Adding Product..." : "Add Product"}
                </button>

            </div>
        </form>
    )
}