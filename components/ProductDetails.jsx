'use client'

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import { StarIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { setCartItemQuantity } from "@/lib/features/cart/cartSlice"
import { motion, AnimatePresence } from "framer-motion"

/* ---------------- SHIMMER ---------------- */
const shimmer = (w, h) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e293b" offset="20%" />
      <stop stop-color="#334155" offset="50%" />
      <stop stop-color="#1e293b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e293b" />
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>
`

const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str)

/* ---------------- COMPONENT ---------------- */
const ProductDetails = ({ product }) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const cart = useSelector(state => state.cart.cartItems)

  const productId = product.id
  const maxQty = product.quantity
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹"

  const [activeIndex, setActiveIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [inCart, setInCart] = useState(false)
  const [showQuantity, setShowQuantity] = useState(false)

  useEffect(() => {
    if (cart[productId]) {
      setQuantity(cart[productId])
      setInCart(true)
      setShowQuantity(true)
    }
  }, [cart, productId])

  const handleAddToCart = () => {
    dispatch(setCartItemQuantity({ productId, quantity: 1, maxQuantity: maxQty }))
    setInCart(true)
    setShowQuantity(true)
  }

  const handleSwipe = (_, info) => {
    if (info.offset.x < -80 && activeIndex < product.images.length - 1)
      setActiveIndex(i => i + 1)
    if (info.offset.x > 80 && activeIndex > 0)
      setActiveIndex(i => i - 1)
  }

  const averageRating = product.rating.length
    ? product.rating.reduce((a, b) => a + b.rating, 0) / product.rating.length
    : 0

  return (
    <div className="flex flex-col lg:flex-row gap-10 px-4 sm:px-6 py-10 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-3xl shadow-xl">

      {/* ---------- GALLERY ---------- */}
      <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-[55%]">

        {/* MAIN IMAGE */}
        <div className="order-1 lg:order-2 flex justify-center items-center bg-white/5 p-4 sm:p-6 lg:p-8 rounded-2xl w-full overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleSwipe}
            className="w-full flex justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={product.images[activeIndex]}
                  alt={product.name}
                  width={520}
                  height={520}
                  priority
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(
                    shimmer(520, 520)
                  )}`}
                  className="
                    w-full
                    max-w-[280px]
                    sm:max-w-[340px]
                    lg:max-w-[480px]
                    xl:max-w-[520px]
                    h-auto
                    object-contain
                    drop-shadow-2xl
                  "
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* THUMBNAILS */}
        <div className="order-2 lg:order-1 flex lg:flex-col gap-3 justify-center">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`p-2 rounded-xl border transition
                ${activeIndex === i
                  ? "border-cyan-400 bg-white/10"
                  : "border-white/20 hover:border-cyan-400"
                }`}
            >
              <Image
                src={img}
                alt=""
                width={56}
                height={56}
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(
                  shimmer(56, 56)
                )}`}
                className="object-contain"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ---------- DETAILS ---------- */}
      <div className="flex-1 lg:pl-6">
        <h1 className="text-3xl md:text-5xl font-bold">{product.name}</h1>

        <div className="flex items-center gap-2 mt-3">
          {Array(5).fill("").map((_, i) => (
            <StarIcon
              key={i}
              size={16}
              fill={averageRating >= i + 1 ? "#00C950" : "#334155"}
            />
          ))}
          <span className="text-sm text-slate-400 ml-2">
            {product.rating.length} Reviews
          </span>
        </div>

        <div className="flex gap-3 items-center mt-5">
          <span className="text-3xl font-bold">{currency}{product.price}</span>
          <span className="line-through text-slate-400">{currency}{product.mrp}</span>
          <span className="text-green-400">
            Save {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
          </span>
        </div>

        <div className="mt-6">
          {!inCart ? (
            <button
              onClick={handleAddToCart}
              className="bg-cyan-400 text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Add to Cart
            </button>
          ) : (
            <p className="text-slate-400">Added to cart</p>
          )}
        </div>

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
