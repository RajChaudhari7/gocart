"use client";

import { BarChart3, RefreshCw } from "lucide-react";

export default function PageHeader({
    refreshing,
    onRefresh,
}) {
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
                p-6
                shadow-2xl
                shadow-black/20
                md:p-8
            "
        >
            {/* Background Glow */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

            <div
                className="
                    relative
                    flex
                    flex-col
                    gap-6
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >
                {/* Left */}

                <div className="flex items-start gap-4">
                    <div
                        className="
                            flex
                            h-14
                            w-14
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-violet-500
                            to-indigo-600
                            shadow-lg
                            shadow-violet-500/20
                        "
                    >
                        <BarChart3
                            size={27}
                            className="text-white"
                        />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                                Product Analytics
                            </h1>

                            <span
                                className="
                                    rounded-full
                                    border
                                    border-emerald-500/20
                                    bg-emerald-500/10
                                    px-3
                                    py-1
                                    text-xs
                                    font-bold
                                    text-emerald-300
                                "
                            >
                                Live Performance
                            </span>
                        </div>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                            Track product performance,
                            customer engagement,
                            inventory and seller earnings
                            from one centralized dashboard.
                        </p>
                    </div>
                </div>

                {/* Right */}

                <button
                    type="button"
                    disabled={refreshing}
                    onClick={onRefresh}
                    className="
                        flex
                        w-fit
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-700
                        bg-slate-800
                        px-4
                        py-2.5
                        text-sm
                        font-bold
                        text-white
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:border-slate-600
                        hover:bg-slate-700
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh Data"}
                </button>
            </div>
        </section>
    );
}