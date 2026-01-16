'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
  const dispatch = useDispatch();
  const router = useRouter();
  const cart = useSelector((state) => state.cart.cartItems);

  const [mainImage, setMainImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = !product.inStock || product.quantity === 0;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0],
      })
    );
  };

  return (
    <div className="flex gap-12">
      {/* IMAGE */}
      <Image src={mainImage} width={250} height={250} alt="" />

      {/* DETAILS */}
      <div>
        <h1 className="text-3xl">{product.name}</h1>

        {isOutOfStock && (
          <p className="text-red-600 font-semibold mt-2">Out of Stock</p>
        )}

        <p className="text-2xl mt-4">
          {currency}{product.price}
        </p>

        {/* QUANTITY */}
        <div className="mt-6">
          <button
            disabled={isOutOfStock || quantity === 1}
            onClick={() => setQuantity(q => q - 1)}
          >−</button>

          <span className="mx-4">{quantity}</span>

          <button
            disabled={isOutOfStock || quantity === product.quantity}
            onClick={() => setQuantity(q => q + 1)}
          >+</button>
        </div>

        {/* ACTION */}
        <button
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="mt-6 px-8 py-3 bg-slate-800 text-white disabled:opacity-50"
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

        {cart[product.id] && (
          <button onClick={() => router.push("/cart")} className="ml-4">
            View Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
