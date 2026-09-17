"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  Sparkles,
  Circle,
  Loader2,
} from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf5]">

      {/* =================================================
          AMBIENT BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute inset-0">

        {/* Main warm glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.45, 0.65, 0.45],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/40 blur-[90px] sm:h-[420px] sm:w-[420px]"
        />

        {/* Top glow */}
        <motion.div
          animate={{
            x: [0, 35, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-200/30 blur-[80px]"
        />

        {/* Bottom glow */}
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-100/40 blur-[90px]"
        />
      </div>

      {/* =================================================
          FLOATING DECORATIONS
      ================================================= */}

      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[18%] top-[28%] hidden sm:block"
      >
        <Circle
          size={9}
          className="fill-orange-300 text-orange-300"
        />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 14, 0],
          x: [0, 8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[20%] top-[32%] hidden sm:block"
      >
        <Circle
          size={7}
          className="fill-emerald-300 text-emerald-300"
        />
      </motion.div>

      <motion.div
        animate={{
          y: [0, -10, 0],
          x: [0, -8, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[28%] left-[25%] hidden sm:block"
      >
        <Sparkles
          size={18}
          className="text-orange-300"
        />
      </motion.div>

      {/* =================================================
          MAIN LOADER
      ================================================= */}

      <div className="relative flex flex-col items-center">

        {/* Animated orbit */}
        <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">

          {/* Outer rotating dotted ring */}

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border border-dashed border-orange-200"
          />

          {/* Second ring */}

          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-3 rounded-full border border-slate-200"
          />

          {/* Orbiting dot */}

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0"
          >
            <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.45)]" />
          </motion.div>

          {/* =================================================
              CENTER SHOPPING BAG
          ================================================= */}

          <motion.div
            animate={{
              y: [0, -5, 0],
              rotate: [0, -2, 2, 0],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.10)] ring-1 ring-slate-100 sm:h-22 sm:w-22"
          >
            {/* Soft orange circle */}

            <motion.div
              animate={{
                scale: [0.9, 1.08, 0.9],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-12 w-12 rounded-full bg-orange-50"
            />

            <ShoppingBag
              size={32}
              strokeWidth={1.9}
              className="relative z-10 text-orange-500"
            />
          </motion.div>
        </div>

        {/* =================================================
            TEXT
        ================================================= */}

        <div className="mt-8 text-center">

          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center gap-2"
          >
            <span className="text-base font-black tracking-tight text-slate-900 sm:text-lg">
              Getting things ready
            </span>

            <motion.span
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex gap-1"
            >
              <span className="h-1 w-1 rounded-full bg-orange-500" />
              <span className="h-1 w-1 rounded-full bg-orange-500" />
              <span className="h-1 w-1 rounded-full bg-orange-500" />
            </motion.span>
          </motion.div>

          <p className="mt-2 text-xs font-medium text-slate-400 sm:text-sm">
            Just a moment...
          </p>
        </div>

        {/* =================================================
            SMALL PROGRESS LINE
        ================================================= */}

        <div className="mt-6 h-1 w-36 overflow-hidden rounded-full bg-slate-100 sm:w-44">
          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 rounded-full bg-orange-400"
          />
        </div>

        {/* Brand hint */}

        <motion.p
          animate={{
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300"
        >
          Nandurbar Bazar
        </motion.p>
      </div>
    </div>
  );
}