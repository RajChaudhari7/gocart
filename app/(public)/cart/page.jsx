"use client";

import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import {
  ShoppingBagIcon,
  Trash2Icon,
  ArrowRight,
  Sparkles,
  ShoppingBasket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

  const { cartItems } = useSelector(
    (state) => state.cart
  );

  const products = useSelector(
    (state) => state.product.list
  );

  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // ================= BUILD CART =================

  useEffect(() => {
    let total = 0;
    const arr = [];

    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find(
        (p) => p.id === key
      );

      if (product) {
        arr.push({
          ...product,
          quantity: value,
        });

        total += product.price * value;
      }
    }

    setCartArray(arr);
    setTotalPrice(total);
  }, [cartItems, products]);

  // ================= DELETE =================

  const handleDeleteItemFromCart = (productId) => {
    dispatch(
      deleteItemFromCart({
        productId,
      })
    );
  };

  // ================= EMPTY CART =================

  if (!cartArray.length) {
    return (
      <section className="relative min-h-[85vh] overflow-hidden bg-slate-50 px-4 py-24 sm:px-6">

        {/* Background decoration */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <motion.div
            animate={{
              x: [0, 25, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl"
          />

        </div>

        <div className="relative mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center text-center">

          {/* Animated icon */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.7,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="relative mb-7"
          >

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -inset-3 rounded-full border border-dashed border-emerald-200"
            />

            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">

              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ShoppingBagIcon
                  size={42}
                  strokeWidth={1.7}
                />
              </motion.div>

            </div>

            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="absolute -right-2 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-500"
            >
              <Sparkles size={14} />
            </motion.div>

          </motion.div>

          {/* Badge */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700"
          >
            <ShoppingBasket size={13} />
            Your cart is waiting
          </motion.div>

          {/* Heading */}

          <motion.h1
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl"
          >
            Your cart is empty
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.3,
            }}
            className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base"
          >
            Nothing here yet. Explore nearby stores and
            discover products you'll love.
          </motion.p>

          {/* CTA */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
          >
            <Link
              href="/product"
              className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl active:scale-[0.98] sm:px-8 sm:py-4"
            >
              Start Shopping

              <motion.span
                animate={{
                  x: [0, 4, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </Link>
          </motion.div>

          {/* Small benefits */}

          <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-2 sm:gap-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-lg">
                🚚
              </div>

              <p className="mt-1 text-[11px] font-semibold text-slate-600 sm:text-xs">
                Fast Delivery
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-lg">
                🏪
              </div>

              <p className="mt-1 text-[11px] font-semibold text-slate-600 sm:text-xs">
                Local Stores
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-lg">
                💳
              </div>

              <p className="mt-1 text-[11px] font-semibold text-slate-600 sm:text-xs">
                Easy Payment
              </p>
            </div>

          </div>

        </div>
      </section>
    );
  }

  // ================= CART =================

  return (
    <section className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 text-slate-900 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-7 sm:mb-9">

          <PageTitle
            heading="Shopping Cart"
            text={`${cartArray.length} ${cartArray.length === 1
                ? "item"
                : "items"
              } in your cart`}
            linkText="Continue shopping"
            linkHref="/product"
            textColor="text-slate-500"
          />

        </div>

        {/* ================= CART LAYOUT ================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">

          {/* ================= CART ITEMS ================= */}

          <div className="space-y-3 lg:col-span-8">

            {/* Section heading */}

            <div className="mb-2 flex items-center justify-between px-1">

              <div>
                <h2 className="text-base font-black text-slate-900 sm:text-lg">
                  Your Items
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Review your products before checkout
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
                {cartArray.length}{" "}
                {cartArray.length === 1
                  ? "item"
                  : "items"}
              </span>

            </div>

            <AnimatePresence mode="popLayout">

              {cartArray.map((item) => (

                <motion.div
                  layout
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  key={item.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-md sm:p-4"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                    {/* PRODUCT */}

                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">

                      {/* Image */}

                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-24 sm:w-24">

                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />

                      </div>

                      {/* Details */}

                      <div className="min-w-0 flex-1">

                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 sm:text-xs">
                          {item.category}
                        </p>

                        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 sm:text-base">
                          {item.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-2">

                          <span className="text-sm font-black text-slate-900">
                            {currency}
                            {Number(
                              item.price
                            ).toLocaleString()}
                          </span>

                          <span className="text-xs text-slate-400">
                            / item
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">

                      <Counter
                        productId={item.id}
                      />

                      <div className="flex items-center gap-3 sm:gap-5">

                        {/* Item total */}

                        <div className="text-right">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Total
                          </p>

                          <p className="text-sm font-black text-slate-900 sm:text-base">
                            {currency}
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString()}
                          </p>
                        </div>

                        {/* Delete */}

                        <button
                          onClick={() =>
                            handleDeleteItemFromCart(
                              item.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
                          title="Remove item"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2Icon size={16} />
                        </button>

                      </div>

                    </div>

                  </div>

                </motion.div>

              ))}

            </AnimatePresence>

          </div>

          {/* ================= SUMMARY ================= */}

          <div className="lg:col-span-4">

            <div className="lg:sticky lg:top-24">

              {/* Summary wrapper */}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <ShoppingBagIcon size={18} />
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-slate-900">
                        Order Summary
                      </h2>

                      <p className="text-xs text-slate-500">
                        Ready for checkout
                      </p>
                    </div>

                  </div>

                </div>

                <div className="p-3 sm:p-4">
                  <OrderSummary
                    totalPrice={totalPrice}
                    items={cartArray}
                  />
                </div>

              </div>

              {/* ================= TRUST ================= */}

              <div className="mt-4 grid grid-cols-3 gap-2">

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                  <div className="text-base">
                    🔐
                  </div>

                  <p className="mt-1 text-[10px] font-bold text-slate-500">
                    Secure
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                  <div className="text-base">
                    💳
                  </div>

                  <p className="mt-1 text-[10px] font-bold text-slate-500">
                    Payments
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                  <div className="text-base">
                    🛡️
                  </div>

                  <p className="mt-1 text-[10px] font-bold text-slate-500">
                    Verified
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}