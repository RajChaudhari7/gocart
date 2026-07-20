"use client";

import {
    CalendarDays,
    Check,
    ChevronDown,
    Filter,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Star,
} from "lucide-react";

import {
    SORT_OPTIONS,
    STOCK_FILTERS,
    TIME_FILTERS,
} from "./constants";

export default function AnalyticsFilters({
    filters,
    categories = [],
    onChange,
    onReset,
    loading = false,
}) {
    const handleChange = (field, value) => {
        onChange?.({
            ...filters,
            [field]: value,
        });
    };

    const hasActiveFilters =
        filters.search ||
        filters.category !== "all" ||
        filters.sort !== "bestSelling" ||
        filters.stock !== "all" ||
        filters.featured;

    return (
        <section
            className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-slate-800
                bg-gradient-to-br
                from-slate-900
                via-slate-900
                to-slate-950
                p-5
                shadow-xl
                shadow-black/20
                md:p-6
            "
        >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-violet-300">
                            <SlidersHorizontal className="h-4 w-4" />
                            Analytics Filters
                        </div>

                        <h2 className="mt-2 text-xl font-black text-white">
                            Refine product performance
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Filter analytics by date,
                            product, category and inventory
                            status.
                        </p>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={loading}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-950/40
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-slate-300
                                transition
                                hover:border-violet-500/40
                                hover:text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* Time range */}

                <div className="mt-6">
                    <div className="mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-500" />

                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            Date Range
                        </p>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {TIME_FILTERS.map((option) => {
                            const isActive =
                                filters.range ===
                                option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        handleChange(
                                            "range",
                                            option.value
                                        )
                                    }
                                    className={`
                                        shrink-0
                                        rounded-xl
                                        border
                                        px-3.5
                                        py-2
                                        text-xs
                                        font-bold
                                        transition
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                        ${isActive
                                            ? "border-violet-400/40 bg-violet-500/15 text-violet-200 shadow-lg shadow-violet-500/10"
                                            : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-white"
                                        }
                                    `}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Other filters */}

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(3,minmax(170px,0.8fr))_auto]">
                    <SearchInput
                        value={filters.search}
                        disabled={loading}
                        onChange={(value) =>
                            handleChange(
                                "search",
                                value
                            )
                        }
                    />

                    <FilterSelect
                        label="Category"
                        icon={Filter}
                        value={filters.category}
                        disabled={loading}
                        onChange={(value) =>
                            handleChange(
                                "category",
                                value
                            )
                        }
                        options={[
                            {
                                label: "All Categories",
                                value: "all",
                            },
                            ...categories.map(
                                (category) => ({
                                    label: category,
                                    value: category,
                                })
                            ),
                        ]}
                    />

                    <FilterSelect
                        label="Sort By"
                        icon={SlidersHorizontal}
                        value={filters.sort}
                        disabled={loading}
                        onChange={(value) =>
                            handleChange(
                                "sort",
                                value
                            )
                        }
                        options={SORT_OPTIONS}
                    />

                    <FilterSelect
                        label="Stock"
                        icon={Filter}
                        value={filters.stock}
                        disabled={loading}
                        onChange={(value) =>
                            handleChange(
                                "stock",
                                value
                            )
                        }
                        options={STOCK_FILTERS}
                    />

                    <FeaturedToggle
                        checked={filters.featured}
                        disabled={loading}
                        onChange={(checked) =>
                            handleChange(
                                "featured",
                                checked
                            )
                        }
                    />
                </div>
            </div>
        </section>
    );
}

function SearchInput({
    value,
    onChange,
    disabled,
}) {
    return (
        <label className="relative block">
            <Search
                className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-500
                "
            />

            <input
                type="search"
                value={value}
                disabled={disabled}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder="Search products..."
                className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950/50
                    pl-11
                    pr-4
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-slate-600
                    focus:border-violet-500/50
                    focus:ring-4
                    focus:ring-violet-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            />
        </label>
    );
}

function FilterSelect({
    label,
    icon: Icon,
    value,
    options,
    onChange,
    disabled,
}) {
    return (
        <label className="relative block">
            <Icon
                className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    z-10
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-500
                "
            />

            <select
                aria-label={label}
                value={value}
                disabled={disabled}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="
                    h-12
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950/50
                    pl-11
                    pr-10
                    text-sm
                    font-medium
                    text-slate-300
                    outline-none
                    transition
                    focus:border-violet-500/50
                    focus:ring-4
                    focus:ring-violet-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className="bg-slate-950 text-white"
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            <ChevronDown
                className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-500
                "
            />
        </label>
    );
}

function FeaturedToggle({
    checked,
    onChange,
    disabled,
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            aria-pressed={checked}
            onClick={() => onChange(!checked)}
            className={`
                flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-4
                text-sm
                font-bold
                transition
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${checked
                    ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-white"
                }
            `}
        >
            {checked ? (
                <Check className="h-4 w-4" />
            ) : (
                <Star className="h-4 w-4" />
            )}

            Featured
        </button>
    );
}