"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    BadgeIndianRupee,
    Box,
    Crown,
    Eye,
    Package,
    Search,
    ShoppingBag,
    Sparkles,
    Star,
    Trophy,
} from "lucide-react";

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(
        Number(value || 0)
    );

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const getStockDetails = (stock) => {
    const quantity = Number(stock || 0);

    if (quantity <= 0) {
        return {
            label: "Out of Stock",
            className:
                "border-red-500/20 bg-red-500/10 text-red-300",
            dotClassName: "bg-red-400",
        };
    }

    if (quantity < 10) {
        return {
            label: "Low Stock",
            className:
                "border-amber-500/20 bg-amber-500/10 text-amber-300",
            dotClassName: "bg-amber-400",
        };
    }

    return {
        label: "In Stock",
        className:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        dotClassName: "bg-emerald-400",
    };
};

const getRankStyle = (rank) => {
    if (rank === 1) {
        return {
            container:
                "border-amber-400/30 bg-amber-400/10 text-amber-300",
            icon: Crown,
        };
    }

    if (rank === 2) {
        return {
            container:
                "border-slate-300/20 bg-slate-300/10 text-slate-200",
            icon: Trophy,
        };
    }

    if (rank === 3) {
        return {
            container:
                "border-orange-500/20 bg-orange-500/10 text-orange-300",
            icon: Trophy,
        };
    }

    return {
        container:
            "border-slate-700 bg-slate-800 text-slate-300",
        icon: null,
    };
};

const sortableColumns = [
    { key: "rank", label: "Rank" },
    { key: "name", label: "Product" },
    { key: "views", label: "Views" },
    { key: "sold", label: "Sold" },
    { key: "rating", label: "Rating" },
    { key: "stock", label: "Stock" },
    {
        key: "grossRevenue",
        label: "Gross Revenue",
    },
    {
        key: "commission",
        label: "Commission",
    },
    {
        key: "sellerEarnings",
        label: "Seller Earnings",
    },
];

