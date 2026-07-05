"use client";

import { motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}) {
    if (totalPages <= 1) return null;

    const generatePages = () => {
        const pages = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("...");

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-12">

            {/* First Page */}

            <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
                className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
                <ChevronsLeft size={18} className="mx-auto" />
            </motion.button>

            {/* Previous */}

            <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
                <ChevronLeft size={18} className="mx-auto" />
            </motion.button>

            {generatePages().map((page, index) =>
                page === "..." ? (
                    <span
                        key={index}
                        className="px-3 text-slate-500"
                    >
                        ...
                    </span>
                ) : (
                    <motion.button
                        key={page}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.08 }}
                        onClick={() => onPageChange(page)}
                        className={`
              h-10
              w-10
              rounded-xl
              font-semibold
              transition-all
              ${currentPage === page
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                : "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                            }
            `}
                    >
                        {page}
                    </motion.button>
                )
            )}

            {/* Next */}

            <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
                <ChevronRight size={18} className="mx-auto" />
            </motion.button>

            {/* Last */}

            <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
                className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition"
            >
                <ChevronsRight size={18} className="mx-auto" />
            </motion.button>

        </div>
    );
}