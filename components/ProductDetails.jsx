'use client'

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import {
  StarIcon,
  EarthIcon,
  CreditCardIcon,
  UserIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  AlertCircleIcon
} from "lucide-react"
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
  const maxQty = product.quantity || 0
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹"

  const [activeIndex, setActiveIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [inCart, setInCart] = useState(false)

  const isOutOfStock = maxQty <= 0
  const isAtMaxStock = quantity >= maxQty

  /* ---------- 3D MOTION VALUES ---------- */
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Softened the rotation for a more premium, subtle effect
  const rotateX = useTransform(y, [-100, 100], [8, -8])
  const rotateY = useTransform(x, [-100, 100], [-8, 8])

  /* ---------- CART SYNC ---------- */
  useEffect(() => {
    if (cart[productId] && cart[productId] > 0) {
      const safeQty = Math.min(cart[productId], maxQty)
      setQuantity(safeQty)
      setInCart(true)
    } else {
      setInCart(false)
      setQuantity(1)
    }
  }, [cart, productId, maxQty])

  /* ---------- HANDLERS ---------- */
  const handleAddToCart = () => {
    if (isOutOfStock) return

    dispatch(setCartItemQuantity({
      productId,
      quantity: 1,
      maxQuantity: maxQty
    }))

    setInCart(true)
  }

  const handleQuantityChange = (newQty) => {
    if (newQty > maxQty) return
    if (newQty < 0) return

    if (newQty === 0) {
      dispatch(setCartItemQuantity({
        productId,
        quantity: 0,
        maxQuantity: maxQty
      }))
      setInCart(false)
      setQuantity(1)
      return
    }

    setQuantity(newQty)
    dispatch(setCartItemQuantity({
      productId,
      quantity: newQty,
      maxQuantity: maxQty
    }))
  }

  const averageRating = product.rating?.length
    ? product.rating.reduce((a, b) => a + b.rating, 0) / product.rating.length
    : 0

  const handleSwipe = (_, info) => {
    if (info.offset.x < -80 && activeIndex < product.images.length - 1)
      setActiveIndex(i => i + 1)

    if (info.offset.x > 80 && activeIndex > 0)
      setActiveIndex(i => i - 1)
  }

  return (
    <div className="max-w-7xl mx-auto my-8">
      <div className="flex flex-col lg:flex-row gap-12 p-6 lg:p-10 bg-slate-950 border border-slate-800 text-slate-200 rounded-[2.5rem] shadow-2xl shadow-black/50">

        {/* ---------------- IMAGE GALLERY ---------------- */}
        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-[55%]">

          {/* THUMBNAILS */}
          <div className="order-2 lg:order-1 flex lg:flex-col gap-4 justify-center overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden transition-all duration-300
                  ${activeIndex === i
                    ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 opacity-100"
                    : "opacity-60 hover:opacity-100 border border-slate-800 bg-slate-900"
                  }`}
              >
                <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* 3D MAIN IMAGE CARD */}
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
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="order-1 lg:order-2 relative flex justify-center items-center bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-800/50 rounded-3xl w-full aspect-square overflow-hidden perspective-[1200px]"
          >
            {/* Subtle glow behind the image */}
            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleSwipe}
              className="relative z-10 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Image
                    src={product.images[activeIndex]}
                    alt={product.name}
                    width={500}
                    height={500}
                    priority
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(500, 500))}`}
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>

        </div>

        {/* ---------------- DETAILS ---------------- */}
        <div className="flex-1 flex flex-col justify-center">

          {/* Brand/Category Tag (Optional) */}
          <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase mb-3">
            {product.category || "Premium Product"}
          </span>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {product.name}
          </h1>

          {/* RATING */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              {Array(5).fill("").map((_, i) => (
                <StarIcon
                  key={i}
                  size={18}
                  className={averageRating >= i + 1 ? "fill-yellow-400 text-yellow-400" : "fill-slate-800 text-slate-800"}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors">
              {product.rating?.length || 0} Reviews
            </span>
          </div>

          {/* PRICE */}
          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl font-black text-white">{currency}{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-xl line-through text-slate-500 mb-1">{currency}{product.mrp}</span>
                <span className="mb-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">
                  SAVE {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* STOCK WARNING */}
          {maxQty > 0 && maxQty <= 5 && (
            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-lg mb-6 w-fit">
              <AlertCircleIcon size={16} />
              <span className="text-sm font-semibold">Only {maxQty} left in stock!</span>
            </div>
          )}

          {isOutOfStock && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-2 rounded-lg mb-6 w-fit">
              <AlertCircleIcon size={16} />
              <span className="text-sm font-semibold">Currently Out of Stock</span>
            </div>
          )}

          {/* PRODUCT SPECIFICATIONS */}
          {(product.size || product.weight || product.warranty) && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {product.size && (
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Size</p>
                  <p className="font-semibold text-slate-200">{product.size}</p>
                </div>
              )}
              {product.weight && (
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Weight</p>
                  <p className="font-semibold text-slate-200">{product.weight}</p>
                </div>
              )}
              {product.warranty && (
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl col-span-2">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Warranty</p>
                  <p className="font-semibold text-slate-200">{product.warranty}</p>
                </div>
              )}
            </div>
          )}

          {/* CART CONTROLS */}
          <div className="mt-auto pt-6 border-t border-slate-800/80">
            {inCart ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">

                {/* Custom Styled Quantity Pill */}
                <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-full w-full sm:w-40 h-14 px-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <MinusIcon size={20} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                  <button
                    disabled={isAtMaxStock}
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className={`p-2 rounded-full transition-colors ${isAtMaxStock
                        ? "text-slate-700 cursor-not-allowed"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                  >
                    <PlusIcon size={20} />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/cart")}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white h-14 px-8 rounded-full font-bold tracking-wide shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <ShoppingCartIcon size={20} />
                  View Cart
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
                whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center gap-2 h-14 px-8 rounded-full font-bold tracking-wide transition-all shadow-lg
                  ${isOutOfStock
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-white hover:bg-slate-100 text-slate-950 shadow-white/10"
                  }
                `}
              >
                {!isOutOfStock && <ShoppingCartIcon size={20} />}
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </motion.button>
            )}
          </div>

          {/* TRUST BENEFITS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div className="flex flex-col items-center sm:items-start gap-2 text-slate-400">
              <EarthIcon size={24} className="text-indigo-400" />
              <span className="text-sm font-medium text-center sm:text-left">Fast Worldwide Shipping</span>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-2 text-slate-400">
              <CreditCardIcon size={24} className="text-indigo-400" />
              <span className="text-sm font-medium text-center sm:text-left">100% Secure Payments</span>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-2 text-slate-400">
              <UserIcon size={24} className="text-indigo-400" />
              <span className="text-sm font-medium text-center sm:text-left">Trusted By Thousands</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProductDetails