"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { ArrowRight, ImageOff } from "lucide-react";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* =========================================================
   HELPERS
========================================================= */

const DEFAULT_IMAGE =
  "/categories/default-category.webp";

/**
 * Returns the first usable image from a product.
 */
function getProductImage(product) {
  if (!product || !Array.isArray(product.images)) {
    return null;
  }

  return (
    product.images.find(
      (image) =>
        typeof image === "string" &&
        image.trim().length > 0
    ) || null
  );
}

function getRepresentativeProduct(products = []) {
  const productsWithImages = products.filter(
    (product) => getProductImage(product)
  );

  if (!productsWithImages.length) {
    return null;
  }

  return [...productsWithImages].sort((a, b) => {
    const salesA = Number(a?.totalSales || 0);
    const salesB = Number(b?.totalSales || 0);

    if (salesB !== salesA) {
      return salesB - salesA;
    }

    const viewsA = Number(a?.views || 0);
    const viewsB = Number(b?.views || 0);

    if (viewsB !== viewsA) {
      return viewsB - viewsA;
    }

    const dateA = new Date(
      a?.createdAt || 0
    ).getTime();

    const dateB = new Date(
      b?.createdAt || 0
    ).getTime();

    return dateB - dateA;
  })[0];
}

/* =========================================================
   IMAGE COMPONENT

   Uses the real product image when available.
   Otherwise shows a clean fallback instead of a random
   unrelated image.
========================================================= */

function CategoryImage({
  product,
  alt,
  sizes = "160px",
  className = "",
}) {
  const image = getProductImage(product);

  if (!image) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-emerald-50 ${className}`}
      >
        <div className="flex flex-col items-center gap-1 text-slate-300">
          <ImageOff size={22} />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={image}
      alt={alt}
      fill
      sizes={sizes}
      className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${className}`}
    />
  );
}

/* =========================================================
   SUBCATEGORY CARD
========================================================= */

function SubCategoryCard({
  category,
  subCategory,
  count,
  product,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        min-w-0
        text-left
        outline-none
      "
      aria-label={`Browse ${subCategory} in ${category}`}
    >
      <div
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-2xl
          border
          border-slate-100
          bg-white
          shadow-sm
          transition-all
          duration-300
          group-hover:-translate-y-1
          group-hover:border-orange-200
          group-hover:shadow-lg
          group-focus-visible:ring-2
          group-focus-visible:ring-orange-400
          group-focus-visible:ring-offset-2
        "
      >
        {/* IMAGE */}

        <CategoryImage
          product={product}
          alt={`${subCategory} products`}
          sizes="
            (max-width: 640px) 42vw,
            (max-width: 768px) 28vw,
            (max-width: 1024px) 21vw,
            16vw
          "
        />

        {/* GRADIENT */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/65
            via-black/5
            to-transparent
          "
        />

        {/* PRODUCT COUNT */}

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
              px-2
              py-1
              text-[9px]
              font-extrabold
              text-slate-700
              shadow-sm
              backdrop-blur-md
            "
          >
            {count}
          </span>
        )}

        {/* NAME */}

        <div className="absolute inset-x-2 bottom-2.5">
          <p
            className="
              line-clamp-2
              text-center
              text-[11px]
              font-extrabold
              leading-tight
              text-white
              drop-shadow-md
              sm:text-xs
            "
          >
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
  categoryProduct,
  subCategoryProducts,
  onCategoryClick,
  onSubCategoryClick,
}) {
  return (
    <section>
      {/* =====================================================
          CATEGORY HEADER
      ===================================================== */}

      <div className="mb-5 flex items-end justify-between gap-4">
        <button
          type="button"
          onClick={onCategoryClick}
          className="
            group
            flex
            min-w-0
            items-center
            gap-3
            text-left
            outline-none
            focus-visible:ring-2
            focus-visible:ring-orange-400
            focus-visible:ring-offset-2
            rounded-xl
          "
          aria-label={`Browse ${category}`}
        >
          {/* CATEGORY IMAGE */}

          <div
            className="
              relative
              h-12
              w-12
              shrink-0
              overflow-hidden
              rounded-xl
              border
              border-slate-100
              bg-white
              shadow-sm
            "
          >
            <CategoryImage
              product={categoryProduct}
              alt={`${category} products`}
              sizes="48px"
            />
          </div>

          {/* CATEGORY TEXT */}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3
                className="
                  truncate
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
                  shrink-0
                  text-slate-300
                  transition-all
                  group-hover:translate-x-1
                  group-hover:text-orange-500
                "
              />
            </div>

            <p className="mt-0.5 text-[11px] font-medium text-slate-400 sm:text-xs">
              {count}{" "}
              {count === 1 ? "product" : "products"} nearby
            </p>
          </div>
        </button>

        {/* DESKTOP VIEW ALL */}

        <button
          type="button"
          onClick={onCategoryClick}
          className="
            hidden
            shrink-0
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

      {/* =====================================================
          SUBCATEGORIES
      ===================================================== */}

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
              count={
                subCategoryCounts[subCategory] || 0
              }
              product={
                subCategoryProducts[subCategory] || null
              }
              onClick={() =>
                onSubCategoryClick(subCategory)
              }
            />
          ))}
        </div>
      ) : (
        /* ===================================================
           CATEGORY WITHOUT SUBCATEGORIES
        =================================================== */

        <button
          type="button"
          onClick={onCategoryClick}
          className="
            flex
            w-full
            items-center
            justify-between
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            py-5
            text-left
            shadow-sm
            transition-all
            hover:border-orange-200
            hover:bg-orange-50
            hover:shadow-md
          "
        >
          <div>
            <p className="text-sm font-bold text-slate-800">
              Explore {category}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Browse all nearby products
            </p>
          </div>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-orange-50
              text-orange-500
            "
          >
            <ArrowRight size={16} />
          </div>
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

  /* =======================================================
     NEARBY PRODUCTS
  ======================================================= */

  const nearbyProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) {
      return [];
    }

    return filterNearbyProducts(allProducts);
  }, [allProducts, filterNearbyProducts]);

  /* =======================================================
     BUILD DYNAMIC CATEGORY STRUCTURE

     Example:

     Electronics
       ├── Mobiles
       ├── Laptops
       └── Buds

     Beauty & Health
       ├── Makeup
       └── Foundation

     Pet Supplies
       └── Dog Food

     Nothing is hardcoded here.
  ======================================================= */

  const categories = useMemo(() => {
    const categoryMap = {};

    nearbyProducts.forEach((product) => {
      const category =
        product?.category?.trim();

      if (!category) {
        return;
      }

      if (!categoryMap[category]) {
        categoryMap[category] = {
          products: [],
          subCategories: {},
        };
      }

      categoryMap[category].products.push(product);

      const subCategory =
        product?.subCategory?.trim();

      if (!subCategory) {
        return;
      }

      if (
        !categoryMap[category].subCategories[
        subCategory
        ]
      ) {
        categoryMap[category].subCategories[
          subCategory
        ] = [];
      }

      categoryMap[category].subCategories[
        subCategory
      ].push(product);
    });

    return Object.entries(categoryMap)
      .map(([category, data]) => {
        const subCategoryEntries =
          Object.entries(
            data.subCategories
          );

        const subCategoryCounts = {};

        const subCategoryProducts = {};

        subCategoryEntries.forEach(
          ([subCategory, products]) => {
            subCategoryCounts[subCategory] =
              products.length;

            subCategoryProducts[subCategory] =
              getRepresentativeProduct(products);
          }
        );

        return {
          category,

          count: data.products.length,

          /* Representative image for main category */

          categoryProduct:
            getRepresentativeProduct(
              data.products
            ),

          /* Available subcategories only */

          subCategories: subCategoryEntries
            .map(([subCategory]) => subCategory)
            .sort((a, b) =>
              a.localeCompare(b)
            ),

          subCategoryCounts,

          subCategoryProducts,
        };
      })
      .sort((a, b) =>
        a.category.localeCompare(
          b.category
        )
      );
  }, [nearbyProducts]);

  /* =======================================================
     LOCATION STATES
  ======================================================= */

  if (locationLoading) {
    return null;
  }

  if (!serviceable) {
    return null;
  }

  /* =======================================================
     NOTHING AVAILABLE
  ======================================================= */

  if (!categories.length) {
    return null;
  }

  /* =======================================================
     ROUTING
  ======================================================= */

  const handleCategoryClick = (category) => {
    router.push(
      `/product?category=${encodeURIComponent(
        category
      )}`
    );
  };

  const handleSubCategoryClick = (
    category,
    subCategory
  ) => {
    router.push(
      `/product?category=${encodeURIComponent(
        category
      )}&subCategory=${encodeURIComponent(
        subCategory
      )}`
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section
      className="
        bg-[#fffaf5]
        py-10
        sm:py-14
        lg:py-16
      "
    >
      <div
        className="
          mx-auto
          max-w-[1400px]
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div
          className="
            mb-9
            flex
            items-end
            justify-between
            gap-4
            sm:mb-11
          "
        >
          <div>
            <p
              className="
                mb-1.5
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.2em]
                text-orange-500
                sm:text-xs
              "
            >
              Explore nearby
            </p>

            <h2
              className="
                text-2xl
                font-black
                tracking-tight
                text-slate-900
                sm:text-3xl
                lg:text-4xl
              "
            >
              Shop by Category
            </h2>

            <p
              className="
                mt-2
                max-w-xl
                text-sm
                leading-6
                text-slate-500
                sm:text-base
              "
            >
              Discover products from local
              shops near you.
            </p>
          </div>

          {/* DESKTOP */}

          <button
            type="button"
            onClick={() =>
              router.push("/product")
            }
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

        {/* =================================================
            CATEGORY SECTIONS
        ================================================= */}

        <div className="space-y-12 sm:space-y-16">
          {categories.map(
            ({
              category,
              count,
              categoryProduct,
              subCategories,
              subCategoryCounts,
              subCategoryProducts,
            }) => (
              <CategorySection
                key={category}
                category={category}
                count={count}
                categoryProduct={
                  categoryProduct
                }
                subCategories={
                  subCategories
                }
                subCategoryCounts={
                  subCategoryCounts
                }
                subCategoryProducts={
                  subCategoryProducts
                }
                onCategoryClick={() =>
                  handleCategoryClick(
                    category
                  )
                }
                onSubCategoryClick={(
                  subCategory
                ) =>
                  handleSubCategoryClick(
                    category,
                    subCategory
                  )
                }
              />
            )
          )}
        </div>

        {/* =================================================
            MOBILE VIEW ALL
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            router.push("/product")
          }
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