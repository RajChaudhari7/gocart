"use client";

import {
  StarIcon,
  ChevronLeft,
  ChevronRight,
  Ban,
  AlertCircle,
  Heart,
  Scale,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCompare,
  removeFromCompare,
} from "@/lib/features/compare/compareSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/features/wishlist/wishlistSlice";
import axios from "axios";

const LOW_STOCK_LIMIT = 10;

const swipeConfidenceThreshold = 10000;

const swipePower = (offset, velocity) =>
  Math.abs(offset) * velocity;

const sliderVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),

  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },

  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

const ProductCard = ({
  product,
  storeIsActive,
  trending = false,
  trendingRank = null,
}) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

  const isShopClosed = storeIsActive === false;

  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [];

  const [[page, direction], setPage] = useState([0, 0]);

  const cardRef = useRef(null);

  const dispatch = useDispatch();

  // ================= REDUX =================

  const compareItems = useSelector(
    (state) => state.compare.products || [],
  );

  const wishlistItems = useSelector(
    (state) => state.wishlist.products || [],
  );

  const isCompared = compareItems.some(
    (item) => item.id === product.id,
  );

  const isWishlisted = wishlistItems.some(
    (item) => item.id === product.id,
  );

  // ================= PRODUCT DATA =================

  const imageIndex =
    images.length > 0
      ? ((page % images.length) + images.length) % images.length
      : 0;

  const currentImage =
    images[imageIndex] || "/placeholder.png";

  const hasMultiple = images.length > 1;

  const stockValue = Number(product.quantity || 0);

  const isOutOfStock = stockValue <= 0;

  const isLowStock =
    stockValue > 0 && stockValue < LOW_STOCK_LIMIT;

  const rating =
    product.rating?.length > 0
      ? (
        product.rating.reduce(
          (acc, curr) => acc + curr.rating,
          0,
        ) / product.rating.length
      ).toFixed(1)
      : null;

  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(
        ((product.mrp - product.price) / product.mrp) * 100,
      )
      : 0;

  // Store name fallback
  const storeName =
    product.store?.name ||
    product.store?.storeName ||
    product.store?.businessName ||
    "Local Store";

  // ================= IMAGE SLIDER =================

  const paginate = (newDirection, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!hasMultiple || isOutOfStock || isShopClosed) {
      return;
    }

    setPage([page + newDirection, newDirection]);
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    if (
      isOutOfStock ||
      isShopClosed ||
      !hasMultiple
    ) {
      return;
    }

    const swipe = swipePower(
      offset.x,
      velocity.x,
    );

    const distanceThreshold = 50;

    if (
      offset.x < -distanceThreshold ||
      swipe < -swipeConfidenceThreshold
    ) {
      paginate(1);
    } else if (
      offset.x > distanceThreshold ||
      swipe > swipeConfidenceThreshold
    ) {
      paginate(-1);
    }
  };

  // ================= COMPARE =================

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCompared) {
      dispatch(removeFromCompare(product.id));
    } else {
      dispatch(addToCompare(product));
    }
  };

  // ================= WISHLIST =================

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isWishlisted) {
        await axios.delete(
          `/api/wishlist/${product.id}`,
        );

        dispatch(removeFromWishlist(product.id));
      } else {
        await axios.post("/api/wishlist", {
          productId: product.id,
        });

        dispatch(addToWishlist(product));
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DESKTOP TILT =================

  const handleMouseMove = (e) => {
    if (
      !cardRef.current ||
      isOutOfStock ||
      isShopClosed ||
      window.innerWidth < 1024
    ) {
      return;
    }

    const rect =
      cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY =
      (x / rect.width - 0.5) * 2.5;

    const rotateX =
      -(y / rect.height - 0.5) * 2.5;

    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(4px)
    `;
  };

  const resetTilt = () => {
    if (!cardRef.current) return;

    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0px)
    `;
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-40px",
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className="group relative w-full h-full"
    >
      <Link
        href={`/product/${product.id}`}
        className="block h-full outline-none"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className={`
            relative
            flex
            h-full
            flex-col
            overflow-hidden
            rounded-2xl
            border
            bg-white
            shadow-sm
            transition-all
            duration-200
            ease-out
            will-change-transform

            ${trending
              ? "border-orange-100 hover:border-orange-200 hover:shadow-orange-100"
              : "border-slate-200 hover:border-slate-300 hover:shadow-md"
            }

            ${isOutOfStock
              ? "opacity-75 grayscale-[0.3]"
              : ""
            }
          `}
        >
          {/* ================= STATUS OVERLAYS ================= */}

          {isShopClosed && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-[3px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500 ring-1 ring-orange-100">
                <Ban size={19} />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">
                Store Closed
              </span>
            </div>
          )}

          {isOutOfStock && !isShopClosed && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-[2px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100">
                <Ban size={19} />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600">
                Out of Stock
              </span>
            </div>
          )}

          {/* ================= TOP BADGES ================= */}

          <div className="absolute left-2.5 top-2.5 z-30 flex max-w-[75%] flex-col items-start gap-1.5">
            {trending && (
              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-full
                  bg-orange-500
                  px-2
                  py-1
                  text-[8px]
                  font-extrabold
                  uppercase
                  tracking-wide
                  text-white
                  shadow-sm
                "
              >
                🔥 Trending

                {trendingRank &&
                  trendingRank <= 3 && (
                    <span className="rounded-full bg-white/20 px-1">
                      #{trendingRank}
                    </span>
                  )}
              </motion.span>
            )}

            {product.featured && (
              <span
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-amber-400
                  px-2
                  py-1
                  text-[8px]
                  font-extrabold
                  uppercase
                  tracking-wide
                  text-amber-950
                  shadow-sm
                "
              >
                ⭐ Featured
              </span>
            )}
          </div>

          {/* ================= ACTION BUTTONS ================= */}

          <div className="absolute right-2.5 top-2.5 z-30 flex flex-col gap-1.5">
            {/* Compare */}
            <button
              onClick={toggleCompare}
              aria-label="Compare product"
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                shadow-sm
                backdrop-blur
                transition

                ${isCompared
                  ? "border-cyan-200 bg-cyan-500 text-white"
                  : "border-slate-200 bg-white/90 text-slate-500 hover:bg-slate-50 hover:text-cyan-600"
                }
              `}
            >
              <Scale size={15} />
            </button>

            {/* Wishlist */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              animate={
                isWishlisted
                  ? {
                    scale: [1, 1.15, 1],
                  }
                  : {}
              }
              transition={{
                duration: 0.3,
              }}
              onClick={toggleWishlist}
              aria-label="Add to wishlist"
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                shadow-sm
                backdrop-blur
                transition

                ${isWishlisted
                  ? "border-red-200 bg-red-500 text-white"
                  : "border-slate-200 bg-white/90 text-slate-500 hover:bg-red-50 hover:text-red-500"
                }
              `}
            >
              <Heart
                size={15}
                className={
                  isWishlisted
                    ? "fill-white"
                    : ""
                }
              />
            </motion.button>
          </div>

          {/* ================= IMAGE ================= */}

          <div
            className="
              relative
              aspect-square
              w-full
              overflow-hidden
              bg-slate-50
              sm:aspect-[1/0.95]
            "
          >
            <AnimatePresence
              initial={false}
              custom={direction}
            >
              <motion.div
                key={page}
                custom={direction}
                variants={sliderVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  },
                  opacity: {
                    duration: 0.15,
                  },
                }}
                drag={
                  hasMultiple &&
                    !isOutOfStock &&
                    !isShopClosed
                    ? "x"
                    : false
                }
                dragConstraints={{
                  left: 0,
                  right: 0,
                }}
                dragElastic={0.8}
                dragMomentum={false}
                onDragStart={(e) =>
                  e.stopPropagation()
                }
                onDragEnd={(e, info) => {
                  e.stopPropagation();
                  handleDragEnd(e, info);
                }}
                onClick={(e) => {
                  if (hasMultiple) {
                    e.stopPropagation();
                  }
                }}
                style={{
                  touchAction: "pan-y",
                }}
                className="
                  absolute
                  inset-0
                  flex
                  cursor-grab
                  select-none
                  items-center
                  justify-center
                  active:cursor-grabbing
                "
              >
                <Image
                  src={currentImage}
                  alt={
                    product.name ||
                    "Product image"
                  }
                  fill
                  sizes="
                    (max-width: 640px) 45vw,
                    (max-width: 1024px) 30vw,
                    220px
                  "
                  className="
                    pointer-events-none
                    select-none
                    object-contain
                    p-4
                    transition-transform
                    duration-300
                    group-hover:scale-[1.03]
                  "
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Desktop arrows */}
            {hasMultiple &&
              !isOutOfStock &&
              !isShopClosed && (
                <>
                  <button
                    onClick={(e) =>
                      paginate(-1, e)
                    }
                    aria-label="Previous image"
                    className="
                      absolute
                      left-2
                      top-1/2
                      z-20
                      hidden
                      h-7
                      w-7
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-slate-200
                      bg-white/95
                      text-slate-600
                      shadow-sm
                      transition
                      hover:bg-white
                      hover:text-slate-900
                      md:flex
                      md:opacity-0
                      md:group-hover:opacity-100
                    "
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <button
                    onClick={(e) =>
                      paginate(1, e)
                    }
                    aria-label="Next image"
                    className="
                      absolute
                      right-2
                      top-1/2
                      z-20
                      hidden
                      h-7
                      w-7
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-slate-200
                      bg-white/95
                      text-slate-600
                      shadow-sm
                      transition
                      hover:bg-white
                      hover:text-slate-900
                      md:flex
                      md:opacity-0
                      md:group-hover:opacity-100
                    "
                  >
                    <ChevronRight size={15} />
                  </button>
                </>
              )}

            {/* Image dots */}
            {hasMultiple && (
              <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`
                      h-1 rounded-full transition-all duration-200
                      ${i === imageIndex
                        ? "w-4 bg-slate-800"
                        : "w-1 bg-slate-300"
                      }
                    `}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ================= CONTENT ================= */}

          <div className="flex flex-1 flex-col p-3 sm:p-3.5">
            {/* Store + Rating */}
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span
                className="
                  min-w-0
                  truncate
                  text-[10px]
                  font-semibold
                  text-emerald-600
                  sm:text-[11px]
                "
                title={storeName}
              >
                From: {storeName}
              </span>

              {rating && (
                <div className="flex shrink-0 items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5">
                  <StarIcon
                    size={10}
                    className="fill-emerald-500 text-emerald-500"
                  />

                  <span className="text-[10px] font-bold text-emerald-700">
                    {rating}
                  </span>
                </div>
              )}
            </div>

            {/* Category */}
            <span className="mb-1 text-[9px] font-medium uppercase tracking-wide text-slate-400">
              {product.category || "Product"}
            </span>

            {/* Product Name */}
            <h3
              className="
                mb-2
                line-clamp-2
                min-h-[32px]
                text-xs
                font-semibold
                leading-4
                text-slate-800
                transition-colors
                group-hover:text-emerald-600
                sm:text-sm
              "
            >
              {product.name}
            </h3>

            {/* Trending stats */}
            {trending && (
              <div className="mb-2 flex items-center gap-2 text-[9px]">
                <span className="rounded bg-orange-50 px-1.5 py-1 font-medium text-orange-600">
                  👁{" "}
                  {Number(
                    product.totalViews || 0,
                  ).toLocaleString()}
                </span>

                <span className="rounded bg-emerald-50 px-1.5 py-1 font-medium text-emerald-600">
                  ✓{" "}
                  {Number(
                    product.totalSales || 0,
                  ).toLocaleString()}{" "}
                  sold
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mt-auto flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`
                      text-base
                      font-extrabold
                      tracking-tight
                      sm:text-lg
                      ${isOutOfStock
                        ? "text-slate-400"
                        : "text-slate-900"
                      }
                    `}
                  >
                    {currency}
                    {Number(
                      product.price,
                    ).toLocaleString()}
                  </span>

                  {product.mrp &&
                    product.mrp >
                    product.price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {currency}
                        {Number(
                          product.mrp,
                        ).toLocaleString()}
                      </span>
                    )}
                </div>

                {discount > 0 && (
                  <span className="mt-0.5 inline-block text-[9px] font-bold text-emerald-600">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Low stock */}
              {isLowStock &&
                !isOutOfStock && (
                  <div className="flex shrink-0 items-center gap-0.5 text-amber-600">
                    <AlertCircle size={11} />

                    <span className="text-[8px] font-bold uppercase">
                      Only {stockValue}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;