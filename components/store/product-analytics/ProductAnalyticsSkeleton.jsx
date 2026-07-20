"use client";

export default function ProductAnalyticsSkeleton() {
    return (
        <main className="min-h-screen bg-[#020617] p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-8 animate-pulse">

                {/* Header */}

                <div className="h-52 rounded-3xl bg-slate-900 border border-slate-800" />

                {/* KPI Cards */}

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-52 rounded-3xl bg-slate-900 border border-slate-800"
                        />
                    ))}
                </div>

                {/* Insight Cards */}

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-44 rounded-3xl bg-slate-900 border border-slate-800"
                        />
                    ))}
                </div>

                {/* Two Charts */}

                <div className="grid gap-6 xl:grid-cols-2">
                    <div className="h-[420px] rounded-3xl bg-slate-900 border border-slate-800" />

                    <div className="h-[420px] rounded-3xl bg-slate-900 border border-slate-800" />
                </div>

                {/* Top Product Sales */}

                <div className="h-[460px] rounded-3xl bg-slate-900 border border-slate-800" />

                {/* Monthly Sales */}

                <div className="h-[460px] rounded-3xl bg-slate-900 border border-slate-800" />

                {/* Top Products Table */}

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                    <div className="mb-6 h-8 w-64 rounded-lg bg-slate-800" />

                    <div className="space-y-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-14 rounded-xl bg-slate-800"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}