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
    <section className="relative bg-gradient-to-b from-black to-[#020617]">
      <div className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 max-w-7xl mx-auto">
        <Title
          title="Latest Products"
          description={`Showing ${
            nearbyProducts.length < displayQuantity
              ? nearbyProducts.length
              : displayQuantity
          } of ${nearbyProducts.length} products available for delivery`}
          href="/product"
          theme="dark"
        />

        <div className="mt-8 sm:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {latestProducts.map((product) => (
            <div key={product.id} className="rounded-2xl overflow-hidden">
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
