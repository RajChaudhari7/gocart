"use client";

import {
    Sparkles,
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    Star,
    RefreshCcw
} from "lucide-react";

const Section = ({ title, icon: Icon, color, items }) => {
    if (!items?.length) return null;

    return (
        <div className="space-y-3">

            <div className="flex items-center gap-2">

                <Icon
                    className={color}
                    size={18}
                />

                <h3 className="font-semibold text-white">
                    {title}
                </h3>

            </div>

            <ul className="space-y-2">

                {items.map((item, index) => (

                    <li
                        key={index}
                        className="flex gap-3 text-sm text-slate-300"
                    >

                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        <span>{item}</span>

                    </li>

                ))}

            </ul>

        </div>
    );
};

export default function AIReviewSummary({

    aiSummary,
    loading,
    onGenerate,
    summaryLanguage,
    setSummaryLanguage

}) {

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            {/* Header */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <Sparkles
                            className="text-yellow-400"
                            size={24}
                        />

                        <div>

                            <h2 className="text-2xl font-bold text-white">
                                AI Review Summary
                            </h2>

                            <p className="text-sm text-slate-400">
                                Personalized business insights powered by AI
                            </p>

                        </div>

                    </div>

                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                    <select
                        value={summaryLanguage}
                        onChange={(e) =>
                            setSummaryLanguage(e.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white outline-none focus:border-emerald-500"
                    >
                        <option value="English">🇬🇧 English</option>
                        <option value="Hindi">🇮🇳 हिन्दी</option>
                        <option value="Gujarati">🇮🇳 ગુજરાતી</option>
                        <option value="Marathi">🇮🇳 मराठी</option>
                        <option value="Tamil">🇮🇳 தமிழ்</option>
                        <option value="Telugu">🇮🇳 తెలుగు</option>
                        <option value="Kannada">🇮🇳 ಕನ್ನಡ</option>
                        <option value="Malayalam">🇮🇳 മലയാളം</option>
                        <option value="Bengali">🇮🇳 বাংলা</option>
                        <option value="Punjabi">🇮🇳 ਪੰਜਾਬੀ</option>
                    </select>

                    <button
                        onClick={onGenerate}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        <RefreshCcw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />

                        {loading ? "Generating..." : "Generate Review"}

                    </button>

                </div>

            </div>

            {/* Divider */}

            <div className="my-6 border-t border-slate-800" />

            {/* Empty State */}

            {!loading && !aiSummary && (

                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-16 text-center">

                    <Sparkles
                        size={52}
                        className="mb-5 text-yellow-400"
                    />

                    <h3 className="text-xl font-semibold text-white">
                        Generate AI Review
                    </h3>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                        Generate an AI-powered summary of your product
                        analytics with strengths, weaknesses and
                        actionable recommendations.
                    </p>

                </div>

            )}

            {/* Loading */}

            {loading && (

                <div className="space-y-4">

                    <div className="h-7 w-1/2 animate-pulse rounded bg-slate-800" />

                    <div className="h-4 w-full animate-pulse rounded bg-slate-800" />

                    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />

                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />

                    <div className="mt-8 grid gap-6 lg:grid-cols-3">

                        {[1, 2, 3].map((item) => (

                            <div
                                key={item}
                                className="space-y-3 rounded-xl border border-slate-800 p-5"
                            >

                                <div className="h-5 w-1/3 animate-pulse rounded bg-slate-800" />

                                <div className="h-4 animate-pulse rounded bg-slate-800" />

                                <div className="h-4 animate-pulse rounded bg-slate-800" />

                                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />

                            </div>

                        ))}

                    </div>

                </div>

            )}

            {/* AI Result */}

            {aiSummary && !loading && (

                <div className="space-y-8">

                    <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-6">

                        <div className="mb-5 flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <Star
                                    size={22}
                                    className="text-yellow-400"
                                />

                                <span className="text-lg font-semibold text-white">
                                    Store Health Score
                                </span>

                            </div>

                            <span className="text-4xl font-bold text-emerald-400">
                                {aiSummary.score}/100
                            </span>

                        </div>

                        <p className="leading-8 text-slate-300">
                            {aiSummary.summary}
                        </p>

                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">

                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                            <Section
                                title="Strengths"
                                icon={TrendingUp}
                                color="text-emerald-400"
                                items={aiSummary.strengths}
                            />
                        </div>

                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                            <Section
                                title="Concerns"
                                icon={AlertTriangle}
                                color="text-red-400"
                                items={aiSummary.concerns}
                            />
                        </div>

                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                            <Section
                                title="Recommendations"
                                icon={Lightbulb}
                                color="text-yellow-400"
                                items={aiSummary.recommendations}
                            />
                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}   