'use client'

import Counter from "@/components/Counter"
import OrderSummary from "@/components/OrderSummary"
import PageTitle from "@/components/PageTitle"
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice"
import { ShoppingBagIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"

export default function Cart() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

  const { cartItems } = useSelector(state => state.cart)
  const products = useSelector(state => state.product.list)

  const dispatch = useDispatch()

  const [cartArray, setCartArray] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)

  // Build cart array and calculate total
  useEffect(() => {
    let total = 0
    const arr = []

    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find(p => p.id === key)
      if (product) {
        arr.push({ ...product, quantity: value })
        total += product.price * value
      }
    }

    setCartArray(arr)
    setTotalPrice(total)
  }, [cartItems, products])

  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }))
  }

  // Empty State
  if (!cartArray.length) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center bg-slate-950 px-6">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-800">
          <ShoppingBagIcon size={40} className="text-slate-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Your cart is empty
        </h1>
        <p className="text-slate-400 max-w-md mb-8">
          Looks like you haven’t added anything to your cart yet. Discover our latest products and find something you love.
        </p>
        <Link
          href="/product"
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-slate-200">
      <div className="max-w-7xl mx-auto">

        {/* Page Title */}
        <div className="mb-10">
          <PageTitle
            heading="Shopping Cart"
            text={`${cartArray.length} items in your cart`}
            linkText="Continue shopping"
            linkHref="/product"
            textColor="text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <AnimatePresence>
              {cartArray.map(item => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-lg"
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-5 w-full sm:w-auto flex-1">
                    <div className="relative w-24 h-24 sm:w-20 sm:h-20 bg-slate-950 rounded-2xl flex-shrink-0 border border-slate-800 p-2">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-semibold text-white text-base sm:text-lg leading-tight mb-2 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="font-bold text-slate-300">
                        {currency}{(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Counter + Delete) */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-800 sm:border-none">
                    <Counter productId={item.id} />

                    <div className="flex items-center gap-4">
                      <p className="text-lg font-black text-white sm:hidden">
                        {currency}{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleDeleteItemFromCart(item.id)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 p-2.5 rounded-full transition-colors"
                        title="Remove item"
                      >
                        <Trash2Icon size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden sm:block w-24 text-right">
                    <p className="text-lg font-black text-white">
                      {currency}{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-8">
              <OrderSummary
                totalPrice={totalPrice}
                items={cartArray}
              />

              {/* Trust Badges */}
              <div className="flex justify-center gap-6 mt-6 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><span className="text-lg">🔐</span> Secure</span>
                <span className="flex items-center gap-1.5"><span className="text-lg">💳</span> Stripe</span>
                <span className="flex items-center gap-1.5"><span className="text-lg">🛡️</span> Verified</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}