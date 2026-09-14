"use client";

import { Minus, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementItem,
  decrementItem,
  deleteItemFromCart,
} from "@/lib/features/cart/cartSlice";

const Counter = ({ productId }) => {
  const dispatch = useDispatch();

  // Current quantity in cart
  const quantity = useSelector(
    (state) => state.cart.cartItems[productId] || 0
  );

  // Product info from product list
  const product = useSelector((state) =>
    state.product.list.find((p) => p.id === productId)
  );

  // If product is missing, do not render
  if (!product) return null;

  const maxQuantity = product.quantity;

  // Handle decrement
  const handleDecrement = () => {
    if (quantity <= 1) {
      dispatch(deleteItemFromCart({ productId }));
    } else {
      dispatch(decrementItem({ productId }));
    }
  };

  // Handle increment
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      dispatch(
        incrementItem({
          productId,
          maxQuantity,
        })
      );
    }
  };

  return (
    <div className="inline-flex h-9 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Decrement */}

      <button
        type="button"
        onClick={handleDecrement}
        className="flex h-9 w-9 items-center justify-center text-slate-500 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95"
        aria-label="Decrease quantity"
      >
        <Minus
          size={14}
          strokeWidth={2.5}
        />
      </button>

      {/* Quantity */}

      <div className="flex h-9 min-w-[34px] items-center justify-center border-x border-slate-200 bg-slate-50 px-2">
        <span className="text-sm font-black leading-none text-slate-900">
          {quantity}
        </span>
      </div>

      {/* Increment */}

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
        className="flex h-9 w-9 items-center justify-center text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        aria-label="Increase quantity"
      >
        <Plus
          size={14}
          strokeWidth={2.5}
        />
      </button>

    </div>
  );
};

export default Counter;