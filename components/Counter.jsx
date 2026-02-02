'use client'

import { Minus, Plus } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import {
  incrementItem,
  decrementItem,
  deleteItemFromCart,
} from "@/lib/features/cart/cartSlice"

const Counter = ({ productId }) => {
  const dispatch = useDispatch()

  // Current quantity in cart
  const quantity = useSelector(
    state => state.cart.cartItems[productId] || 0
  )

  // Product info from product list
  const product = useSelector(state =>
    state.product.list.find(p => p.id === productId)
  )

  // If product is missing, do not render
  if (!product) return null

  const maxQuantity = product.quantity // stock limit

  // Handle decrement click
  const handleDecrement = () => {
    if (quantity <= 1) {
      // Remove from cart when quantity reaches 0
      dispatch(deleteItemFromCart({ productId }))
    } else {
      dispatch(decrementItem({ productId }))
    }
  }

  // Handle increment click
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      dispatch(incrementItem({ productId, maxQuantity }))
    }
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-slate-200 text-slate-600 bg-white/5 text-white">
      {/* Decrement */}
      <button
        onClick={handleDecrement}
        className="p-1 select-none active:scale-95 hover:text-red-400 transition"
      >
        <Minus size={14} />
      </button>

      {/* Quantity */}
      <span className="px-2 min-w-[20px] text-center">
        {quantity}
      </span>

      {/* Increment */}
      <button
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
        className="p-1 select-none disabled:opacity-40 active:scale-95 hover:text-green-400 transition"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

export default Counter
