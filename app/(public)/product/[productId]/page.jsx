"use client";

import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import SimilarProducts from "@/components/SimilarProducts";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {
  const { productId } = useParams();

  const products = useSelector((state) => state.product.list);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (products.length) {
      const found = products.find((p) => p.id === productId);


      setProduct(found);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }


  }, [productId, products]);

  if (!product) return null;

  return (<main className="min-h-screen bg-[#fffaf5] text-slate-900"> <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">


    {/* Breadcrumb */}

    <div className="mb-6 flex flex-wrap items-center gap-1.5 text-sm">
      <span className="font-medium text-slate-400">
        Home
      </span>

      <span className="text-slate-300">/</span>

      <span className="font-medium text-slate-400">
        Products
      </span>

      <span className="text-slate-300">/</span>

      <span className="font-semibold text-slate-700">
        {product.category}
      </span>
    </div>

    {/* PRODUCT DETAILS */}

    <ProductDetails product={product} />

    {/* DESCRIPTION */}

    <ProductDescription product={product} />

    {/* CUSTOMERS ALSO BOUGHT */}

    <SimilarProducts productId={product.id} />

  </div>
  </main>

  );
}
