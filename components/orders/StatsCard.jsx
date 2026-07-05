"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function StatsCard({
    title,
    value,
    icon: Icon,
    color = "indigo",
    subtitle,
}) {
    const colors = {
        indigo: {
            bg: "from-indigo-500/20 to-indigo-600/5",
            border: "border-indigo-500/30",
            icon: "bg-indigo-500/20 text-indigo-400",
            text: "text-indigo-400",
            glow: "shadow-indigo-500/20",
        },

        emerald: {
            bg: "from-emerald-500/20 to-emerald-600/5",
            border: "border-emerald-500/30",
            icon: "bg-emerald-500/20 text-emerald-400",
            text: "text-emerald-400",
            glow: "shadow-emerald-500/20",
        },

        amber: {
            bg: "from-amber-500/20 to-amber-600/5",
            border: "border-amber-500/30",
            icon: "bg-amber-500/20 text-amber-400",
            text: "text-amber-400",
            glow: "shadow-amber-500/20",
        },

        rose: {
            bg: "from-rose-500/20 to-rose-600/5",
            border: "border-rose-500/30",
            icon: "bg-rose-500/20 text-rose-400",
            text: "text-rose-400",
            glow: "shadow-rose-500/20",
        },
    };

    const c = colors[color];

    return (
        <motion.div
            whileHover={{
                y: -6,
                scale: 1.02,
            }}
            transition={{
                type: "spring",
                stiffness: 250,
            }}
            className={`
      relative overflow-hidden
      rounded-3xl
      border
      ${c.border}
      bg-gradient-to-br
      ${c.bg}
      backdrop-blur-xl
      p-6
      shadow-xl
      ${c.glow}
      `}
        >
            {/* Background Circle */}

            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400 font-medium">
                        {title}
                    </p>

                    <h2 className="mt-2 text-4xl font-bold text-white">
                        {value}
                    </h2>

                    {subtitle && (
                        <div className="mt-3 flex items-center gap-2">
                            <TrendingUp
                                size={15}
                                className={c.text}
                            />

                            <span
                                className={`text-xs font-medium ${c.text}`}
                            >
                                {subtitle}
                            </span>
                        </div>
                    )}
                </div>

                <div
                    className={`
          h-14
          w-14
          rounded-2xl
          flex
          items-center
          justify-center
          ${c.icon}
          `}
                >
                    <Icon size={28} />
                </div>
            </div>
        </motion.div>
    );
}