'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  StarIcon,
  TagIcon,
  EarthIcon,
  CreditCardIcon,
  UserIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {
  const productId = product.id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

  const cart = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const router = useRouter();

  const [mainImage, setMainImage] = useState(product.images[0]);
  const [selectedQty, setSelectedQty] = useState(1);

  const maxQty = product.quantity; // stock quantity

  const addToCartHandler = () => {
    dispatch(
      addToCart({
        productId,
        quantity: selectedQty,
        price: product.price,
        name: product.name,
        image: product.images[0],
      })
    );
  };

  const averageRating =
    product.rating.length > 0
      ? product.rating.reduce((acc, item) => acc + item.rating, 0) /
        product.rating.length
      : 0;

  return (
    <div className="flex max-lg:flex-col gap-12">
      {/* IMAGES */}
      <div className="flex max-sm:flex-col-reverse gap-3">
        <div className="flex sm:flex-col gap-3">
          {product.images.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(image)}
              className="bg-slate-100 flex items-center justify-center size-26 rounded-lg cursor-pointer"
            >
              <Image src={image} alt="" width={45} height={45} />
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg">
          <Image src={mainImage} alt="" width={250} height={250} />
        </div>
      </div>

      {/* DETAILS */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">
          {product.name}
        </h1>

        {/* RATING */}
        <div className="flex items-center mt-2">
          {Array(5)
            .fill("")
            .map((_, index) => (
              <StarIcon
                key={index}
                size={14}
                fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
                className="text-transparent"
              />
            ))}
          <p className="text-sm ml-3 text-slate-500">
            {product.rating.length} Reviews
          </p>
        </div>

        {/* PRICE */}
        <div className="flex items-start my-6 gap-3 text-2xl font-semibold">
          <p>{currency}{product.price}</p>
          <p className="text-xl text-slate-500 line-through">
            {currency}{product.mrp}
          </p>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <TagIcon size={14} />
          <p>
            Save{" "}
            {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}%
          </p>
        </div>

        {/* QUANTITY SELECTOR */}
        {!cart[productId] && product.quantity > 0 && (
          <div className="mt-8">
            <p className="text-lg font-semibold mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                disabled={selectedQty === 1}
                onClick={() => setSelectedQty((q) => q - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                −
              </button>

              <span className="font-medium">{selectedQty}</span>

              <button
                disabled={selectedQty === maxQty}
                onClick={() => setSelectedQty((q) => q + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                +
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {product.quantity} items available
            </p>
          </div>
        )}

        {/* CART ACTION */}
        <div className="flex items-end gap-5 mt-6">
          {cart[productId] && (
            <div className="flex flex-col gap-3">
              <p className="text-lg font-semibold">Quantity</p>
              <Counter productId={productId} />
            </div>
          )}

          <button
            disabled={product.quantity === 0}
            onClick={() =>
              !cart[productId]
                ? addToCartHandler()
                : router.push("/cart")
            }
            className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 disabled:opacity-50"
          >
            {product.quantity === 0
              ? "Out of Stock"
              : cart[productId]
              ? "View Cart"
              : "Add to Cart"}
          </button>
        </div>

        <hr className="border-gray-300 my-5" />

        {/* INFO */}
        <div className="flex flex-col gap-4 text-slate-500">
          <p className="flex gap-3">
            <EarthIcon /> Free shipping worldwide
          </p>
          <p className="flex gap-3">
            <CreditCardIcon /> 100% Secured Payment
          </p>
          <p className="flex gap-3">
            <UserIcon /> Trusted by top brands
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
