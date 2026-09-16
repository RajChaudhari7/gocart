"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import {
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  AlertCircleIcon,
  StoreIcon,
  TruckIcon,
  CheckIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { setCartItemQuantity } from "@/lib/features/cart/cartSlice";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";

/* -------------------------------------------------------
   SHIMMER
------------------------------------------------------- */

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f8fafc" offset="20%" />
      <stop stop-color="#ffffff" offset="50%" />
      <stop stop-color="#f8fafc" offset="70%" />
    </linearGradient>
  </defs>

  <rect width="${w}" height="${h}" fill="#f8fafc" />

  <rect
    id="r"
    width="${w}"
    height="${h}"
    fill="url(#g)"
  />

  <animate
    xlink:href="#r"
    attributeName="x"
    from="-${w}"
    to="${w}"
    dur="1.2s"
    repeatCount="indefinite"
  />
</svg>
`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

const ProductDetails = ({ product }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { isSignedIn, user } = useUser();

  const cart = useSelector((state) => state.cart.cartItems);

  const productId = product.id;
  const maxQty = product.quantity || 0;

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(false);

  const isOutOfStock = maxQty <= 0;
  const isAtMaxStock = quantity >= maxQty;

  /* -------------------------------------------------------
     IMAGE MOTION
  ------------------------------------------------------- */

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [4, -4]);
  const rotateY = useTransform(x, [-100, 100], [-4, 4]);

  /* -------------------------------------------------------
     CART SYNC
  ------------------------------------------------------- */

  useEffect(() => {
    if (cart[productId] && cart[productId] > 0) {
      const safeQty = Math.min(cart[productId], maxQty);

      setQuantity(safeQty);
      setInCart(true);
    } else {
      setInCart(false);
      setQuantity(1);
    }
  }, [cart, productId, maxQty]);

  /* -------------------------------------------------------
     PRODUCT VIEW COUNT
  ------------------------------------------------------- */

  useEffect(() => {
    if (!product?.id) return;

    const viewedKey = `viewed-${product.id}`;

    if (sessionStorage.getItem(viewedKey)) return;

    const recordView = async () => {
      try {
        await axios.post(`/api/products/${product.id}/view`);

        sessionStorage.setItem(viewedKey, "true");
      } catch (error) {
        console.log(error);
      }
    };

    recordView();
  }, [product?.id]);

  /* -------------------------------------------------------
     USER ACTIVITY TRACKING
  ------------------------------------------------------- */

  useEffect(() => {
    if (!isSignedIn || !user || !product?.id) return;

    const timer = setTimeout(async () => {
      try {
        await axios.post("/api/activity/view", {
          productId: product.id,
        });
      } catch (error) {
        console.log(error);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [product?.id, isSignedIn, user]);

  /* -------------------------------------------------------
     CART HANDLERS
  ------------------------------------------------------- */

  const handleAddToCart = () => {
    if (!isSignedIn) {
      toast.error("Please login to add this product to your cart.");
      return;
    }

    if (isOutOfStock) return;

    dispatch(
      setCartItemQuantity({
        productId,
        quantity: 1,
        maxQuantity: maxQty,
      })
    );

    setInCart(true);
  };

  const handleQuantityChange = (newQty) => {
    if (newQty > maxQty) return;
    if (newQty < 0) return;

    if (newQty === 0) {
      dispatch(
        setCartItemQuantity({
          productId,
          quantity: 0,
          maxQuantity: maxQty,
        })
      );

      setInCart(false);
      setQuantity(1);

      return;
    }

    setQuantity(newQty);

    dispatch(
      setCartItemQuantity({
        productId,
        quantity: newQty,
        maxQuantity: maxQty,
      })
    );
  };

  /* -------------------------------------------------------
     RATING
  ------------------------------------------------------- */

  const averageRating = product.rating?.length
    ? product.rating.reduce(
      (total, item) => total + Number(item.rating),
      0
    ) / product.rating.length
    : 0;

  /* -------------------------------------------------------
     IMAGE SWIPE
  ------------------------------------------------------- */

  const handleSwipe = (_, info) => {
    if (
      info.offset.x < -80 &&
      activeIndex < product.images.length - 1
    ) {
      setActiveIndex((index) => index + 1);
    }

    if (info.offset.x > 80 && activeIndex > 0) {
      setActiveIndex((index) => index - 1);
    }
  };

  /* -------------------------------------------------------
     DISCOUNT
  ------------------------------------------------------- */

  const discount =
    product.mrp > product.price
      ? Math.round(
        ((product.mrp - product.price) / product.mrp) * 100
      )
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* ---------------------------------------------------
          MAIN PRODUCT CARD
      --------------------------------------------------- */}

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_50px_rgba(15,23,42,0.07)]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          {/* =================================================
              LEFT — IMAGE GALLERY
          ================================================= */}

          <div className="border-b border-slate-100 p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* ---------------------------------------------
                  THUMBNAILS
              --------------------------------------------- */}

              <div className="order-2 flex w-full gap-3 overflow-x-auto pb-1 lg:order-1 lg:w-[82px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
                {product.images?.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border bg-white transition-all duration-200 lg:h-[76px] lg:w-[76px] ${activeIndex === index
                        ? "border-orange-500 ring-2 ring-orange-100"
                        : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="76px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>

              {/* ---------------------------------------------
                  MAIN IMAGE
              --------------------------------------------- */}

              <motion.div
                style={{
                  rotateX,
                  rotateY,
                }}
                onMouseMove={(event) => {
                  const rect =
                    event.currentTarget.getBoundingClientRect();

                  x.set(
                    event.clientX -
                    rect.left -
                    rect.width / 2
                  );

                  y.set(
                    event.clientY -
                    rect.top -
                    rect.height / 2
                  );
                }}
                onMouseLeave={() => {
                  x.set(0);
                  y.set(0);
                }}
                className="order-1 relative flex aspect-square min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-[#fffaf5] lg:order-2 lg:min-h-[500px]"
              >
                {/* Soft decorative shapes */}

                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />

                {/* Image */}

                <motion.div
                  drag="x"
                  dragConstraints={{
                    left: 0,
                    right: 0,
                  }}
                  onDragEnd={handleSwipe}
                  className="relative z-10 flex h-full w-full cursor-grab items-center justify-center p-8 active:cursor-grabbing sm:p-12 lg:p-14"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{
                        opacity: 0,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 1.02,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={
                          product.images?.[activeIndex] ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        fill
                        priority={activeIndex === 0}
                        sizes="(max-width: 768px) 100vw, 550px"
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${toBase64(
                          shimmer(500, 500)
                        )}`}
                        className="pointer-events-none object-contain drop-shadow-[0_18px_30px_rgba(15,23,42,0.12)]"
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Discount Badge */}

                {discount > 0 && (
                  <div className="absolute left-4 top-4 z-20 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white shadow-sm">
                    {discount}% OFF
                  </div>
                )}

                {/* Image Counter */}

                {product.images?.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-20 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">
                    {activeIndex + 1} / {product.images.length}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Mobile swipe hint */}

            {product.images?.length > 1 && (
              <p className="mt-3 text-center text-xs font-medium text-slate-400 lg:hidden">
                Swipe the product image to browse
              </p>
            )}
          </div>

          {/* =================================================
              RIGHT — PRODUCT INFORMATION
          ================================================= */}

          <div className="flex flex-col p-5 sm:p-7 lg:p-10">
            {/* Category */}

            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-600">
                {product.category || "Product"}
              </span>

              {product.store?.name && (
                <>
                  <span className="text-slate-300">•</span>

                  <span className="text-xs font-medium text-slate-400">
                    {product.store.name}
                  </span>
                </>
              )}
            </div>

            {/* Product name */}

            <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.7rem]">
              {product.name}
            </h1>

            {/* Rating */}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5">
                <span className="text-sm font-black text-slate-900">
                  {averageRating
                    ? averageRating.toFixed(1)
                    : "0.0"}
                </span>

                <StarIcon
                  size={14}
                  className="fill-orange-400 text-orange-400"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const reviews =
                    document.getElementById("product-reviews");

                  reviews?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="text-sm font-semibold text-slate-500 transition hover:text-orange-600"
              >
                {product.rating?.length || 0}{" "}
                {product.rating?.length === 1
                  ? "review"
                  : "reviews"}
              </button>
            </div>

            {/* Divider */}

            <div className="my-6 h-px bg-slate-100" />

            {/* Price */}

            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                {currency}
                {product.price}
              </span>

              {product.mrp > product.price && (
                <>
                  <span className="mb-1 text-lg font-medium text-slate-400 line-through">
                    {currency}
                    {product.mrp}
                  </span>

                  <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">
                    Save {currency}
                    {product.mrp - product.price}
                  </span>
                </>
              )}
            </div>

            {discount > 0 && (
              <p className="mt-2 text-sm font-medium text-emerald-600">
                You save {discount}% on this product
              </p>
            )}

            {/* Stock */}

            <div className="mt-6">
              {isOutOfStock ? (
                <div className="flex w-fit items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600">
                  <AlertCircleIcon size={17} />
                  Currently out of stock
                </div>
              ) : maxQty <= 5 ? (
                <div className="flex w-fit items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700">
                  <AlertCircleIcon size={17} />
                  Only {maxQty} left in stock
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <CheckIcon size={17} strokeWidth={2.5} />
                  In stock
                </div>
              )}
            </div>

            {/* Specifications */}

            {(product.size ||
              product.weight ||
              product.warranty) && (
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {product.size && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Size
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {product.size}
                      </p>
                    </div>
                  )}

                  {product.weight && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Weight
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {product.weight}
                      </p>
                    </div>
                  )}

                  {product.warranty && (
                    <div className="col-span-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Warranty
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {product.warranty}
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* =================================================
                CART AREA
            ================================================= */}

            <div className="mt-8 border-t border-slate-100 pt-7">
              {inCart ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* Quantity */}

                  <div className="flex h-14 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-2 sm:w-40">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isSignedIn) {
                          toast.error(
                            "Please login to manage your cart."
                          );
                          return;
                        }

                        handleQuantityChange(quantity - 1);
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900"
                    >
                      <MinusIcon size={18} />
                    </button>

                    <span className="text-base font-black text-slate-900">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      disabled={isAtMaxStock}
                      onClick={() => {
                        if (!isSignedIn) {
                          toast.error(
                            "Please login to manage your cart."
                          );
                          return;
                        }

                        handleQuantityChange(quantity + 1);
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${isAtMaxStock
                          ? "cursor-not-allowed text-slate-300"
                          : "text-slate-500 hover:bg-white hover:text-slate-900"
                        }`}
                    >
                      <PlusIcon size={18} />
                    </button>
                  </div>

                  {/* View Cart */}

                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/cart")}
                    className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:bg-orange-500"
                  >
                    <ShoppingCartIcon size={19} />
                    View Cart
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileHover={
                    !isOutOfStock ? { y: -1 } : {}
                  }
                  whileTap={
                    !isOutOfStock ? { scale: 0.98 } : {}
                  }
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl px-8 text-sm font-black transition-all ${isOutOfStock
                      ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                      : "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                    }`}
                >
                  {!isOutOfStock && (
                    <ShoppingCartIcon size={20} />
                  )}

                  {isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </motion.button>
              )}
            </div>

            {/* =================================================
                LOCAL MARKETPLACE BENEFITS
            ================================================= */}

            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-slate-100 pt-7">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                  <TruckIcon
                    size={18}
                    className="text-orange-500"
                  />
                </div>

                <p className="mt-2 text-xs font-bold text-slate-800">
                  Local delivery
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  From nearby stores
                </p>
              </div>

              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <ShieldCheckIcon
                    size={18}
                    className="text-emerald-500"
                  />
                </div>

                <p className="mt-2 text-xs font-bold text-slate-800">
                  Secure checkout
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Safe & protected
                </p>
              </div>

              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                  <MapPinIcon
                    size={18}
                    className="text-purple-500"
                  />
                </div>

                <p className="mt-2 text-xs font-bold text-slate-800">
                  Nearby shops
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Shop local
                </p>
              </div>
            </div>

            {/* Store mini-link */}

            {product.store?.name && (
              <div className="mt-7 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                  <StoreIcon
                    size={17}
                    className="text-orange-500"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Sold by
                  </p>

                  <p className="truncate text-sm font-bold text-slate-800">
                    {product.store.name}
                  </p>
                </div>

                {product.store.username && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/shop/${product.store.username}`
                      )
                    }
                    className="text-xs font-black text-orange-600 hover:text-orange-700"
                  >
                    Visit →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;