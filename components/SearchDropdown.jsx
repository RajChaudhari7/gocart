"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Search,
    Store,
    Tag,
    ArrowUpRight,
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

    return (
        <div
            className="
      absolute
      top-full
      left-0
      right-0

      mt-2

      bg-slate-900
      border
      border-slate-700

      rounded-2xl

      shadow-2xl

      overflow-hidden

      z-[999]
      "
        >
            {loading && (
                <div className="p-6 text-center text-slate-400">
                    Searching...
                </div>
            )}

            {!loading && (
                <>
                    {/* Suggestions */}

                    {results?.suggestions?.length > 0 && (
                        <div className="border-b border-slate-800">

                            <div className="px-5 pt-4 pb-2 text-xs uppercase tracking-wider text-slate-500">
                                Suggestions
                            </div>

                            {results.suggestions.map((item, i) => (
                                <Link
                                    key={i}
                                    href={`/product?search=${encodeURIComponent(item)}`}
                                    onClick={onClose}
                                    className="
                  flex
                  items-center
                  gap-3

                  px-5
                  py-3

                  hover:bg-slate-800
                  transition
                  "
                                >
                                    <Search
                                        size={15}
                                        className="text-slate-500"
                                    />

                                    <span className="text-white">
                                        {item}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Products */}

                    {results?.products?.length > 0 && (

                        <div className="border-b border-slate-800">

                            <div className="px-5 pt-4 pb-2 text-xs uppercase tracking-wider text-slate-500">
                                Products
                            </div>

                            {results.products.map((product) => (

                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => onProductClick(product.name)}
                                    className="
                  flex
                  items-center
                  gap-4

                  px-5
                  py-3

                  hover:bg-slate-800
                  transition
                  "
                                >
                                    <Image
                                        src={product.images?.[0] || "/placeholder.png"}
                                        width={45}
                                        height={45}
                                        alt={product.name}
                                        className="rounded-lg object-cover"
                                    />

                                    <div className="flex-1">

                                        <p className="font-medium text-white">
                                            {product.name}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            {product.store?.name}
                                        </p>

                                    </div>

                                    <div className="text-cyan-400 font-semibold">
                                        ₹{product.price}
                                    </div>

                                </button>

                            ))}

                        </div>

                    )}

                    {/* Categories */}

                    {results?.categories?.length > 0 && (

                        <div className="border-b border-slate-800">

                            <div className="px-5 pt-4 pb-2 text-xs uppercase tracking-wider text-slate-500">
                                Categories
                            </div>

                            {results.categories.map((cat) => (

                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => onCategoryClick(cat)}
                                    className="
                  flex
                  items-center
                  gap-3

                  px-5
                  py-3

                  hover:bg-slate-800
                  transition
                  "
                                >
                                    <Tag
                                        size={15}
                                        className="text-indigo-400"
                                    />

                                    <span className="text-white">
                                        {cat}
                                    </span>

                                </button>

                            ))}

                        </div>

                    )}

                    {/* Stores */}

                    {results?.stores?.length > 0 && (

                        <div>

                            <div className="px-5 pt-4 pb-2 text-xs uppercase tracking-wider text-slate-500">
                                Stores
                            </div>

                            {results.stores.map((store) => (

                                <button
                                    key={store.id}
                                    type="button"
                                    onClick={() => onStoreClick(store.username)}
                                    className="
                  flex
                  items-center
                  justify-between

                  px-5
                  py-3

                  hover:bg-slate-800
                  transition
                  "
                                >

                                    <div className="flex items-center gap-3">

                                        <Store
                                            size={16}
                                            className="text-green-400"
                                        />

                                        <span className="text-white">
                                            {store.name}
                                        </span>

                                    </div>

                                    <ArrowUpRight
                                        size={15}
                                        className="text-slate-500"
                                    />

                                </button>

                            ))}

                        </div>

                    )}

                    {!results?.products?.length &&
                        !results?.categories?.length &&
                        !results?.stores?.length &&
                        !results?.suggestions?.length && (

                            <div className="p-6 text-center text-slate-500">
                                No results found
                            </div>

                        )}

                </>
            )}
        </div>
    );
}