'use client'

import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

  const { cartItems } = useSelector(state => state.cart);
  const products = useSelector(state => state.product.list);

  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Build cart array and calculate total
  useEffect(() => {
    let total = 0;
    const arr = [];

    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find(p => p.id === key);
      if (product) {
        arr.push({ ...product, quantity: value });
        total += product.price * value;
      }
    }

    setCartArray(arr);
    setTotalPrice(total);
  }, [cartItems, products]);

  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  // If cart is empty
  if (!cartArray.length) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center bg-[#0f172a] gap-4">
        <h1 className="text-3xl font-semibold text-white">
          Your cart is empty 🛒
        </h1>
        <p className="text-slate-400">
          Looks like you haven’t added anything yet.
        </p>
        <Link
          href="/shop"  // Change to your shop page route
          className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Shop More
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] py-10 px-6 text-white">
      <div className="max-w-7xl mx-auto">

        {/* Page Title */}
        <PageTitle
          heading="Shopping Cart"
          text={`${cartArray.length} items in your cart`}
          linkText="Continue shopping"
          linkHref="/shop"
          textColor="text-slate-300"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartArray.map(item => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-white/5 p-5 rounded-2xl shadow-lg"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4 w-full">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {item.name}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {item.category}
                    </p>
                    <p className="font-medium mt-1">
                      {currency}{item.price}
                    </p>
                  </div>
                </div>

                {/* Quantity + Price */}
                <div className="flex flex-col items-center gap-2">
                  <Counter productId={item.id} />
                  <p className="text-sm font-semibold">
                    {currency}{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleDeleteItemFromCart(item.id)}
                  className="text-red-400 hover:bg-red-600/20 p-3 rounded-full transition active:scale-95"
                >
                  <Trash2Icon size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary + Trust Badges */}
          <div className="lg:sticky top-24 h-fit space-y-4">

            <OrderSummary 
              totalPrice={totalPrice} 
              items={cartArray} 
              className="bg-white/5 text-white shadow-lg rounded-2xl p-6"
            />

            {/* 🔐 Trust Badges */}
            <div className="flex justify-center gap-4 text-xs text-slate-300">
              <span>🔐 Secure Checkout</span>
              <span>💳 Stripe Verified</span>
              <span>🛡️ Clerk Auth</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
