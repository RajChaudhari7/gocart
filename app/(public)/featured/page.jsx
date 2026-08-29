"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Sparkles, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function FeaturedProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { customerLocation } = useCustomerLocation();

  useEffect(() => {
    fetchProducts();
  }, [customerLocation?.latitude, customerLocation?.longitude]);

  async function fetchProducts() {
    try {
      setLoading(true);

      const latitude = customerLocation?.latitude;
      const longitude = customerLocation?.longitude;

      const params = {};

      if (latitude != null && longitude != null) {
        params.lat = latitude;
        params.lng = longitude;
      }

      const { data } = await axios.get("/api/featured-products", {
        params,
      });

      setProducts(Array.isArray(data) ? data : data?.products || []);
    } catch (error) {
      console.error("FEATURED PRODUCTS ERROR:", error);

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <section className="min-h-screen bg-[#020617] text-white pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="
                        rounded-3xl
                        border
                        border-yellow-500/20
                        bg-gradient-to-r
                        from-yellow-500/10
                        via-amber-500/10
                        to-orange-500/10
                        backdrop-blur-xl
                        p-8
                        mb-10
                    "
        >
          <div className="flex items-center gap-5">
            <div
              className="
                                w-16
                                h-16
                                rounded-full
                                bg-yellow-500/10
                                border
                                border-yellow-500/20
                                flex
                                items-center
                                justify-center
                            "
            >
              <Sparkles className="text-yellow-400" size={30} />
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black">
                Featured Collection
              </h1>

              <p className="text-slate-300 mt-3 max-w-2xl">
                Discover our hand-picked premium collection. These are the best
                products chosen for quality, popularity and customer
                satisfaction.
              </p>
            </div>
          </div>

          {/* LOCATION */}

          {customerLocation?.formattedAddress && (
            <div
              className="
                                mt-6
                                flex
                                items-center
                                gap-2
                                text-sm
                                text-slate-300
                            "
            >
              <MapPin size={16} className="text-cyan-400" />

              <span>
                Showing featured products available near{" "}
                <span className="font-semibold text-white">
                  {customerLocation.formattedAddress}
                </span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Stats */}

        <div className="flex items-center justify-between mb-8">
          <p className="text-slate-400">{products.length} Featured Products</p>

          <div
            className="
                            px-4
                            py-2
                            rounded-full
                            bg-yellow-500/10
                            border
                            border-yellow-500/20
                            text-yellow-300
                            text-sm
                        "
          >
            Premium Picks
          </div>
        </div>

        {/* Products */}

        {products.length === 0 ? (
          <div className="text-center py-32">
            <Sparkles size={70} className="mx-auto text-yellow-500/40" />

            <h2 className="mt-6 text-3xl font-bold">No Featured Products</h2>

            <p className="text-slate-400 mt-3">
              There are currently no featured products available in your
              selected location.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="
                            grid
                            grid-cols-2
                            md:grid-cols-3
                            xl:grid-cols-5
                            gap-6
                        "
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeIsActive={product.store?.isActive === true}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
