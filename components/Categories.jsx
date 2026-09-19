"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* =========================================================
   CATEGORY CONFIGURATION
========================================================= */

const CATEGORY_GROUPS = [
  {
    title: "Grocery & Kitchen",
    description: "Everyday essentials for your home",
    categories: [
      {
        name: "Vegetables & Fruits",
        image:
          "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Fresh Vegetables",
          "Fresh Fruits",
          "Leafy Vegetables",
          "Seasonal Fruits",
        ],
      },
      {
        name: "Atta, Rice & Dal",
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
        subCategories: ["Atta", "Rice", "Dal", "Flours"],
      },
      {
        name: "Dairy & Eggs",
        image:
          "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600",
        subCategories: ["Milk", "Curd", "Paneer", "Butter", "Eggs"],
      },
      {
        name: "Oil, Ghee & Masala",
        image:
          "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Cooking Oil",
          "Ghee",
          "Spices",
          "Salt",
          "Sugar",
        ],
      },
      {
        name: "Bakery & Biscuits",
        image:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
        subCategories: ["Bread", "Biscuits", "Cakes", "Rusks"],
      },
      {
        name: "Kitchen Essentials",
        image:
          "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Kitchenware",
          "Storage",
          "Cleaning",
          "Appliances",
        ],
      },
    ],
  },

  {
    title: "Snacks & Drinks",
    description: "Treats, beverages and quick bites",
    categories: [
      {
        name: "Chips & Namkeen",
        image:
          "https://images.unsplash.com/photo-1621939514649-280e2aa9f9b3?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Chips",
          "Namkeen",
          "Popcorn",
          "Snacks",
        ],
      },
      {
        name: "Sweets & Chocolates",
        image:
          "https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Chocolates",
          "Indian Sweets",
          "Candies",
          "Gifting",
        ],
      },
      {
        name: "Drinks & Juices",
        image:
          "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Soft Drinks",
          "Juices",
          "Energy Drinks",
          "Water",
        ],
      },
      {
        name: "Tea & Coffee",
        image:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Tea",
          "Coffee",
          "Green Tea",
          "Milk Drinks",
        ],
      },
      {
        name: "Instant Food",
        image:
          "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Noodles",
          "Pasta",
          "Ready to Eat",
          "Soups",
        ],
      },
    ],
  },

  {
    title: "Beauty & Personal Care",
    description: "Personal care and daily essentials",
    categories: [
      {
        name: "Bath & Body",
        image:
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Bath & Shower",
          "Soaps",
          "Body Care",
          "Deodorants",
        ],
      },
      {
        name: "Hair Care",
        image:
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Shampoo",
          "Conditioner",
          "Hair Oil",
          "Hair Styling",
        ],
      },
      {
        name: "Skin Care",
        image:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Face Care",
          "Moisturizers",
          "Sunscreen",
          "Lip Care",
        ],
      },
      {
        name: "Health & Wellness",
        image:
          "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Vitamins",
          "Personal Care",
          "Wellness",
          "First Aid",
        ],
      },
    ],
  },

  {
    title: "Home & Lifestyle",
    description: "Everything to make your home better",
    categories: [
      {
        name: "Cleaning Essentials",
        image:
          "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Laundry",
          "Dishwashing",
          "Floor Cleaning",
          "Surface Cleaners",
        ],
      },
      {
        name: "Home Decor",
        image:
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Decor",
          "Lighting",
          "Storage",
          "Home Accessories",
        ],
      },
      {
        name: "Stationery & Books",
        image:
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Books",
          "Notebooks",
          "Pens",
          "School Supplies",
        ],
      },
      {
        name: "Pet Supplies",
        image:
          "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600",
        subCategories: [
          "Pet Food",
          "Treats",
          "Pet Care",
          "Accessories",
        ],
      },
    ],
  },
];

