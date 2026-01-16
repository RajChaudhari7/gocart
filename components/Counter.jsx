'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus } from "lucide-react";

const Counter = ({ productId }) => {
    const dispatch = useDispatch();

    const { cartItems } = useSelector(state => state.cart);
    const quantity = cartItems[productId] || 0;

    const product = useSelector(state =>
        state.product.list.find(p => p.id === productId)
    );
    if (!product) return null;

    const maxQuantity = product.quantity;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-slate-200 text-slate-600">
            <button
                onClick={() => dispatch(removeFromCart({ productId }))}
                disabled={quantity === 0}
                className="p-1 select-none disabled:opacity-40 active:scale-95"
            >
                <Minus size={14} />
            </button>

            <p className="px-2">{quantity}</p>

            <button
                onClick={() => dispatch(addToCart({ productId, maxQuantity }))}
                disabled={quantity >= maxQuantity}
                className="p-1 select-none disabled:opacity-40 active:scale-95"
            >
                <Plus size={14} />
            </button>
        </div>
    )
}

export default Counter;
