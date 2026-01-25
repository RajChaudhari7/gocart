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

  const quantity = useSelector(
    state => state.cart.cartItems[productId] || 0
  )

  const product = useSelector(state =>
    state.product.list.find(p => p.id === productId)
  )

  if (!product) return null

  const maxQuantity = product.quantity

  const handleDecrement = () => {
    if (quantity <= 1) {
      // Remove item from cart if quantity <= 1
      dispatch(deleteItemFromCart({ productId }))
    } else {
      dispatch(decrementItem({ productId }))
    }
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-slate-200 text-slate-600">
      <button
        onClick={handleDecrement}
        className="p-1 select-none active:scale-95"
      >
        <Minus size={14} />
      </button>

      <span className="px-2 min-w-[20px] text-center">
        {quantity}
      </span>

      <button
        onClick={() =>
          dispatch(
            incrementItem({
              productId,
              maxQuantity,
            })
          )
        }
        disabled={quantity >= maxQuantity}
        className="p-1 select-none disabled:opacity-40 active:scale-95"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

export default Counter
