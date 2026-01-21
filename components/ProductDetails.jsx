'use client'

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { setCartItemQuantity } from "@/lib/features/cart/cartSlice"

const ProductDetails = ({ product }) => {
    const dispatch = useDispatch()
    const router = useRouter()
    const cart = useSelector(state => state.cart.cartItems)

    const productId = product.id
    const maxQty = product.quantity
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹"

    const [mainImage, setMainImage] = useState(product.images[0])
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        if (cart[productId]) setQuantity(Math.min(cart[productId], maxQty))
    }, [cart, productId, maxQty])

    const handleAddToCart = () => {
        dispatch(setCartItemQuantity({ productId, quantity, maxQuantity: maxQty }))
    }

    const averageRating = product.rating.length
        ? product.rating.reduce((a, b) => a + b.rating, 0) / product.rating.length
        : 0

    return (
        <div className="flex flex-col lg:flex-row gap-12 px-6 py-10 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-3xl shadow-xl">
            
            {/* IMAGE GALLERY */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-3">
                    {product.images.map((img, i) => (
                        <div
                            key={i}
                            onClick={() => setMainImage(img)}
                            className="bg-white/10 p-2 rounded-lg cursor-pointer border border-white/20 hover:border-cyan-400 transition"
                        >
                            <Image src={img} alt="" width={60} height={60} />
                        </div>
                    ))}
                </div>
                <div className="bg-white/5 p-6 rounded-2xl flex justify-center items-center">
                    <Image src={mainImage} alt={product.name} width={300} height={300} className="drop-shadow-2xl" />
                </div>
            </div>

            {/* DETAILS */}
            <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-bold">{product.name}</h1>

                {/* RATING */}
                <div className="flex items-center gap-2 mt-3">
                    {Array(5).fill("").map((_, i) => (
                        <StarIcon key={i} size={16} className="text-transparent" fill={averageRating >= i + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <span className="text-sm text-slate-400 ml-2">{product.rating.length} Reviews</span>
                </div>

                {/* PRICE */}
                <div className="flex gap-3 items-center mt-5 text-white">
                    <span className="text-3xl font-bold">{currency}{product.price}</span>
                    <span className="line-through text-slate-400">{currency}{product.mrp}</span>
                    <span className="text-sm text-green-400 font-medium">
                        Save {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
                    </span>
                </div>

                {/* QUANTITY */}
                <div className="mt-6">
                    <p className="font-semibold mb-2">Quantity</p>
                    <div className="flex items-center gap-3">
                        <button disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="border px-3 py-1 rounded hover:bg-white/10 transition">−</button>
                        <span>{quantity}</span>
                        <button disabled={quantity >= maxQty} onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                            className="border px-3 py-1 rounded hover:bg-white/10 transition">+</button>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{maxQty} items available</p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-4 mt-6">
                    <button onClick={handleAddToCart} disabled={maxQty === 0}
                        className="bg-cyan-400 text-black px-8 py-3 rounded-xl hover:scale-105 transition font-semibold">Add to Cart</button>
                    {cart[productId] && (
                        <button onClick={() => router.push("/cart")}
                            className="bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition">View Cart</button>
                    )}
                </div>

                {/* TRUST BADGES */}
                <div className="flex gap-4 mt-6 text-sm text-slate-400">
                    <span>🔐 Secure Checkout</span>
                    <span>💳 Stripe Verified</span>
                    <span>🛡️ Clerk Auth</span>
                </div>

                {/* INFO */}
                <div className="flex flex-col gap-3 mt-6 text-slate-400">
                    <p className="flex items-center gap-2"><EarthIcon /> Free shipping worldwide</p>
                    <p className="flex items-center gap-2"><CreditCardIcon /> Secure payments</p>
                    <p className="flex items-center gap-2"><UserIcon /> Trusted sellers</p>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
