'use client'

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import { StarIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { setCartItemQuantity } from "@/lib/features/cart/cartSlice"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"

/* -------------------- SHIMMER -------------------- */
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
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite" />
</svg>
`

const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str)

/* -------------------- COMPONENT -------------------- */
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

  /* ---------- 3D MOTION VALUES ---------- */
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [12, -12])
  const rotateY = useTransform(x, [-100, 100], [-12, 12])

  /* ---------- CART SYNC ---------- */
  useEffect(() => {
    if (cart[productId] && cart[productId] > 0) {
      setQuantity(cart[productId])
      setInCart(true)
    } else {
      setInCart(false)
      setQuantity(1)
    }
  }, [cart, productId])

  const handleAddToCart = () => {
    dispatch(setCartItemQuantity({ productId, quantity: 1, maxQuantity: maxQty }))
    setInCart(true)
  }

  const handleQuantityChange = (newQty) => {
    if (newQty <= 0) {
      dispatch(setCartItemQuantity({ productId, quantity: 0, maxQuantity: maxQty }))
      setInCart(false)
      setQuantity(1)
      return
    }

    setQuantity(newQty)
    dispatch(setCartItemQuantity({ productId, quantity: newQty, maxQuantity: maxQty }))
  }

  const averageRating = product.rating.length
    ? product.rating.reduce((a, b) => a + b.rating, 0) / product.rating.length
    : 0

  const handleSwipe = (_, info) => {
    if (info.offset.x < -80 && activeIndex < product.images.length - 1)
      setActiveIndex(i => i + 1)

    if (info.offset.x > 80 && activeIndex > 0)
      setActiveIndex(i => i - 1)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 px-6 py-10 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-3xl shadow-xl">

      {/* ---------------- IMAGE GALLERY ---------------- */}
      <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-[58%]">

        {/* 3D IMAGE CARD */}
        <motion.div
          style={{ rotateX, rotateY }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            x.set(e.clientX - rect.left - rect.width / 2)
            y.set(e.clientY - rect.top - rect.height / 2)
          }}
          onMouseLeave={() => {
            x.set(0)
            y.set(0)
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="order-1 lg:order-2 flex justify-center items-center bg-white/5 p-6 rounded-2xl w-full overflow-hidden perspective-[1200px]"
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleSwipe}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={product.images[activeIndex]}
                  alt={product.name}
                  width={420}
                  height={420}
                  priority
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(420, 420))}`}
                  className="object-contain drop-shadow-[0_30px_60px_rgba(0,255,255,0.25)]"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>

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
              <Image src={img} alt="" width={56} height={56} />
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- DETAILS ---------------- */}
      <div className="flex-1">
        <h1 className="text-3xl md:text-5xl font-bold">{product.name}</h1>

        {/* RATING */}
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

        {/* PRICE */}
        <div className="flex gap-3 items-center mt-5">
          <span className="text-3xl font-bold">{currency}{product.price}</span>
          <span className="line-through text-slate-400">{currency}{product.mrp}</span>
          <span className="text-green-400">
            Save {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
          </span>
        </div>

        {/* CART */}
        <div className="mt-6">
          {inCart ? (
            <div className="flex items-center gap-4">
              <button onClick={() => handleQuantityChange(quantity - 1)} className="border px-3 py-1 rounded">−</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(quantity + 1)} className="border px-3 py-1 rounded">+</button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/cart")}
                className="ml-4 bg-emerald-400 text-black px-6 py-2 rounded-xl font-semibold shadow-lg"
              >
                View Cart
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="bg-cyan-400 text-black px-8 py-3 rounded-xl font-semibold shadow-lg"
            >
              Add to Cart
            </motion.button>
          )}
        </div>

        {/* BENEFITS */}
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
