"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Search,
    Store,
    Tag,
    ArrowUpRight,
    Package,
} from "lucide-react";

export default function SearchDropdown({
    loading,
    results,
    onClose,
    onProductClick,
    onCategoryClick,
    onStoreClick,
}) {
    if (!loading && !results) return null;

    const hasResults =
        results?.products?.length > 0 ||
        results?.categories?.length > 0 ||
        results?.stores?.length > 0 ||
        results?.suggestions?.length > 0;

    return (
        <div
            className="
                absolute
                top-full
                left-0
                right-0
                mt-2

                overflow-hidden

                rounded-2xl
                border
                border-slate-700/80

                bg-slate-950/95
                backdrop-blur-xl

                shadow-[0_20px_60px_rgba(0,0,0,0.45)]

                z-[999]

                animate-in
                fade-in
                slide-in-from-top-2
                duration-150
            "
        >
            {/* =========================
                LOADING
            ========================== */}

            {loading && (
                <div className="flex items-center justify-center gap-3 px-6 py-8">
                    <div
                        className="
                            h-5
                            w-5
                            animate-spin
                            rounded-full
                            border-2
                            border-slate-600
                            border-t-cyan-400
                        "
                    />

                    <span className="text-sm text-slate-400">
                        Searching nearby...
                    </span>
                </div>
            )}

            {/* =========================
                RESULTS
            ========================== */}

            {!loading && (
                <>
                    {/* =========================
                        SUGGESTIONS
                    ========================== */}

                    {results?.suggestions?.length > 0 && (
                        <div className="border-b border-slate-800/80">
                            <div className="px-5 pt-4 pb-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Suggestions
                                </p>
                            </div>

                            <div className="pb-2">
                                {results.suggestions.map((item, index) => (
                                    <Link
                                        key={`${item}-${index}`}
                                        href={`/product?search=${encodeURIComponent(
                                            item
                                        )}`}
                                        onClick={onClose}
                                        className="
                                            group
                                            flex
                                            items-center
                                            gap-3

                                            px-5
                                            py-2.5

                                            transition-colors
                                            hover:bg-slate-800/70
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-8
                                                w-8
                                                shrink-0
                                                items-center
                                                justify-center

                                                rounded-lg

                                                bg-slate-800
                                                text-slate-400

                                                transition
                                                group-hover:bg-cyan-500/10
                                                group-hover:text-cyan-400
                                            "
                                        >
                                            <Search size={15} />
                                        </div>

                                        <span
                                            className="
                                                truncate
                                                text-sm
                                                text-slate-300

                                                group-hover:text-white
                                            "
                                        >
                                            {item}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* =========================
                        PRODUCTS
                    ========================== */}

                    {results?.products?.length > 0 && (
                        <div className="border-b border-slate-800/80">
                            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Products
                                </p>

                                <span className="text-[11px] text-slate-600">
                                    Nearby
                                </span>
                            </div>

                            <div className="max-h-[320px] overflow-y-auto pb-2">
                                {results.products.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => {
                                            onClose?.();

                                            /*
                                             * IMPORTANT:
                                             * Send the complete product object.
                                             * The parent can now navigate directly
                                             * to the product detail page instead
                                             * of performing another search.
                                             */
                                            onProductClick(product);
                                        }}
                                        className="
                                            group
                                            flex
                                            w-full
                                            items-center
                                            gap-3

                                            px-5
                                            py-3

                                            text-left

                                            transition-all
                                            hover:bg-slate-800/70
                                        "
                                    >
                                        {/* Product Image */}

                                        <div
                                            className="
                                                relative
                                                h-12
                                                w-12
                                                shrink-0
                                                overflow-hidden

                                                rounded-xl

                                                border
                                                border-slate-700

                                                bg-slate-900
                                            "
                                        >
                                            <Image
                                                src={
                                                    product.images?.[0] ||
                                                    "/placeholder.png"
                                                }
                                                alt={
                                                    product.name ||
                                                    "Product"
                                                }
                                                fill
                                                sizes="48px"
                                                className="
                                                    object-cover
                                                    transition-transform
                                                    duration-300
                                                    group-hover:scale-105
                                                "
                                            />
                                        </div>

                                        {/* Product Details */}

                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="
                                                    truncate
                                                    text-sm
                                                    font-semibold
                                                    text-white
                                                    group-hover:text-cyan-300
                                                "
                                            >
                                                {product.name}
                                            </p>

                                            {product.store?.name && (
                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <Store
                                                        size={12}
                                                        className="shrink-0 text-slate-500"
                                                    />

                                                    <p className="truncate text-xs text-slate-500">
                                                        {product.store.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Price */}

                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-bold text-cyan-400">
                                                ₹{product.price}
                                            </p>

                                            {product.mrp &&
                                                Number(product.mrp) >
                                                Number(product.price) && (
                                                    <p className="text-[11px] text-slate-600 line-through">
                                                        ₹{product.mrp}
                                                    </p>
                                                )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* =========================
                        CATEGORIES
                    ========================== */}

                    {results?.categories?.length > 0 && (
                        <div className="border-b border-slate-800/80">
                            <div className="px-5 pt-4 pb-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Categories
                                </p>
                            </div>

                            <div className="pb-2">
                                {results.categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                            onClose?.();
                                            onCategoryClick(cat);
                                        }}
                                        className="
                                            group
                                            flex
                                            w-full
                                            items-center
                                            gap-3

                                            px-5
                                            py-2.5

                                            text-left

                                            transition-colors
                                            hover:bg-slate-800/70
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-8
                                                w-8
                                                shrink-0
                                                items-center
                                                justify-center

                                                rounded-lg

                                                bg-indigo-500/10
                                                text-indigo-400

                                                transition
                                                group-hover:bg-indigo-500/20
                                            "
                                        >
                                            <Tag size={15} />
                                        </div>

                                        <span
                                            className="
                                                text-sm
                                                font-medium
                                                text-slate-300
                                                group-hover:text-white
                                            "
                                        >
                                            {cat}
                                        </span>

                                        <ArrowUpRight
                                            size={14}
                                            className="
                                                ml-auto
                                                text-slate-600
                                                transition
                                                group-hover:text-indigo-400
                                            "
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* =========================
                        STORES
                    ========================== */}

                    {results?.stores?.length > 0 && (
                        <div>
                            <div className="px-5 pt-4 pb-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Stores
                                </p>
                            </div>

                            <div className="pb-2">
                                {results.stores.map((store) => (
                                    <button
                                        key={store.id}
                                        type="button"
                                        onClick={() => {
                                            onClose?.();
                                            onStoreClick(store.username);
                                        }}
                                        className="
                                            group
                                            flex
                                            w-full
                                            items-center
                                            justify-between

                                            px-5
                                            py-3

                                            text-left

                                            transition-colors
                                            hover:bg-slate-800/70
                                        "
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    shrink-0
                                                    items-center
                                                    justify-center

                                                    rounded-lg

                                                    bg-emerald-500/10
                                                    text-emerald-400

                                                    transition
                                                    group-hover:bg-emerald-500/20
                                                "
                                            >
                                                <Store size={16} />
                                            </div>

                                            <span
                                                className="
                                                    truncate
                                                    text-sm
                                                    font-medium
                                                    text-slate-300
                                                    group-hover:text-white
                                                "
                                            >
                                                {store.name}
                                            </span>
                                        </div>

                                        <ArrowUpRight
                                            size={15}
                                            className="
                                                shrink-0
                                                text-slate-600
                                                transition
                                                group-hover:text-emerald-400
                                            "
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* =========================
                        NO RESULTS
                    ========================== */}

                    {!hasResults && (
                        <div className="px-6 py-10 text-center">
                            <div
                                className="
                                    mx-auto
                                    mb-3
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center

                                    rounded-full

                                    bg-slate-800

                                    text-slate-500
                                "
                            >
                                <Package size={20} />
                            </div>

                            <p className="text-sm font-medium text-slate-300">
                                No results found
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Try another product, category or store.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}