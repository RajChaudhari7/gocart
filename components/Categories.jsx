"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* =========================================================
   CATEGORY IMAGE MAP

   These are only visual fallbacks.
   CATEGORY/SUBCATEGORY DATA comes from actual products.
========================================================= */

const CATEGORY_IMAGES = {
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",

  Clothing:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800",

  "Home & Kitchen":
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",

  "Beauty & Health":
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",

  "Toys & Games":
    "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&q=80&w=800",

  "Sports & Outdoors":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",

  "Books & Media":
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800",

  "Food & Drink":
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",

  "Hobbies & Crafts":
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800",
};

const SUBCATEGORY_IMAGES = {
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

  "Men's Wear":
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600",

  "Women's Wear":
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600",

  "Kid's Wear":
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=600",

  Shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",

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

  "Fitness Equipment":
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600",

  "Outdoor Gear":
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=600",

  "Team Sports":
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600",

  Sportswear:
    "https://images.unsplash.com/photo-1517838277536-f5f99be50109?auto=format&fit=crop&q=80&w=600",

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

  "Art Supplies":
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",

  "DIY Kits":
    "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=600",

  Collectibles:
    "https://images.unsplash.com/photo-1560961911-ba7ef651a56c?auto=format&fit=crop&q=80&w=600",

  "Musical Instruments":
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&q=80&w=600",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800";

/* =========================================================
   GET IMAGE
========================================================= */

function getSubCategoryImage(subCategory) {
  return SUBCATEGORY_IMAGES[subCategory] || DEFAULT_IMAGE;
}

function getCategoryImage(category) {
  return CATEGORY_IMAGES[category] || DEFAULT_IMAGE;
}

/* =========================================================
   SUBCATEGORY CARD
========================================================= */

function SubCategoryCard({
  category,
  subCategory,
  count,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        min-w-[125px]
        shrink-0
        text-left
        sm:min-w-[140px]
        md:min-w-0
      "
    >
      <div
        className="
          relative
          aspect-square
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
          src={getSubCategoryImage(subCategory)}
          alt={`${subCategory} - ${category}`}
          fill
          className="
            object-cover
            transition-transform
            duration-500
            ease-out
            group-hover:scale-105
          "
          sizes="
            (max-width: 640px) 125px,
            (max-width: 768px) 140px,
            16vw
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

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
  count,
  subCategories,
  subCategoryCounts,
  onCategoryClick,
  onSubCategoryClick,
}) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <button
          type="button"
          onClick={onCategoryClick}
          className="group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-orange-50">
              <Image
                src={getCategoryImage(category)}
                alt={category}
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
                  {category}
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
                {count > 0
                  ? `${count} ${count === 1 ? "product" : "products"
                  } nearby`
                  : "Explore products"}
              </p>
            </div>
          </div>
        </button>

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

      {/* SUBCATEGORY GRID */}

      {subCategories.length > 0 ? (
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
          {subCategories.map((subCategory) => (
            <SubCategoryCard
              key={subCategory}
              category={category}
              subCategory={subCategory}
              count={subCategoryCounts[subCategory] || 0}
              onClick={() =>
                onSubCategoryClick(subCategory)
              }
            />
          ))}
        </div>
      ) : (
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
          Explore {category}
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
     ONLY PRODUCTS AVAILABLE TO THIS CUSTOMER
  --------------------------------------------------------- */

  const nearbyProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) {
      return [];
    }

    return filterNearbyProducts(allProducts);
  }, [allProducts, filterNearbyProducts]);

  /* ---------------------------------------------------------
     BUILD DYNAMIC TAXONOMY

     Example:

     Electronics
       ├─ Mobiles
       ├─ Laptops
       ├─ Buds        <-- automatically appears
       └─ Smart Watch <-- automatically appears

     Pet Supplies
       └─ Dog Food    <-- custom category automatically appears
  --------------------------------------------------------- */

  const categories = useMemo(() => {
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

      const subCategory =
        product?.subCategory?.trim();

      if (subCategory) {
        map[category].subCategories[subCategory] =
          (map[category].subCategories[subCategory] || 0) + 1;
      }
    });

    return Object.entries(map)
      .map(([category, data]) => ({
        category,
        count: data.count,
        subCategories: Object.keys(
          data.subCategories
        ).sort((a, b) =>
          a.localeCompare(b)
        ),
        subCategoryCounts: data.subCategories,
      }))
      .sort((a, b) =>
        a.category.localeCompare(b.category)
      );
  }, [nearbyProducts]);

  /* ---------------------------------------------------------
     LOCATION STATES
  --------------------------------------------------------- */

  if (locationLoading || !serviceable) {
    return null;
  }

  /* ---------------------------------------------------------
     NO PRODUCTS
  --------------------------------------------------------- */

  if (categories.length === 0) {
    return null;
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

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
              Browse products from local shops near you.
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
            DYNAMIC CATEGORIES
        ===================================================== */}

        <div className="space-y-12 sm:space-y-16">
          {categories.map(
            ({
              category,
              count,
              subCategories,
              subCategoryCounts,
            }) => (
              <CategorySection
                key={category}
                category={category}
                count={count}
                subCategories={subCategories}
                subCategoryCounts={subCategoryCounts}
                onCategoryClick={() =>
                  router.push(
                    `/product?category=${encodeURIComponent(
                      category
                    )}`
                  )
                }
                onSubCategoryClick={(subCategory) =>
                  router.push(
                    `/product?category=${encodeURIComponent(
                      category
                    )}&subCategory=${encodeURIComponent(
                      subCategory
                    )}`
                  )
                }
              />
            )
          )}
        </div>

        {/* MOBILE VIEW ALL */}

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