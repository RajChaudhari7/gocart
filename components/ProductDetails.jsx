'use client'

import { setCartItemQuantity } from "@/lib/features/cart/cartSlice"
import {
  StarIcon,
  TagIcon,
  EarthIcon,
  CreditCardIcon,
  UserIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"

const ProductDetails = ({ product }) => {
  const dispatch = useDispatch()
  const router = useRouter()

  const cart = useSelector(state => state.cart.cartItems)

  const productId = product.id
  const maxQty = product.quantity
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹"

  const [mainImage, setMainImage] = useState(product.images[0])
  const [quantity, setQuantity] = useState(1)

  // Sync quantity from cart (important)
  useEffect(() => {
    if (cart[productId]) {
      setQuantity(Math.min(cart[productId], maxQty))
    }
  }, [cart, productId, maxQty])

  const handleAddToCart = () => {
    dispatch(
      setCartItemQuantity({
        productId,
        quantity,
        maxQuantity: maxQty,
      })
    )
  }

  const averageRating =
    product.rating.length > 0
      ? product.rating.reduce((a, b) => a + b.rating, 0) /
        product.rating.length
      : 0

  return (
    <div className="flex max-lg:flex-col gap-12">
      {/* IMAGES */}
      <div className="flex max-sm:flex-col-reverse gap-3">
        <div className="flex sm:flex-col gap-3">
          {product.images.map((img, i) => (
            <div
              key={i}
              onClick={() => setMainImage(img)}
              className="bg-slate-100 size-26 rounded-lg cursor-pointer flex items-center justify-center"
            >
              <Image src={img} alt="" width={45} height={45} />
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center sm:size-113 bg-slate-100 rounded-lg">
          <Image src={mainImage} alt={product.name} width={250} height={250} />
        </div>
      </div>

      {/* DETAILS */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold">{product.name}</h1>

        {/* RATING */}
        <div className="flex items-center mt-2">
          {Array(5).fill("").map((_, i) => (
            <StarIcon
              key={i}
              size={14}
              fill={averageRating >= i + 1 ? "#00C950" : "#D1D5DB"}
              className="text-transparent"
            />
          ))}
          <span className="ml-3 text-sm text-slate-500">
            {product.rating.length} Reviews
          </span>
        </div>

        {/* PRICE */}
        <div className="flex gap-3 my-6 text-2xl font-semibold">
          {currency}{product.price}
          <span className="line-through text-slate-500 text-xl">
            {currency}{product.mrp}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <TagIcon size={14} />
          Save {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
        </div>

        {/* QUANTITY */}
        <div className="mt-8">
          <p className="font-semibold mb-2">Quantity</p>
          <div className="flex items-center gap-3">
            <button
              disabled={quantity <= 1}
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="border px-3 py-1 rounded"
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              disabled={quantity >= maxQty}
              onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
              className="border px-3 py-1 rounded"
            >
              +
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            {maxQty} items available
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleAddToCart}
            disabled={maxQty === 0}
            className="bg-slate-800 text-white px-10 py-3 rounded"
          >
            Add to Cart
          </button>

          {cart[productId] && (
            <button
              onClick={() => router.push("/cart")}
              className="bg-slate-500 text-white px-6 py-3 rounded"
            >
              View Cart
            </button>
          )}
        </div>

        <hr className="my-6" />

        {/* INFO */}
        <div className="flex flex-col gap-4 text-slate-500">
          <p className="flex gap-3"><EarthIcon /> Free shipping worldwide</p>
          <p className="flex gap-3"><CreditCardIcon /> Secure payments</p>
          <p className="flex gap-3"><UserIcon /> Trusted sellers</p>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
