"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import Image from "next/image";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

/* CATEGORY IMAGES */
const IMAGE_MAP = {
"Vegetables & Fruits":
"https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=500",

"Atta, Rice & Dal":
"https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=500",

"Oil, Ghee & Masala":
"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=500",

"Dairy, Bread & Eggs":
"https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=500",

"Bakery & Biscuits":
"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=500",

"Dry Fruits & Cereals":
"https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=500",

"Chicken, Meat & Fish":
"https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=500",

"Kitchenware & Appliances":
"https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=500",

"Chips & Namkeen":
"https://images.unsplash.com/photo-1621939514649-280e2aa2f6c8?auto=format&fit=crop&q=80&w=500",

"Sweets & Chocolates":
"https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&q=80&w=500",

"Drinks & Juices":
"https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=500",

"Tea, Coffee & Milk Drinks":
"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=500",

"Instant Food":
"https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&q=80&w=500",

"Sauces & Spreads":
"https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=500",

"Paan Corner":
"https://images.unsplash.com/photo-1603905179139-db12ab5356b5?auto=format&fit=crop&q=80&w=500",

"Ice Creams & More":
"https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=500",

Default:
"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=500",
};

/*

* DISPLAY GROUPS
*
* These names control the visual grouping.
* Your actual database categories are still used
* for filtering/products.
  */
  const CATEGORY_GROUPS = [
  {
  title: "Grocery & Kitchen",
  categories: [
  "Vegetables & Fruits",
  "Atta, Rice & Dal",
  "Oil, Ghee & Masala",
  "Dairy, Bread & Eggs",
  "Bakery & Biscuits",
  "Dry Fruits & Cereals",
  "Chicken, Meat & Fish",
  "Kitchenware & Appliances",
  ],
  },
  {
  title: "Snacks & Drinks",
  categories: [
  "Chips & Namkeen",
  "Sweets & Chocolates",
  "Drinks & Juices",
  "Tea, Coffee & Milk Drinks",
  "Instant Food",
  "Sauces & Spreads",
  "Paan Corner",
  "Ice Creams & More",
  ],
  },
  ];

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

/*

* Keep your nearby-store filtering.
  */
  const products = useMemo(() => {
  return filterNearbyProducts(allProducts);
  }, [allProducts, filterNearbyProducts]);

/*

* Get the categories that are actually available
* from nearby stores.
  */
  const availableCategories = useMemo(() => {
  return new Set(
  products
  .map((product) => product.category?.trim())
  .filter(Boolean)
  );
  }, [products]);

/*

* Location is still handled by Home / context.
  */
  if (locationLoading || !serviceable) {
  return null;
  }

/*

* If there are no nearby products,
* don't display categories.
  */
  if (availableCategories.size === 0) {
  return null;
  }

const handleClick = (category) => {
router.push(
`/product?category=${encodeURIComponent(category)}`
);
};

return ( <section className="bg-white py-6 sm:py-8"> <div className="mx-auto max-w-[1400px] px-2 sm:px-4 lg:px-6">

```
    {CATEGORY_GROUPS.map((group) => {
      /*
       * Only show categories that actually exist
       * in nearby stores.
       */
      const visibleCategories = group.categories.filter(
        (category) => availableCategories.has(category)
      );

      if (visibleCategories.length === 0) {
        return null;
      }

      return (
        <div
          key={group.title}
          className="mb-10 last:mb-0 sm:mb-12"
        >
          {/* SECTION TITLE */}
          <h2 className="
            mb-4
            px-1
            text-xl
            font-extrabold
            tracking-tight
            text-slate-900
            sm:text-2xl
          ">
            {group.title}
          </h2>

          {/* CATEGORY GRID */}
          <div className="
            grid
            grid-cols-2
            gap-x-2
            gap-y-5
            sm:grid-cols-3
            sm:gap-x-3
            md:grid-cols-4
            md:gap-x-4
            md:gap-y-6
          ">
            {visibleCategories.map((category) => {
              const imageSrc =
                IMAGE_MAP[category] || IMAGE_MAP.Default;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleClick(category)}
                  className="
                    group
                    min-w-0
                    text-center
                    outline-none
                  "
                >
                  {/* IMAGE BOX */}
                  <div className="
                    relative
                    h-[112px]
                    w-full
                    overflow-hidden
                    rounded-2xl
                    bg-[#e9f5f6]
                    transition-all
                    duration-200
                    group-hover:-translate-y-0.5
                    group-hover:shadow-sm
                    sm:h-[125px]
                    md:h-[140px]
                  ">
                    <Image
                      src={imageSrc}
                      alt={category}
                      fill
                      className="
                        object-contain
                        p-4
                        transition-transform
                        duration-300
                        group-hover:scale-105
                        sm:p-5
                      "
                      sizes="
                        (max-width: 640px) 50vw,
                        (max-width: 768px) 33vw,
                        25vw
                      "
                    />
                  </div>

                  {/* CATEGORY NAME */}
                  <h3 className="
                    mt-2
                    px-1
                    text-sm
                    font-semibold
                    leading-tight
                    text-slate-800
                    transition-colors
                    group-hover:text-slate-950
                    sm:text-base
                  ">
                    {category}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
</section>
```

);
}
