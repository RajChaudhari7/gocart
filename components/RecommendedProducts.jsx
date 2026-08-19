"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function RecommendedProducts() {
  const [allRecommendedProducts, setAllRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { filterNearbyProducts, locationLoading, serviceable } =
    useCustomerLocation();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const { data } = await axios.get("/api/recommendations");

      setAllRecommendedProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("RECOMMENDATIONS ERROR:", error);

      setAllRecommendedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const products = useMemo(() => {
    return filterNearbyProducts(allRecommendedProducts);
  }, [allRecommendedProducts, filterNearbyProducts]);

  if (loading || locationLoading) {
    return (
      <section className="mt-10 md:mt-16">
        <div className="rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 md:p-8">
          {/* Heading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <Sparkles className="text-cyan-400" size={20} />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  sm:text-xl
                  md:text-3xl
                  font-black
                  bg-gradient-to-r
                  from-cyan-300
                  via-white
                  to-indigo-300
                  bg-clip-text
                  text-transparent
                "
              >
                Recommended For You
              </h2>

              <p className="text-xs md:text-sm text-slate-400">
                Finding personalized products available for your delivery
                location
              </p>
            </div>
          </div>

          {/* Skeleton */}
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
              gap-3
              md:gap-6
            "
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-64 md:h-80 rounded-2xl bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!serviceable || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 md:mt-16">
      <div className="rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 md:p-8">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Sparkles className="text-cyan-400" size={20} />
          </div>

          <div>
            <h2
              className="
                text-lg
                sm:text-xl
                md:text-3xl
                font-black
                bg-gradient-to-r
                from-cyan-300
                via-white
                to-indigo-300
                bg-clip-text
                text-transparent
              "
            >
              Recommended For You
            </h2>

            <p className="text-xs md:text-sm text-slate-400">
              Personalized picks available for your selected delivery location
            </p>
          </div>
        </div>

        {/* Products */}
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-3
            md:gap-6
          "
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeIsActive={product.store?.isActive === true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
