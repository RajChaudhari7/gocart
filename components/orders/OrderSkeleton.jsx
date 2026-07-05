"use client";

export default function OrderSkeleton({ count = 5 }) {
    return (
        <div className="space-y-6">
            {[...Array(count)].map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">

                        {/* Product Image */}
                        <div className="h-24 w-24 rounded-2xl bg-slate-800"></div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-4">

                            <div className="h-5 w-64 rounded bg-slate-800"></div>

                            <div className="h-4 w-32 rounded bg-slate-800"></div>

                            <div className="h-4 w-48 rounded bg-slate-800"></div>

                            <div className="flex gap-3 mt-2">
                                <div className="h-8 w-24 rounded-lg bg-slate-800"></div>
                                <div className="h-8 w-24 rounded-lg bg-slate-800"></div>
                            </div>

                        </div>

                        {/* Price */}
                        <div className="space-y-3">
                            <div className="h-6 w-24 rounded bg-slate-800"></div>
                            <div className="h-10 w-28 rounded-xl bg-slate-800"></div>
                        </div>

                    </div>

                    {/* Progress */}
                    <div className="mt-8">

                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

                            <div className="h-full w-2/3 rounded-full bg-slate-700"></div>

                        </div>

                    </div>

                </div>
            ))}
        </div>
    );
}