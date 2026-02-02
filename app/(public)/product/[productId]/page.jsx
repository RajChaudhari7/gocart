'use client'

import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {
  const { productId } = useParams();
  const router = useRouter();
  const products = useSelector(state => state.product.list);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (products.length) {
      const found = products.find(p => p.id === productId);
      setProduct(found);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [productId, products]);

  if (!product) return null;

  return (
    <div className="bg-gradient-to-b from-[#0b0f1a] to-[#05060a] min-h-screen text-white px-6">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="text-gray-400 text-sm pt-8 mb-6">
          Home / Products / {product.category}
        </div>

        {/* PRODUCT DETAILS */}
        <ProductDetails product={product} />

        {/* DESCRIPTION */}
        <ProductDescription product={product} />
      </div>
    </div>
  );
}
