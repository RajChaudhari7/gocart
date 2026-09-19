"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* =========================================================
   CATEGORY CONFIGURATION
   These values MUST match StoreAddProduct exactly.
========================================================= */

const CATEGORY_GROUPS = [
  {
    title: "Food & Daily Essentials",
    description: "Everyday groceries, snacks and drinks",
    categories: [
      {
        name: "Food & Drink",
        image:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Snacks",
          "Beverages",
          "Groceries",
          "Fresh Produce",
          "Packaged Food",
        ],
      },
    ],
  },

  {
    title: "Fashion & Personal Style",
    description: "Clothing, footwear and everyday fashion",
    categories: [
      {
        name: "Clothing",
        image:
          "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Men's Wear",
          "Women's Wear",
          "Kid's Wear",
          "Shoes",
          "Accessories",
        ],
      },
    ],
  },

  {
    title: "Home & Kitchen",
    description: "Things that make your home better",
    categories: [
      {
        name: "Home & Kitchen",
        image:
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Furniture",
          "Decor",
          "Kitchenware",
          "Bedding",
          "Lighting",
        ],
      },
    ],
  },

  {
    title: "Beauty & Wellness",
    description: "Personal care and wellness essentials",
    categories: [
      {
        name: "Beauty & Health",
        image:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Skincare",
          "Makeup",
          "Haircare",
          "Fragrances",
          "Supplements",
        ],
      },
    ],
  },

  {
    title: "Electronics",
    description: "Devices, gadgets and accessories",
    categories: [
      {
        name: "Electronics",
        image:
          "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Mobiles",
          "Laptops",
          "Audio",
          "Wearables",
          "Accessories",
          "Appliances",
        ],
      },
    ],
  },

  {
    title: "Entertainment & Hobbies",
    description: "Games, books and things you love",
    categories: [
      {
        name: "Toys & Games",
        image:
          "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Action Figures",
          "Board Games",
          "Puzzles",
          "Video Games",
          "Soft Toys",
        ],
      },
      {
        name: "Books & Media",
        image:
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Fiction",
          "Non-Fiction",
          "Educational",
          "Comics",
          "Music & Movies",
        ],
      },
      {
        name: "Hobbies & Crafts",
        image:
          "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Art Supplies",
          "DIY Kits",
          "Collectibles",
          "Musical Instruments",
        ],
      },
    ],
  },

  {
    title: "Sports & Outdoors",
    description: "Fitness, sports and outdoor essentials",
    categories: [
      {
        name: "Sports & Outdoors",
        image:
          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
        subCategories: [
          "Fitness Equipment",
          "Outdoor Gear",
          "Team Sports",
          "Sportswear",
        ],
      },
    ],
  },

  {
    title: "Other",
    description: "More products from local shops",
    categories: [
      {
        name: "Others",
        image:
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800",
        subCategories: [],
      },
    ],
  },
];

/* =========================================================
   CATEGORY CARD
========================================================= */

