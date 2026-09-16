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
     Only really useful on desktop.
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
      toast.error(
        "Please login to add this product to your cart."
      );
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
      info.offset.x < -60 &&
      activeIndex < product.images.length - 1
    ) {
      setActiveIndex((index) => index + 1);
    }

    if (info.offset.x > 60 && activeIndex > 0) {
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
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      {/* =====================================================
          MAIN PRODUCT CARD
      ===================================================== */}

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:rounded-[2rem]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">

          {/* =================================================
              IMAGE SECTION
          ================================================= */}

          <div className="border-b border-slate-100 p-3 sm:p-5 lg:border-b-0 lg:border-r lg:p-8">

            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row">

              {/* ---------------------------------------------
                  THUMBNAILS
              --------------------------------------------- */}

              <div
                className="
                  order-2
                  flex
                  w-full
                  gap-2
                  overflow-x-auto
                  pb-1
                  scrollbar-hide

                  lg:order-1
                  lg:w-[78px]
                  lg:flex-col
                  lg:overflow-x-hidden
                  lg:overflow-y-auto
                "
              >
                {product.images?.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`
                      relative
                      h-[58px]
                      w-[58px]
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      border
                      bg-white
                      transition-all

                      sm:h-[68px]
                      sm:w-[68px]

                      lg:h-[76px]
                      lg:w-[76px]

                      ${activeIndex === index
                        ? "border-orange-500 ring-2 ring-orange-100"
                        : "border-slate-200 hover:border-slate-300"
                      }
                    `}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="76px"
                      className="object-contain p-1.5 sm:p-2"
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
                  if (window.innerWidth < 1024) return;

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
                className="
                  order-1
                  relative
                  flex
                  h-[290px]
                  w-full
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-100
                  bg-[#fffaf5]

                  sm:h-[380px]
                  sm:rounded-2xl

                  md:h-[430px]

                  lg:order-2
                  lg:h-auto
                  lg:min-h-[500px]
                  lg:flex-1
                "
              >
                {/* Decorative background */}

                <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-100/60 blur-3xl sm:h-60 sm:w-60" />

                <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-emerald-100/50 blur-3xl sm:h-60 sm:w-60" />

                {/* Main image */}

                <motion.div
                  drag="x"
                  dragConstraints={{
                    left: 0,
                    right: 0,
                  }}
                  dragElastic={0.15}
                  onDragEnd={handleSwipe}
                  className="
                    relative
                    z-10
                    flex
                    h-full
                    w-full
                    touch-pan-y
                    items-center
                    justify-center
                    cursor-grab
                    active:cursor-grabbing

                    p-5
                    sm:p-8
                    md:p-10
                    lg:p-12
                    xl:p-14
                  "
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{
                        opacity: 0,
                        scale: 0.95,
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
                        sizes="
                          (max-width: 640px) 100vw,
                          (max-width: 1024px) 65vw,
                          550px
                        "
                        placeholder="blur"
                        blurDataURL={`data:image/svg+xml;base64,${toBase64(
                          shimmer(500, 500)
                        )}`}
                        className="
                          pointer-events-none
                          select-none
                          object-contain
                          drop-shadow-[0_14px_25px_rgba(15,23,42,0.10)]
                          sm:drop-shadow-[0_18px_30px_rgba(15,23,42,0.12)]
                        "
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Discount */}

                {discount > 0 && (
                  <div className="absolute left-3 top-3 z-20 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black text-white shadow-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
                    {discount}% OFF
                  </div>
                )}

                {/* Image counter */}

                {product.images?.length > 1 && (
                  <div className="absolute bottom-3 right-3 z-20 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur sm:bottom-4 sm:right-4 sm:px-3 sm:py-1.5 sm:text-xs">
                    {activeIndex + 1} / {product.images.length}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Swipe hint */}

            {product.images?.length > 1 && (
              <p className="mt-2 text-center text-[10px] font-medium text-slate-400 sm:text-xs lg:hidden">
                Swipe image to browse
              </p>
            )}
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="flex min-w-0 flex-col p-4 sm:p-6 md:p-7 lg:p-10">

            {/* Category */}

            <div className="mb-2.5 flex min-w-0 items-center gap-2 sm:mb-3">
              <span className="max-w-[180px] truncate rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-600 sm:max-w-none sm:px-3 sm:text-xs">
                {product.category || "Product"}
              </span>

              {product.store?.name && (
                <>
                  <span className="shrink-0 text-slate-300">
                    •
                  </span>

                  <span className="min-w-0 truncate text-[11px] font-medium text-slate-400 sm:text-xs">
                    {product.store.name}
                  </span>
                </>
              )}
            </div>

            {/* Product name */}

            <h1 className="
              max-w-2xl
              break-words
              text-[1.7rem]
              font-black
              leading-[1.15]
              tracking-tight
              text-slate-900

              sm:text-3xl
              md:text-4xl
              lg:text-[2.7rem]
            ">
              {product.name}
            </h1>

            {/* Rating */}

            <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:mt-4 sm:gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 sm:px-2.5 sm:py-1.5">
                <span className="text-xs font-black text-slate-900 sm:text-sm">
                  {averageRating
                    ? averageRating.toFixed(1)
                    : "0.0"}
                </span>

                <StarIcon
                  size={13}
                  className="fill-orange-400 text-orange-400 sm:h-[14px] sm:w-[14px]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("product-reviews")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
                className="text-xs font-semibold text-slate-500 transition hover:text-orange-600 sm:text-sm"
              >
                {product.rating?.length || 0}{" "}
                {product.rating?.length === 1
                  ? "review"
                  : "reviews"}
              </button>
            </div>

            {/* Divider */}

            <div className="my-5 h-px bg-slate-100 sm:my-6" />

            {/* Price */}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {currency}
                {product.price}
              </span>

              {product.mrp > product.price && (
                <>
                  <span className="text-base font-medium text-slate-400 line-through sm:text-lg">
                    {currency}
                    {product.mrp}
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600 sm:text-xs">
                    Save {currency}
                    {product.mrp - product.price}
                  </span>
                </>
              )}
            </div>

            {discount > 0 && (
              <p className="mt-1.5 text-xs font-semibold text-emerald-600 sm:text-sm">
                You save {discount}% on this product
              </p>
            )}

            {/* Stock */}

            <div className="mt-5 sm:mt-6">
              {isOutOfStock ? (
                <div className="flex w-fit max-w-full items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 sm:px-4 sm:py-2.5 sm:text-sm">
                  <AlertCircleIcon size={16} />
                  Currently out of stock
                </div>
              ) : maxQty <= 5 ? (
                <div className="flex w-fit max-w-full items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 sm:px-4 sm:py-2.5 sm:text-sm">
                  <AlertCircleIcon size={16} />
                  Only {maxQty} left in stock
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 sm:text-sm">
                  <CheckIcon size={16} strokeWidth={2.5} />
                  In stock
                </div>
              )}
            </div>

            {/* Specifications */}

            {(product.size ||
              product.weight ||
              product.warranty) && (
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-3">

                  {product.size && (
                    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                        Size
                      </p>

                      <p className="mt-1 truncate text-xs font-bold text-slate-800 sm:text-sm">
                        {product.size}
                      </p>
                    </div>
                  )}

                  {product.weight && (
                    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                        Weight
                      </p>

                      <p className="mt-1 truncate text-xs font-bold text-slate-800 sm:text-sm">
                        {product.weight}
                      </p>
                    </div>
                  )}

                  {product.warranty && (
                    <div className="col-span-2 min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                        Warranty
                      </p>

                      <p className="mt-1 break-words text-xs font-bold text-slate-800 sm:text-sm">
                        {product.warranty}
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* =================================================
                CART
            ================================================= */}

            <div className="mt-6 border-t border-slate-100 pt-6 sm:mt-8 sm:pt-7">

              {inCart ? (
                <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3">

                  {/* Quantity */}

                  <div className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-1.5 sm:h-14 sm:w-40 sm:px-2">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => {
                        if (!isSignedIn) {
                          toast.error(
                            "Please login to manage your cart."
                          );
                          return;
                        }

                        handleQuantityChange(quantity - 1);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 sm:h-10 sm:w-10"
                    >
                      <MinusIcon size={17} />
                    </button>

                    <span className="text-sm font-black text-slate-900 sm:text-base">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
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
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition sm:h-10 sm:w-10 ${isAtMaxStock
                          ? "cursor-not-allowed text-slate-300"
                          : "text-slate-500 hover:bg-white hover:text-slate-900"
                        }`}
                    >
                      <PlusIcon size={17} />
                    </button>
                  </div>

                  {/* View Cart */}

                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/cart")}
                    className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:bg-orange-500 sm:h-14 sm:px-7"
                  >
                    <ShoppingCartIcon size={18} />

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
                  className={`
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    px-6
                    text-sm
                    font-black
                    transition-all

                    sm:h-14
                    sm:px-8

                    ${isOutOfStock
                      ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                      : "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                    }
                  `}
                >
                  {!isOutOfStock && (
                    <ShoppingCartIcon size={19} />
                  )}

                  {isOutOfStock
                    ? "Out of Stock"
                    : "Add to Cart"}
                </motion.button>
              )}
            </div>

            {/* =================================================
                BENEFITS
            ================================================= */}

            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-6 sm:mt-7 sm:gap-3 sm:pt-7">

              {/* Local delivery */}

              <div className="min-w-0">
                <div className="flex justify-center sm:justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 sm:h-9 sm:w-9">
                    <TruckIcon
                      size={16}
                      className="text-orange-500 sm:h-[18px] sm:w-[18px]"
                    />
                  </div>
                </div>

                <p className="mt-1.5 truncate text-center text-[10px] font-bold text-slate-800 sm:text-left sm:text-xs">
                  Local delivery
                </p>

                <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
                  From nearby stores
                </p>
              </div>

              {/* Secure checkout */}

              <div className="min-w-0">
                <div className="flex justify-center sm:justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 sm:h-9 sm:w-9">
                    <ShieldCheckIcon
                      size={16}
                      className="text-emerald-500 sm:h-[18px] sm:w-[18px]"
                    />
                  </div>
                </div>

                <p className="mt-1.5 truncate text-center text-[10px] font-bold text-slate-800 sm:text-left sm:text-xs">
                  Secure checkout
                </p>

                <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
                  Safe & protected
                </p>
              </div>

              {/* Nearby shops */}

              <div className="min-w-0">
                <div className="flex justify-center sm:justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 sm:h-9 sm:w-9">
                    <MapPinIcon
                      size={16}
                      className="text-purple-500 sm:h-[18px] sm:w-[18px]"
                    />
                  </div>
                </div>

                <p className="mt-1.5 truncate text-center text-[10px] font-bold text-slate-800 sm:text-left sm:text-xs">
                  Nearby shops
                </p>

                <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
                  Shop local
                </p>
              </div>
            </div>

            {/* =================================================
                STORE
            ================================================= */}

            {product.store?.name && (
              <div className="mt-6 flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:mt-7 sm:gap-3 sm:p-3.5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm sm:h-10 sm:w-10">
                  <StoreIcon
                    size={16}
                    className="text-orange-500 sm:h-[17px] sm:w-[17px]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                    Sold by
                  </p>

                  <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
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
                    className="shrink-0 text-[10px] font-black text-orange-600 transition hover:text-orange-700 sm:text-xs"
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