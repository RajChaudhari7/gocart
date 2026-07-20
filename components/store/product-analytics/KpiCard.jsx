"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function KpiCard({
    title,
    description,
    value,
    icon: Icon,
    iconBackground,
    iconShadow,
    glow,
    suffix,
    index = 0,
}) {
    return (
        <motion.article
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
            }}
            whileHover={{
                y: -5,
            }}
            className="
                group
                relative
                min-h-[205px]
                overflow-hidden
                rounded-3xl
                border
                border-slate-800
                bg-gradient-to-br
                from-slate-900
                via-slate-900
                to-slate-950
                p-6
                shadow-xl
                shadow-black/20
                transition-colors
                duration-300
                hover:border-slate-700
            "
        >
            {/* Background glow */}

            <div
                className={`
                    pointer-events-none
                    absolute
                    -right-16
                    -top-16
                    h-44
                    w-44
                    rounded-full
                    blur-3xl
                    transition-transform
                    duration-500
                    group-hover:scale-125
                    ${glow || ""}
                `}
            />

            <div className="relative flex items-start justify-between gap-4">
                {/* Icon */}

                <div
                    className={`
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        shadow-lg
                        ${iconBackground || ""}
                        ${iconShadow || ""}
                    `}
                >
                    {Icon && (
                        <Icon
                            size={25}
                            className="text-white"
                        />
                    )}
                </div>

                {/* Live badge */}

                <div
                    className="
                        flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-emerald-500/20
                        bg-emerald-500/10
                        px-2.5
                        py-1
                        text-xs
                        font-bold
                        text-emerald-300
                    "
                >
                    <TrendingUp size={13} />

                    Live
                </div>
            </div>

            <div className="relative mt-7">
                {/* Value */}

                <div className="flex items-end gap-1.5">
                    <p className="text-3xl font-black tracking-tight text-white md:text-4xl">
                        {value ?? 0}
                    </p>

                    {suffix && (
                        <span className="mb-1 text-sm font-bold text-slate-400">
                            {suffix}
                        </span>
                    )}
                </div>

                {/* Title */}

                <h2 className="mt-3 text-sm font-bold text-slate-100">
                    {title}
                </h2>

                {/* Description */}

                <p className="mt-1 text-xs leading-5 text-slate-400">
                    {description}
                </p>
            </div>
        </motion.article>
    );
}