function CategoryCard({
  category,
  availableSubCategories,
  subCategoryCounts,
  count,
  onCategoryClick,
  onSubCategoryClick,
}) {
  return (
    <div
      className="
        group
        overflow-hidden
        rounded-[1.35rem]
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-orange-200
        hover:shadow-md
      "
    >
      {/* -----------------------------------------------------
          IMAGE
      ----------------------------------------------------- */}

      <button
        type="button"
        onClick={onCategoryClick}
        className="block w-full text-left"
        aria-label={`View ${category.name}`}
      >
        <div className="relative h-32 overflow-hidden bg-orange-50 sm:h-36">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="
              object-cover
              transition-transform
              duration-500
              ease-out
              group-hover:scale-105
            "
            sizes="
              (max-width: 640px) 50vw,
              (max-width: 1024px) 33vw,
              20vw
            "
          />

          {/* IMAGE OVERLAY */}

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          {/* COUNT */}

          <span
            className="
              absolute
              right-2.5
              top-2.5
              rounded-full
              border
              border-white/80
              bg-white/90
              px-2
              py-1
              text-[9px]
              font-bold
              text-slate-600
              shadow-sm
              backdrop-blur-sm
            "
          >
            {count} {count === 1 ? "item" : "items"}
          </span>
        </div>

        {/* CATEGORY TITLE */}

        <div className="px-3.5 pb-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <h4
              className="
                text-sm
                font-extrabold
                leading-tight
                text-slate-800
                transition-colors
                group-hover:text-orange-500
                sm:text-base
              "
            >
              {category.name}
            </h4>

            <ArrowRight
              size={15}
              className="
                shrink-0
                text-slate-300
                transition-all
                duration-300
                group-hover:translate-x-0.5
                group-hover:text-orange-500
              "
            />
          </div>
        </div>
      </button>

      {/* -----------------------------------------------------
          SUB CATEGORIES
      ----------------------------------------------------- */}

      {availableSubCategories.length > 0 && (
        <div className="border-t border-slate-100 px-3.5 py-3">
          <div className="space-y-1">
            {availableSubCategories.slice(0, 5).map((subCategory) => {
              const subCount =
                subCategoryCounts[subCategory] || 0;

              return (
                <button
                  key={subCategory}
                  type="button"
                  onClick={() => onSubCategoryClick(subCategory)}
                  className="
                    group/sub
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-2
                    rounded-lg
                    px-2
                    py-1.5
                    text-left
                    transition-colors
                    hover:bg-orange-50
                  "
                >
                  <span
                    className="
                      min-w-0
                      truncate
                      text-[11px]
                      font-medium
                      text-slate-500
                      transition-colors
                      group-hover/sub:text-orange-600
                      sm:text-xs
                    "
                  >
                    {subCategory}
                  </span>

                  <span
                    className="
                      shrink-0
                      text-[9px]
                      font-bold
                      text-slate-300
                      transition-colors
                      group-hover/sub:text-orange-400
                    "
                  >
                    {subCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* VIEW ALL */}

          {availableSubCategories.length > 5 && (
            <button
              type="button"
              onClick={onCategoryClick}
              className="
                mt-2
                flex
                items-center
                gap-1
                px-2
                text-[10px]
                font-extrabold
                text-orange-500
                transition-colors
                hover:text-orange-600
              "
            >
              View all
              <ArrowRight size={11} />
            </button>
          )}
        </div>
      )}

      {/* NO SUBCATEGORY */}

      {availableSubCategories.length === 0 && (
        <div className="border-t border-slate-100 px-3.5 py-3">
          <button
            type="button"
            onClick={onCategoryClick}
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-extrabold
              text-orange-500
              transition-colors
              hover:text-orange-600
            "
          >
            Explore products
            <ArrowRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Categories() {
  const router = useRouter();

  const allProducts = useSelector(
    (state) => state.product.list || []
  );

  const {
    filterNearbyProducts,
    locationLoading,
    serviceable,
  } = useCustomerLocation();

  /* ---------------------------------------------------------
     NEARBY PRODUCTS
  --------------------------------------------------------- */

  const nearbyProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) {
      return [];
    }

    return filterNearbyProducts(allProducts);
  }, [allProducts, filterNearbyProducts]);

  /* ---------------------------------------------------------
     BUILD PRODUCT LOOKUP
  --------------------------------------------------------- */

  const availableCategories = useMemo(() => {
    const map = {};

    nearbyProducts.forEach((product) => {
      const category = product?.category?.trim();

      if (!category) return;

      if (!map[category]) {
        map[category] = {
          count: 0,
          subCategories: {},
        };
      }

      map[category].count += 1;

      const subCategory = product?.subCategory?.trim();

      if (subCategory) {
        map[category].subCategories[subCategory] =
          (map[category].subCategories[subCategory] || 0) + 1;
      }
    });

    return map;
  }, [nearbyProducts]);

  /* ---------------------------------------------------------
     PREPARE VISIBLE GROUPS
  --------------------------------------------------------- */

  const visibleGroups = useMemo(() => {
    return CATEGORY_GROUPS.map((group) => {
      const visibleCategories = group.categories
        .map((category) => {
          const categoryData =
            availableCategories[category.name];

          /*
           * Category doesn't have nearby products.
           */
          if (!categoryData || categoryData.count === 0) {
            return null;
          }

          /*
           * Only display configured subcategories that
           * actually exist in nearby products.
           */
          const availableSubCategories =
            category.subCategories.filter(
              (subCategory) =>
                categoryData.subCategories[subCategory] > 0
            );

          return {
            ...category,
            count: categoryData.count,
            availableSubCategories,
            subCategoryCounts:
              categoryData.subCategories,
          };
        })
        .filter(Boolean);

      if (visibleCategories.length === 0) {
        return null;
      }

      return {
        ...group,
        categories: visibleCategories,
      };
    }).filter(Boolean);
  }, [availableCategories]);

  /* ---------------------------------------------------------
     ROUTING
  --------------------------------------------------------- */

  const openCategory = (category) => {
    router.push(
      `/product?category=${encodeURIComponent(category)}`
    );
  };

  const openSubCategory = (category, subCategory) => {
    router.push(
      `/product?category=${encodeURIComponent(
        category
      )}&subCategory=${encodeURIComponent(subCategory)}`
    );
  };

  /* ---------------------------------------------------------
     LOCATION / EMPTY STATES
  --------------------------------------------------------- */

  if (locationLoading || !serviceable) {
    return null;
  }

  if (visibleGroups.length === 0) {
    return null;
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <section className="bg-[#fffaf5] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-9 flex items-end justify-between gap-4 sm:mb-11">
          <div>
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-500 sm:text-xs">
              Explore nearby
            </p>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Categories
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Explore products from local stores delivering to
              your location.
            </p>
          </div>

          {/* DESKTOP VIEW ALL */}

          <button
            type="button"
            onClick={() => router.push("/product")}
            className="
              hidden
              shrink-0
              items-center
              gap-1.5
              rounded-full
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-slate-600
              shadow-sm
              transition-all
              hover:border-orange-200
              hover:bg-orange-50
              hover:text-orange-600
              md:flex
            "
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        {/* =====================================================
            GROUPS
        ===================================================== */}

        <div className="space-y-12 sm:space-y-16">
          {visibleGroups.map((group) => (
            <div key={group.title}>

              {/* GROUP HEADING */}

              <div className="mb-5">
                <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  {group.title}
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">
                  {group.description}
                </p>
              </div>

              {/* CATEGORY CARDS */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                  sm:gap-4
                  lg:grid-cols-4
                  xl:grid-cols-5
                "
              >
                {group.categories.map((category) => (
                  <CategoryCard
                    key={category.name}
                    category={category}
                    count={category.count}
                    availableSubCategories={
                      category.availableSubCategories
                    }
                    subCategoryCounts={
                      category.subCategoryCounts
                    }
                    onCategoryClick={() =>
                      openCategory(category.name)
                    }
                    onSubCategoryClick={(subCategory) =>
                      openSubCategory(
                        category.name,
                        subCategory
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* =====================================================
            MOBILE VIEW ALL
        ===================================================== */}

        <button
          type="button"
          onClick={() => router.push("/product")}
          className="
            mt-10
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-slate-200
            bg-white
            py-3
            text-sm
            font-bold
            text-slate-600
            shadow-sm
            transition-all
            hover:border-orange-200
            hover:bg-orange-50
            hover:text-orange-600
            md:hidden
          "
        >
          View all categories
          <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}