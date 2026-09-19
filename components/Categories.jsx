"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* =========================================================
   YOUR ACTUAL PRODUCT TAXONOMY
   Must match StoreAddProduct.jsx
========================================================= */

const CATEGORY_DATA = [
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

  {
    name: "Others",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800",
    subCategories: [],
  },
];

/* =========================================================
   SUBCATEGORY CARD
========================================================= */

function SubCategoryCard({
  category,
  subCategory,
  image,
  count,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        min-w-[118px]
        shrink-0
        text-left
        sm:min-w-[135px]
        md:min-w-0
      "
    >
      <div
        className="
          relative
          aspect-square
          w-full
          overflow-hidden
          rounded-2xl
          border
          border-slate-100
          bg-slate-50
          shadow-sm
          transition-all
          duration-300
          group-hover:-translate-y-1
          group-hover:border-orange-200
          group-hover:shadow-md
        "
      >
        <Image
          src={image}
          alt={subCategory}
          fill
          className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
          sizes="
            (max-width: 640px) 118px,
            (max-width: 768px) 135px,
            15vw
          "
        />

        {/* subtle bottom gradient */}

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />

        {/* product count */}

        {count > 0 && (
          <span
            className="
              absolute
              right-2
              top-2
              rounded-full
              border
              border-white/80
              bg-white/90
              px-1.5
              py-0.5
              text-[8px]
              font-bold
              text-slate-600
              shadow-sm
              backdrop-blur-sm
            "
          >
            {count}
          </span>
        )}

        {/* subcategory name on image */}

        <div className="absolute inset-x-2 bottom-2">
          <p className="text-center text-[11px] font-bold leading-tight text-white drop-shadow sm:text-xs">
            {subCategory}
          </p>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   CATEGORY SECTION
========================================================= */

function CategorySection({
  category,
  productCount,
  subCategoryCounts,
  onCategoryClick,
  onSubCategoryClick,
}) {
  return (
    <section>
      {/* -----------------------------------------------------
          CATEGORY HEADING
      ----------------------------------------------------- */}

      <div className="mb-5 flex items-end justify-between gap-4">
        <button
          type="button"
          onClick={onCategoryClick}
          className="group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-orange-50 sm:h-11 sm:w-11">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3
                  className="
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-900
                    transition-colors
                    group-hover:text-orange-500
                    sm:text-2xl
                  "
                >
                  {category.name}
                </h3>

                <ArrowRight
                  size={17}
                  className="
                    text-slate-300
                    transition-all
                    group-hover:translate-x-1
                    group-hover:text-orange-500
                  "
                />
              </div>

              <p className="mt-0.5 text-[11px] font-medium text-slate-400 sm:text-xs">
                {productCount > 0
                  ? `${productCount} ${productCount === 1 ? "product" : "products"
                  } nearby`
                  : "Explore this category"}
              </p>
            </div>
          </div>
        </button>

        {/* View all */}

        <button
          type="button"
          onClick={onCategoryClick}
          className="
            hidden
            items-center
            gap-1
            text-xs
            font-bold
            text-orange-500
            transition-colors
            hover:text-orange-600
            sm:flex
          "
        >
          View all
          <ArrowRight size={13} />
        </button>
      </div>

      {/* -----------------------------------------------------
          SUBCATEGORIES
      ----------------------------------------------------- */}

      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-6
        "
      >
        {category.subCategories.map((subCategory) => (
          <SubCategoryCard
            key={subCategory}
            category={category.name}
            subCategory={subCategory}
            count={subCategoryCounts[subCategory] || 0}
            image={getSubCategoryImage(
              category.name,
              subCategory
            )}
            onClick={() =>
              onSubCategoryClick(subCategory)
            }
          />
        ))}
      </div>

      {/* Category with no subcategories */}

      {category.subCategories.length === 0 && (
        <button
          type="button"
          onClick={onCategoryClick}
          className="
            rounded-2xl
            border
            border-dashed
            border-slate-200
            bg-white
            px-5
            py-8
            text-sm
            font-bold
            text-slate-500
            transition-all
            hover:border-orange-200
            hover:bg-orange-50
            hover:text-orange-600
          "
        >
          Explore {category.name}
          <ArrowRight
            size={15}
            className="ml-1 inline"
          />
        </button>
      )}
    </section>
  );
}

/* =========================================================
   SUBCATEGORY IMAGE MAP
========================================================= */

function getSubCategoryImage(category, subCategory) {
  const images = {
    /* Electronics */

    Mobiles:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",

    Laptops:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600",

    Audio:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",

    Wearables:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",

    Appliances:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600",

    /* Clothing */

    "Men's Wear":
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600",

    "Women's Wear":
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600",

    "Kid's Wear":
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=600",

    Shoes:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",

    Accessories:
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&q=80&w=600",

    /* Home */

    Furniture:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600",

    Decor:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600",

    Kitchenware:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600",

    Bedding:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600",

    Lighting:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600",

    /* Beauty */

    Skincare:
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=600",

    Makeup:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",

    Haircare:
      "https://images.unsplash.com/photo-1527799820374-dcf8a6d9f5a5?auto=format&fit=crop&q=80&w=600",

    Fragrances:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",

    Supplements:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=600",

    /* Toys */

    "Action Figures":
      "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&q=80&w=600",

    "Board Games":
      "https://images.unsplash.com/photo-1606503153255-59d8b8b8e1a5?auto=format&fit=crop&q=80&w=600",

    Puzzles:
      "https://images.unsplash.com/photo-1606503151374-d6b5c6c1c1f4?auto=format&fit=crop&q=80&w=600",

    "Video Games":
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=600",

    "Soft Toys":
      "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&q=80&w=600",

    /* Sports */

    "Fitness Equipment":
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600",

    "Outdoor Gear":
      "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=600",

    "Team Sports":
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600",

    Sportswear:
      "https://images.unsplash.com/photo-1517838277536-f5f99be50109?auto=format&fit=crop&q=80&w=600",

    /* Books */

    Fiction:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",

    "Non-Fiction":
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600",

    Educational:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600",

    Comics:
      "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&q=80&w=600",

    "Music & Movies":
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600",

    /* Food */

    Snacks:
      "https://images.unsplash.com/photo-1621939514649-280e2aa5d7f1?auto=format&fit=crop&q=80&w=600",

    Beverages:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=600",

    Groceries:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",

    "Fresh Produce":
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600",

    "Packaged Food":
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",

    /* Hobbies */

    "Art Supplies":
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",

    "DIY Kits":
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=600",

    Collectibles:
      "https://images.unsplash.com/photo-1560961911-ba7ef651a56c?auto=format&fit=crop&q=80&w=600",

    "Musical Instruments":
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&q=80&w=600",
  };

  return (
    images[subCategory] ||
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=600"
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
     FILTER NEARBY PRODUCTS
  --------------------------------------------------------- */

  const nearbyProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];

    return filterNearbyProducts(allProducts);
  }, [allProducts, filterNearbyProducts]);

  /* ---------------------------------------------------------
     PRODUCT COUNTS
  --------------------------------------------------------- */

  const categoryStats = useMemo(() => {
    const stats = {};

    nearbyProducts.forEach((product) => {
      const category = product?.category?.trim();

      if (!category) return;

      if (!stats[category]) {
        stats[category] = {
          count: 0,
          subCategories: {},
        };
      }

      stats[category].count += 1;

      const subCategory =
        product?.subCategory?.trim();

      if (subCategory) {
        stats[category].subCategories[subCategory] =
          (stats[category].subCategories[subCategory] || 0) + 1;
      }
    });

    return stats;
  }, [nearbyProducts]);

  /* ---------------------------------------------------------
     IMPORTANT:
     Show ALL configured categories and subcategories.
     
     We do NOT hide a subcategory just because it currently
     has zero products.
  --------------------------------------------------------- */

  if (locationLoading || !serviceable) {
    return null;
  }

  return (
    <section className="bg-[#fffaf5] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-9 flex items-end justify-between gap-4 sm:mb-11">
          <div>
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-500 sm:text-xs">
              Explore nearby
            </p>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Browse local products by category and discover
              exactly what you need.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/product")}
            className="
              hidden
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
            CATEGORIES
        ===================================================== */}

        <div className="space-y-12 sm:space-y-16">

          {CATEGORY_DATA.map((category) => {
            const stats =
              categoryStats[category.name] || {
                count: 0,
                subCategories: {},
              };

            return (
              <CategorySection
                key={category.name}
                category={category}
                productCount={stats.count}
                subCategoryCounts={stats.subCategories}
                onCategoryClick={() =>
                  router.push(
                    `/product?category=${encodeURIComponent(
                      category.name
                    )}`
                  )
                }
                onSubCategoryClick={(subCategory) =>
                  router.push(
                    `/product?category=${encodeURIComponent(
                      category.name
                    )}&subCategory=${encodeURIComponent(
                      subCategory
                    )}`
                  )
                }
              />
            );
          })}

        </div>

        {/* MOBILE */}

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