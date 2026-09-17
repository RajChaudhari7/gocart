"use client";

import ProductCard from "@/components/ProductCard";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MailIcon, MapPinIcon, StoreIcon } from "lucide-react";
import Loading from "@/components/Loading";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import FollowStoreButton from "@/components/store/FollowStoreButton";

export default function StoreShop() {
  const { username } = useParams();

  const [products, setProducts] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH STORE DATA ================= */

  const fetchStoreData = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/store/data?username=${username}`
      );

      setStoreInfo(data.store);
      setProducts(data.store?.Product || []);
    } catch (error) {
      console.error("STORE DATA ERROR:", error);

      toast.error(
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load store"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD STORE ================= */

  useEffect(() => {
    if (username) {
      fetchStoreData();
    }
  }, [username]);

  /* ================= SUB CATEGORIES ================= */

  const subCategories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map((product) => product.subCategory)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  /* ================= FILTER PRODUCTS ================= */

  const filteredProducts = useMemo(() => {
    if (selectedSubCategory === "All") {
      return products;
    }

    return products.filter(
      (product) =>
        product.subCategory === selectedSubCategory
    );
  }, [products, selectedSubCategory]);

  /* ================= LOADING ================= */

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] text-slate-900">
      <section className="px-4 pb-14 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              STORE HEADER
          ================================================= */}

          {storeInfo && (
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.06)] sm:rounded-[2rem]">

              <div className="flex flex-col gap-7 p-5 sm:p-7 md:flex-row md:items-center md:gap-9 lg:p-9">

                {/* ================= STORE LOGO ================= */}

                <div className="relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm sm:h-40 sm:w-40 md:mx-0 lg:h-44 lg:w-44">

                  {storeInfo.logo ? (
                    <Image
                      src={storeInfo.logo}
                      alt={storeInfo.name || "Store"}
                      fill
                      sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 176px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-orange-50">
                      <StoreIcon
                        size={42}
                        className="text-orange-400"
                      />
                    </div>
                  )}
                </div>

                {/* ================= STORE INFO ================= */}

                <div className="min-w-0 flex-1 text-center md:text-left">

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    <div className="min-w-0">

                      {/* Store name */}

                      <h1 className="break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                        {storeInfo.name}
                      </h1>

                      {/* Status */}

                      <div className="mt-3 flex items-center justify-center gap-2 md:justify-start">

                        <span
                          className={`h-2.5 w-2.5 rounded-full ${storeInfo.isActive
                              ? "bg-emerald-500"
                              : "bg-red-400"
                            }`}
                        />

                        <span
                          className={`text-xs font-bold sm:text-sm ${storeInfo.isActive
                              ? "text-emerald-600"
                              : "text-red-500"
                            }`}
                        >
                          {storeInfo.isActive
                            ? "Store is open"
                            : "Store is closed"}
                        </span>
                      </div>
                    </div>

                    {/* Follow */}

                    <div className="flex shrink-0 justify-center md:justify-end">
                      <FollowStoreButton
                        store={storeInfo}
                        variant="profile"
                      />
                    </div>
                  </div>

                  {/* Description */}

                  {storeInfo.description && (
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base md:mx-0">
                      {storeInfo.description}
                    </p>
                  )}

                  {/* Store details */}

                  <div className="mt-5 flex flex-col gap-3 text-sm text-slate-500">

                    {storeInfo.address && (
                      <div className="flex items-start justify-center gap-2 md:justify-start">
                        <MapPinIcon
                          size={17}
                          className="mt-0.5 shrink-0 text-orange-500"
                        />

                        <span className="break-words">
                          {storeInfo.address}
                        </span>
                      </div>
                    )}

                    {storeInfo.email && (
                      <div className="flex items-center justify-center gap-2 md:justify-start">
                        <MailIcon
                          size={17}
                          className="shrink-0 text-orange-500"
                        />

                        <span className="break-all sm:break-normal">
                          {storeInfo.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom store strip */}

              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-7">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 md:justify-start">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50">
                    <StoreIcon
                      size={13}
                      className="text-orange-500"
                    />
                  </span>

                  <span>
                    Shopping from your local store
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <div className="mt-10 sm:mt-14">

            {/* Header */}

            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                  Store Collection
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Shop Products
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Browse products available from this store
                </p>
              </div>

              {products.length > 0 && (
                <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                  {products.length}{" "}
                  {products.length === 1
                    ? "product"
                    : "products"}
                </span>
              )}
            </div>

            {/* =================================================
                CATEGORY FILTER
            ================================================= */}

            {subCategories.length > 1 && (
              <div className="mb-7">

                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">

                  {subCategories.map((sub) => {
                    const isSelected =
                      selectedSubCategory === sub;

                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() =>
                          setSelectedSubCategory(sub)
                        }
                        className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-bold transition-all ${isSelected
                            ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-200"
                            : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center sm:py-20">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                  <StoreIcon
                    size={24}
                    className="text-orange-400"
                  />
                </div>

                <h3 className="mt-4 text-base font-black text-slate-900">
                  No products available
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  This store currently has no products in
                  this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">

                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeIsActive={
                      storeInfo?.isActive === true
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}