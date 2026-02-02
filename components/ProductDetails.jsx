'use client'

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import { StarIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { setCartItemQuantity } from "@/lib/features/cart/cartSlice"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useAnimationFrame
} from "framer-motion"

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
  const [isInteracting, setIsInteracting] = useState(false)

  /* ---------- SOUND ---------- */
  const clickSound = useRef(null)
  const addSound = useRef(null)

  useEffect(() => {
    clickSound.current = new Audio("/sounds/click.mp3")
    addSound.current = new Audio("/sounds/add.mp3")
  }, [])

  const playClick = () => clickSound.current?.play()
  const playAdd = () => addSound.current?.play()

  /* ---------- 3D MOTION ---------- */
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const autoRotate = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [12, -12])
  const rotateY = useTransform(x, [-100, 100], [-12, 12])

  /* ---------- AUTO ROTATE ---------- */
  useAnimationFrame((t) => {
    if (!isInteracting) {
      autoRotate.set((t / 80) % 360)
    }
  })

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
    playAdd()
    dispatch(setCartItemQuantity({ productId, quantity: 1, maxQuantity: maxQty }))
    setInCart(true)
  }

  const handleQuantityChange = (newQty) => {
    playClick()

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

  return (
    <div className="flex flex-col lg:flex-row gap-12 px-6 py-10 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-3xl shadow-xl">

      {/* ---------------- IMAGE ---------------- */}
      <div className="w-full lg:w-[58%]">

        <motion.div
          style={{ rotateX, rotateY, rotateZ: autoRotate }}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            x.set(e.clientX - rect.left - rect.width / 2)
            y.set(e.clientY - rect.top - rect.height / 2)
          }}
          whileHover={{ scale: 1.06 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="flex justify-center items-center bg-white/5 p-6 rounded-2xl perspective-[1200px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Image
                src={product.images[activeIndex]}
                alt={product.name}
                width={420}
                height={420}
                priority
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(420, 420))}`}
                className="object-contain drop-shadow-[0_40px_80px_rgba(0,255,255,0.35)]"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ---------------- DETAILS ---------------- */}
      <div className="flex-1">
        <h1 className="text-4xl font-bold">{product.name}</h1>

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
        </div>

        {/* CART */}
        <div className="mt-6">
          {inCart ? (
            <div className="flex items-center gap-4">
              <button onClick={() => handleQuantityChange(quantity - 1)} className="border px-3 py-1 rounded">−</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(quantity + 1)} className="border px-3 py-1 rounded">+</button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playClick()
                  router.push("/cart")
                }}
                className="ml-4 bg-emerald-400 text-black px-6 py-2 rounded-xl font-semibold shadow-xl"
              >
                View Cart
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="bg-cyan-400 text-black px-8 py-3 rounded-xl font-semibold shadow-xl"
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
