"use client";

import WishlistCard from "./WishlistCard";

export default function WishlistGrid({ products }) {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div
            className="
        grid
        grid-cols-2
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        gap-5
        md:gap-6
      "
        >
            {products.map((product) => (
                <WishlistCard
                    key={product.id}
                    product={product}
                />
            ))}
        </div>
    );
}