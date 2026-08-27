"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Make sure values are always numbers
  const current = Number(currentPage);
  const total = Number(totalPages);

  if (!Number.isFinite(total) || total <= 1) {
    return null;
  }

  // ==================================================
  // GENERATE PAGE NUMBERS
  // ==================================================

  const generatePages = () => {
    // Small number of pages → show everything
    if (total <= 7) {
      return Array.from(
        {
          length: total,
        },
        (_, index) => ({
          type: "page",
          value: index + 1,
          key: `page-${index + 1}`,
        }),
      );
    }

    const pages = [];

    // Always show first page
    pages.push({
      type: "page",
      value: 1,
      key: "page-1",
    });

    // ==================================================
    // NEAR START
    // 1 2 3 4 ... 9
    // ==================================================

    if (current <= 3) {
      for (let page = 2; page <= 4; page++) {
        pages.push({
          type: "page",
          value: page,
          key: `page-${page}`,
        });
      }

      pages.push({
        type: "ellipsis",
        key: "ellipsis-right",
      });
    }

    // ==================================================
    // NEAR END
    // 1 ... 6 7 8 9
    // ==================================================
    else if (current >= total - 2) {
      pages.push({
        type: "ellipsis",
        key: "ellipsis-left",
      });

      for (let page = total - 3; page < total; page++) {
        pages.push({
          type: "page",
          value: page,
          key: `page-${page}`,
        });
      }
    }

    // ==================================================
    // MIDDLE
    // 1 ... 4 5 6 ... 9
    // ==================================================
    else {
      pages.push({
        type: "ellipsis",
        key: "ellipsis-left",
      });

      for (let page = current - 1; page <= current + 1; page++) {
        pages.push({
          type: "page",
          value: page,
          key: `page-${page}`,
        });
      }

      pages.push({
        type: "ellipsis",
        key: "ellipsis-right",
      });
    }

    // Always show last page
    pages.push({
      type: "page",
      value: total,
      key: `page-${total}`,
    });

    return pages;
  };

  const pages = generatePages();

  // ==================================================
  // SAFE PAGE CHANGE
  // ==================================================

  const changePage = (page) => {
    const nextPage = Number(page);

    if (
      !Number.isFinite(nextPage) ||
      nextPage < 1 ||
      nextPage > total ||
      nextPage === current
    ) {
      return;
    }

    onPageChange(nextPage);

    // Optional:
    // move user slightly upward when page changes
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {/* ======================================== */}
      {/* FIRST PAGE */}
      {/* ======================================== */}

      <motion.button
        type="button"
        whileTap={
          current === 1
            ? undefined
            : {
                scale: 0.9,
              }
        }
        whileHover={
          current === 1
            ? undefined
            : {
                scale: 1.05,
              }
        }
        disabled={current === 1}
        onClick={() => changePage(1)}
        aria-label="First page"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          text-slate-300
          transition
          hover:bg-slate-800
          disabled:cursor-not-allowed
          disabled:opacity-30
          disabled:hover:bg-slate-900
        "
      >
        <ChevronsLeft size={18} />
      </motion.button>

      {/* ======================================== */}
      {/* PREVIOUS */}
      {/* ======================================== */}

      <motion.button
        type="button"
        whileTap={
          current === 1
            ? undefined
            : {
                scale: 0.9,
              }
        }
        whileHover={
          current === 1
            ? undefined
            : {
                scale: 1.05,
              }
        }
        disabled={current === 1}
        onClick={() => changePage(current - 1)}
        aria-label="Previous page"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          text-slate-300
          transition
          hover:bg-slate-800
          disabled:cursor-not-allowed
          disabled:opacity-30
          disabled:hover:bg-slate-900
        "
      >
        <ChevronLeft size={18} />
      </motion.button>

      {/* ======================================== */}
      {/* PAGE NUMBERS */}
      {/* ======================================== */}

      {pages.map((item) => {
        if (item.type === "ellipsis") {
          return (
            <span
              key={item.key}
              className="flex h-10 min-w-7 items-center justify-center px-1 text-slate-500"
            >
              ...
            </span>
          );
        }

        const page = item.value;

        const active = current === page;

        return (
          <motion.button
            key={item.key}
            type="button"
            whileTap={{
              scale: 0.9,
            }}
            whileHover={{
              scale: 1.08,
            }}
            onClick={() => changePage(page)}
            aria-label={`Page ${page}`}
            aria-current={active ? "page" : undefined}
            className={`
              flex
              h-10
              min-w-10
              items-center
              justify-center
              rounded-xl
              px-2
              font-semibold
              transition-all

              ${
                active
                  ? `
                    bg-indigo-600
                    text-white
                    shadow-lg
                    shadow-indigo-500/30
                  `
                  : `
                    border
                    border-slate-700
                    bg-slate-900
                    text-slate-300
                    hover:border-slate-600
                    hover:bg-slate-800
                    hover:text-white
                  `
              }
            `}
          >
            {page}
          </motion.button>
        );
      })}

      {/* ======================================== */}
      {/* NEXT */}
      {/* ======================================== */}

      <motion.button
        type="button"
        whileTap={
          current === total
            ? undefined
            : {
                scale: 0.9,
              }
        }
        whileHover={
          current === total
            ? undefined
            : {
                scale: 1.05,
              }
        }
        disabled={current === total}
        onClick={() => changePage(current + 1)}
        aria-label="Next page"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          text-slate-300
          transition
          hover:bg-slate-800
          disabled:cursor-not-allowed
          disabled:opacity-30
          disabled:hover:bg-slate-900
        "
      >
        <ChevronRight size={18} />
      </motion.button>

      {/* ======================================== */}
      {/* LAST PAGE */}
      {/* ======================================== */}

      <motion.button
        type="button"
        whileTap={
          current === total
            ? undefined
            : {
                scale: 0.9,
              }
        }
        whileHover={
          current === total
            ? undefined
            : {
                scale: 1.05,
              }
        }
        disabled={current === total}
        onClick={() => changePage(total)}
        aria-label="Last page"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          text-slate-300
          transition
          hover:bg-slate-800
          disabled:cursor-not-allowed
          disabled:opacity-30
          disabled:hover:bg-slate-900
        "
      >
        <ChevronsRight size={18} />
      </motion.button>
    </div>
  );
}