/* =========================================================
   COMPONENT
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
     ONLY PRODUCTS AVAILABLE NEAR CUSTOMER
  --------------------------------------------------------- */

  const nearbyProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];

    return filterNearbyProducts(allProducts);
  }, [allProducts, filterNearbyProducts]);

  /* ---------------------------------------------------------
     CREATE LOOKUP OF AVAILABLE CATEGORIES / SUBCATEGORIES
  --------------------------------------------------------- */

  const availableCategories = useMemo(() => {
    const categoryMap = {};

    nearbyProducts.forEach((product) => {
      const category = product?.category?.trim();

      if (!category) return;

      const subCategory = product?.subCategory?.trim();

      if (!categoryMap[category]) {
        categoryMap[category] = {
          count: 0,
          subCategories: {},
        };
      }

      categoryMap[category].count += 1;

      if (subCategory) {
        categoryMap[category].subCategories[subCategory] =
          (categoryMap[category].subCategories[subCategory] || 0) + 1;
      }
    });

    return categoryMap;
  }, [nearbyProducts]);

  /* ---------------------------------------------------------
     ONLY SHOW CONFIGURED CATEGORIES THAT HAVE PRODUCTS
  --------------------------------------------------------- */

  const visibleGroups = useMemo(() => {
    return CATEGORY_GROUPS.map((group) => {
      const visibleCategories = group.categories
        .map((category) => {
          const data = availableCategories[category.name];

          if (!data || data.count === 0) {
            return null;
          }

          /*
           * Only show subcategories that actually have products
           * nearby.
           */
          const availableSubCategories =
            category.subCategories.filter(
              (subCategory) =>
                data.subCategories[subCategory] > 0
            );

          return {
            ...category,
            count: data.count,
            availableSubCategories,
            subCategoryCounts: data.subCategories,
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

  const openAllProducts = () => {
    router.push("/product");
  };

  /* ---------------------------------------------------------
     LOCATION LOADING / EMPTY
  --------------------------------------------------------- */

  if (locationLoading || !serviceable) {
    return null;
  }

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#fffaf5] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            SECTION HEADER
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
              Explore everyday essentials and discover what&apos;s
              available from nearby stores.
            </p>
          </div>

          {/* DESKTOP VIEW ALL */}
          <button
            type="button"
            onClick={openAllProducts}
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 md:flex"
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        {/* =====================================================
            CATEGORY GROUPS
        ===================================================== */}

        <div className="space-y-12 sm:space-y-16">
          {visibleGroups.map((group) => (
            <div key={group.title}>

              {/* GROUP TITLE */}
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {group.title}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">
                    {group.description}
                  </p>
                </div>
              </div>

              {/* =================================================
                  CATEGORY CARDS
              ================================================= */}

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
                  <motion.div
                    key={category.name}
                    whileHover={{ y: -3 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 25,
                    }}
                    className="
                      overflow-hidden
                      rounded-[1.35rem]
                      border
                      border-slate-200
                      bg-white
                      shadow-sm
                      transition-shadow
                      hover:shadow-md
                    "
                  >
                    {/* CATEGORY IMAGE */}

                    <button
                      type="button"
                      onClick={() =>
                        openCategory(category.name)
                      }
                      className="group relative block w-full text-left"
                    >
                      <div className="relative h-32 overflow-hidden bg-orange-50 sm:h-36">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="
                            (max-width: 640px) 50vw,
                            (max-width: 1024px) 33vw,
                            20vw
                          "
                        />

                        {/* soft image overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                        {/* PRODUCT COUNT */}

                        <span className="absolute right-2.5 top-2.5 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-[9px] font-bold text-slate-600 shadow-sm backdrop-blur-sm">
                          {category.count}{" "}
                          {category.count === 1
                            ? "item"
                            : "items"}
                        </span>
                      </div>

                      {/* CATEGORY NAME */}

                      <div className="px-3.5 pb-2.5 pt-3">
                        <h4 className="text-sm font-extrabold leading-tight text-slate-800 transition-colors group-hover:text-orange-500 sm:text-base">
                          {category.name}
                        </h4>
                      </div>
                    </button>

                    {/* =================================================
                        SUBCATEGORY LIST
                    ================================================= */}

                    {category.availableSubCategories.length >
                      0 && (
                        <div className="border-t border-slate-100 px-3.5 py-3">
                          <div className="space-y-1">
                            {category.availableSubCategories
                              .slice(0, 4)
                              .map((subCategory) => {
                                const count =
                                  category.subCategoryCounts[
                                  subCategory
                                  ] || 0;

                                return (
                                  <button
                                    key={subCategory}
                                    type="button"
                                    onClick={() =>
                                      openSubCategory(
                                        category.name,
                                        subCategory
                                      )
                                    }
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
                                    <span className="min-w-0 truncate text-[11px] font-medium text-slate-500 transition-colors group-hover/sub:text-orange-600 sm:text-xs">
                                      {subCategory}
                                    </span>

                                    <span className="shrink-0 text-[9px] font-bold text-slate-300 transition-colors group-hover/sub:text-orange-400">
                                      {count}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>

                          {/* VIEW ALL SUBCATEGORIES */}

                          {category.availableSubCategories.length >
                            4 && (
                              <button
                                type="button"
                                onClick={() =>
                                  openCategory(category.name)
                                }
                                className="mt-2 flex items-center gap-1 px-2 text-[10px] font-extrabold text-orange-500 transition-colors hover:text-orange-600"
                              >
                                View all
                                <ArrowRight size={11} />
                              </button>
                            )}
                        </div>
                      )}

                    {/* NO SUBCATEGORY FALLBACK */}

                    {category.availableSubCategories.length ===
                      0 && (
                        <div className="border-t border-slate-100 px-3.5 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              openCategory(category.name)
                            }
                            className="flex items-center gap-1 text-[10px] font-extrabold text-orange-500 hover:text-orange-600"
                          >
                            Explore products
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      )}
                  </motion.div>
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
          onClick={openAllProducts}
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