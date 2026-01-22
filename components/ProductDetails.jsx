'use client'

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import { StarIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react"
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

  const averageRating = product.rating.length
    ? product.rating.reduce((a, b) => a + b.rating, 0) / product.rating.length
    : 0

  return (
    <section className="px-4 sm:px-6 py-10 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-10 bg-gradient-to-br from-[#020617] to-black rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">

        {/* IMAGE GALLERY */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex sm:flex-col gap-3 order-2 sm:order-1">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className="bg-white/5 border border-white/10 rounded-xl p-2 hover:border-cyan-400 transition"
              >
                <Image src={img} alt="" width={64} height={64} />
              </button>
            ))}
          </div>

          <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 overflow-hidden group order-1 sm:order-2">
            <Image
              src={mainImage}
              alt={product.name}
              width={320}
              height={320}
              className="transition-transform duration-500 ease-out group-hover:scale-110"
            />
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            {product.name}
          </h1>

          {/* RATING */}
          <div className="flex items-center gap-2">
            {Array(5).fill("").map((_, i) => (
              <StarIcon
                key={i}
                size={16}
                fill={averageRating >= i + 1 ? "#00C950" : "#334155"}
                className="text-transparent"
              />
            ))}
            <span className="text-sm text-slate-400">
              {product.rating.length} Reviews
            </span>
          </div>

          {/* PRICE */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold">
              {currency}{product.price}
            </span>
            <span className="line-through text-slate-400">
              {currency}{product.mrp}
            </span>
            <span className="text-green-400 text-sm font-medium">
              Save {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
            </span>
          </div>

          {/* QUANTITY */}
          <div>
            <p className="font-semibold mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-1 border border-white/20 rounded hover:bg-white/10 transition"
              >−</button>

              <span>{quantity}</span>

              <button
                disabled={quantity >= maxQty}
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                className="px-3 py-1 border border-white/20 rounded hover:bg-white/10 transition"
              >+</button>
            </div>
            <p className="text-sm text-slate-400 mt-1">{maxQty} items available</p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => dispatch(setCartItemQuantity({ productId, quantity, maxQuantity: maxQty }))}
              className="bg-cyan-400 text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Add to Cart
            </button>

            {cart[productId] && (
              <button
                onClick={() => router.push('/cart')}
                className="bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition"
              >
                View Cart
              </button>
            )}
          </div>

          {/* INFO */}
          <div className="space-y-2 text-slate-400 text-sm">
            <p className="flex items-center gap-2"><EarthIcon size={16} /> Free shipping worldwide</p>
            <p className="flex items-center gap-2"><CreditCardIcon size={16} /> Secure payments</p>
            <p className="flex items-center gap-2"><UserIcon size={16} /> Trusted sellers</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDetails
