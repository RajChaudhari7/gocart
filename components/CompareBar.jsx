"use client";

import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCompare,
  clearCompare,
} from "@/lib/features/compare/compareSlice";

export default function CompareBar() {
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.compare.products
  );

  if (products.length < 2) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-5xl">

      <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/20 p-5">

        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">

          {/* Left */}

          <div>

            <p className="text-white font-bold text-lg">

              Compare Products

            </p>

            <p className="text-slate-400 text-sm">

              {products.length} products selected

            </p>

          </div>

          {/* Selected */}

          <div className="flex gap-3 overflow-x-auto">

            {products.map((product) => (

              <div
                key={product.id}
                className="relative flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2"
              >

                <img
                  src={product.images?.[0]}
                  className="w-12 h-12 rounded-lg object-cover"
                />

                <div>

                  <p className="text-white text-sm font-semibold line-clamp-1 w-28">

                    {product.name}

                  </p>

                  <p className="text-cyan-400 text-xs">

                    ₹{product.price}

                  </p>

                </div>

                <button
                  onClick={() =>
                    dispatch(removeFromCompare(product.id))
                  }
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                >

                  <X size={14} />

                </button>

              </div>

            ))}

          </div>

          {/* Buttons */}

          <div className="flex gap-3">

            <button
              onClick={() => dispatch(clearCompare())}
              className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900"
            >
              Clear
            </button>

            <Link
              href="/compare"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-400"
            >

              <Scale size={18} />

              Compare AI

            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}