export default function TopProductsTable({
    products = [],
}) {
    const [searchQuery, setSearchQuery] =
        useState("");

    const [sortConfig, setSortConfig] =
        useState({
            key: "rank",
            direction: "asc",
        });

    const normalizedProducts = useMemo(
        () =>
            products.map((product, index) => ({
                rank: Number(
                    product.rank ?? index + 1
                ),

                id:
                    product.id ||
                    `${product.name}-${index}`,

                name:
                    product.name ||
                    "Unnamed Product",

                image: product.image || null,

                category:
                    product.category ||
                    "Uncategorized",

                sold: Number(product.sold || 0),

                views: Number(
                    product.views || 0
                ),

                stock: Number(
                    product.stock || 0
                ),

                rating: Number(
                    product.rating || 0
                ),

                price: Number(
                    product.price || 0
                ),

                mrp: Number(
                    product.mrp || 0
                ),

                featured: Boolean(
                    product.featured
                ),

                grossRevenue: Number(
                    product.grossRevenue || 0
                ),

                commission: Number(
                    product.commission || 0
                ),

                sellerEarnings: Number(
                    product.sellerEarnings || 0
                ),
            })),
        [products]
    );

    const filteredAndSortedProducts =
        useMemo(() => {
            const query = searchQuery
                .trim()
                .toLowerCase();

            const filtered =
                normalizedProducts.filter(
                    (product) =>
                        product.name
                            .toLowerCase()
                            .includes(query) ||
                        product.category
                            .toLowerCase()
                            .includes(query)
                );

            return [...filtered].sort(
                (first, second) => {
                    const firstValue =
                        first[sortConfig.key];

                    const secondValue =
                        second[sortConfig.key];

                    if (
                        typeof firstValue ===
                        "string" &&
                        typeof secondValue ===
                        "string"
                    ) {
                        const result =
                            firstValue.localeCompare(
                                secondValue
                            );

                        return sortConfig.direction ===
                            "asc"
                            ? result
                            : -result;
                    }

                    const result =
                        Number(firstValue || 0) -
                        Number(secondValue || 0);

                    return sortConfig.direction ===
                        "asc"
                        ? result
                        : -result;
                }
            );
        }, [
            normalizedProducts,
            searchQuery,
            sortConfig,
        ]);

    const handleSort = (key) => {
        setSortConfig((current) => ({
            key,
            direction:
                current.key === key &&
                    current.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    if (!normalizedProducts.length) {
        return <EmptyProductsState />;
    }

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl shadow-black/20">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative border-b border-slate-800 p-5 md:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                            <Trophy
                                size={22}
                                className="text-amber-400"
                            />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-xl font-black text-white">
                                    Top Products
                                </h2>

                                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                                    Top 10
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-400">
                                Review product sales,
                                engagement, inventory
                                and earnings.
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search product or category..."
                            className="h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
                        />
                    </div>
                </div>
            </div>

            {/* Desktop table */}

            <div className="relative hidden overflow-x-auto lg:block">
                <table className="min-w-[1450px] w-full">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/40">
                            {sortableColumns.map(
                                (column) => (
                                    <SortableHeader
                                        key={
                                            column.key
                                        }
                                        column={
                                            column
                                        }
                                        sortConfig={
                                            sortConfig
                                        }
                                        onSort={
                                            handleSort
                                        }
                                    />
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAndSortedProducts.map(
                            (product) => (
                                <ProductTableRow
                                    key={product.id}
                                    product={
                                        product
                                    }
                                />
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile and tablet cards */}

            <div className="relative space-y-4 p-4 lg:hidden">
                {filteredAndSortedProducts.map(
                    (product) => (
                        <ProductMobileCard
                            key={product.id}
                            product={product}
                        />
                    )
                )}
            </div>

            {!filteredAndSortedProducts.length && (
                <div className="relative flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                    <Search
                        size={34}
                        className="text-slate-600"
                    />

                    <h3 className="mt-4 font-bold text-white">
                        No matching products
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                        Try searching with another
                        product name or category.
                    </p>
                </div>
            )}
        </section>
    );
}

function SortableHeader({
    column,
    sortConfig,
    onSort,
}) {
    const isActive =
        sortConfig.key === column.key;

    return (
        <th
            scope="col"
            className="whitespace-nowrap px-4 py-4 text-left"
        >
            <button
                type="button"
                onClick={() =>
                    onSort(column.key)
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
            >
                {column.label}

                {!isActive ? (
                    <ArrowUpDown size={13} />
                ) : sortConfig.direction ===
                    "asc" ? (
                    <ArrowUp
                        size={13}
                        className="text-violet-400"
                    />
                ) : (
                    <ArrowDown
                        size={13}
                        className="text-violet-400"
                    />
                )}
            </button>
        </th>
    );
}

function ProductTableRow({ product }) {
    const stockDetails = getStockDetails(
        product.stock
    );

    return (
        <tr className="border-b border-slate-800/80 transition hover:bg-slate-800/30">
            <td className="px-4 py-4">
                <RankBadge rank={product.rank} />
            </td>

            <td className="px-4 py-4">
                <ProductIdentity product={product} />
            </td>

            <td className="px-4 py-4">
                <MetricValue
                    icon={Eye}
                    value={formatNumber(
                        product.views
                    )}
                    iconClassName="text-violet-400"
                />
            </td>

            <td className="px-4 py-4">
                <MetricValue
                    icon={ShoppingBag}
                    value={formatNumber(
                        product.sold
                    )}
                    iconClassName="text-emerald-400"
                />
            </td>

            <td className="px-4 py-4">
                <div className="flex items-center gap-1.5">
                    <Star
                        size={16}
                        className="fill-amber-400 text-amber-400"
                    />

                    <span className="font-bold text-white">
                        {product.rating.toFixed(
                            1
                        )}
                    </span>

                    <span className="text-xs text-slate-500">
                        /5
                    </span>
                </div>
            </td>

            <td className="px-4 py-4">
                <div className="space-y-1.5">
                    <p className="font-bold text-white">
                        {formatNumber(
                            product.stock
                        )}
                    </p>

                    <StockBadge
                        details={stockDetails}
                    />
                </div>
            </td>

            <td className="px-4 py-4">
                <CurrencyValue
                    value={
                        product.grossRevenue
                    }
                    className="text-blue-300"
                />
            </td>

            <td className="px-4 py-4">
                <CurrencyValue
                    value={
                        product.commission
                    }
                    className="text-amber-300"
                />
            </td>

            <td className="px-4 py-4">
                <CurrencyValue
                    value={
                        product.sellerEarnings
                    }
                    className="text-emerald-300"
                />
            </td>
        </tr>
    );
}

function ProductMobileCard({ product }) {
    const stockDetails = getStockDetails(
        product.stock
    );

    return (
        <article className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-start gap-3">
                <RankBadge rank={product.rank} />

                <ProductIdentity
                    product={product}
                    compact
                />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <MobileMetric
                    label="Views"
                    value={formatNumber(
                        product.views
                    )}
                    icon={Eye}
                />

                <MobileMetric
                    label="Units Sold"
                    value={formatNumber(
                        product.sold
                    )}
                    icon={ShoppingBag}
                />

                <MobileMetric
                    label="Rating"
                    value={`${product.rating.toFixed(
                        1
                    )}/5`}
                    icon={Star}
                />

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                    <p className="text-xs text-slate-500">
                        Stock
                    </p>

                    <p className="mt-1 font-bold text-white">
                        {formatNumber(
                            product.stock
                        )}
                    </p>

                    <div className="mt-2">
                        <StockBadge
                            details={
                                stockDetails
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                <FinancialRow
                    label="Gross Revenue"
                    value={
                        product.grossRevenue
                    }
                    className="text-blue-300"
                />

                <FinancialRow
                    label="Commission"
                    value={
                        product.commission
                    }
                    className="text-amber-300"
                />

                <FinancialRow
                    label="Seller Earnings"
                    value={
                        product.sellerEarnings
                    }
                    className="text-emerald-300"
                />
            </div>
        </article>
    );
}

function ProductIdentity({
    product,
    compact = false,
}) {
    return (
        <div className="flex min-w-[260px] items-center gap-3">
            <div
                className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 ${compact
                        ? "h-14 w-14"
                        : "h-16 w-16"
                    }`}
            >
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package
                            size={24}
                            className="text-slate-500"
                        />
                    </div>
                )}
            </div>

            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="max-w-[220px] truncate font-bold text-white">
                        {product.name}
                    </p>

                    {product.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                            <Sparkles size={10} />
                            Featured
                        </span>
                    )}
                </div>

                <p className="mt-1 text-xs text-slate-500">
                    {product.category}
                </p>

                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                        {formatCurrency(
                            product.price
                        )}
                    </span>

                    {product.mrp >
                        product.price && (
                            <span className="text-xs text-slate-500 line-through">
                                {formatCurrency(
                                    product.mrp
                                )}
                            </span>
                        )}
                </div>
            </div>
        </div>
    );
}

function RankBadge({ rank }) {
    const rankStyle = getRankStyle(rank);
    const RankIcon = rankStyle.icon;

    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${rankStyle.container}`}
        >
            {RankIcon && rank <= 3 ? (
                <RankIcon size={17} />
            ) : (
                `#${rank}`
            )}
        </div>
    );
}

function StockBadge({ details }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold ${details.className}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${details.dotClassName}`}
            />

            {details.label}
        </span>
    );
}

function MetricValue({
    icon: Icon,
    value,
    iconClassName,
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon
                size={16}
                className={iconClassName}
            />

            <span className="font-bold text-white">
                {value}
            </span>
        </div>
    );
}

function CurrencyValue({
    value,
    className,
}) {
    return (
        <div className="flex items-center gap-1">
            <BadgeIndianRupee
                size={15}
                className={className}
            />

            <span
                className={`font-bold ${className}`}
            >
                {formatCurrency(value)}
            </span>
        </div>
    );
}

function MobileMetric({
    label,
    value,
    icon: Icon,
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icon size={14} />
                {label}
            </div>

            <p className="mt-2 font-bold text-white">
                {value}
            </p>
        </div>
    );
}

function FinancialRow({
    label,
    value,
    className,
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-400">
                {label}
            </span>

            <span
                className={`font-bold ${className}`}
            >
                {formatCurrency(value)}
            </span>
        </div>
    );
}

function EmptyProductsState() {
    return (
        <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/10">
                <Box
                    size={36}
                    className="text-violet-400"
                />
            </div>

            <h2 className="mt-6 text-xl font-black text-white">
                No product analytics yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Your top-performing products will
                appear here after customers start
                viewing and purchasing products.
            </p>
        </section>
    );
}