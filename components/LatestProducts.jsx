"use client";

import React, { useMemo } from "react";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

const LatestProducts = () => {
  const displayQuantity = 4;

  const allProducts = useSelector((state) => state.product.list || []);

  const { filterNearbyProducts, locationLoading, serviceable } =
    useCustomerLocation();

  const nearbyProducts = useMemo(() => {
    return filterNearbyProducts(allProducts);
  }, [allProducts, filterNearbyProducts]);

  const latestProducts = useMemo(() => {
    return nearbyProducts
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, displayQuantity);
  }, [nearbyProducts]);

  if (locationLoading || !serviceable) {
    return null;
  }

  if (latestProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 md:py-20">
        <Title
          title="Latest Products"
          description={`Showing ${nearbyProducts.length < displayQuantity
              ? nearbyProducts.length
              : displayQuantity
            } of ${nearbyProducts.length} products available for delivery`}
          href="/product"
          theme="light"
        />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 lg:grid-cols-4 md:gap-6">
          {latestProducts.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <ProductCard
                product={product}
                storeIsActive={product.store?.isActive === true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestProducts;