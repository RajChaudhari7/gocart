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

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-3">

                    <select
                        value={summaryLanguage}
                        onChange={(e) =>
                            setSummaryLanguage(e.target.value)
                        }
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                    >
                        <option value="English">English</option>
                        <option value="Hindi">हिन्दी</option>
                        <option value="Gujarati">ગુજરાતી</option>
                        <option value="Marathi">मराठी</option>
                        <option value="Tamil">தமிழ்</option>
                        <option value="Telugu">తెలుగు</option>
                        <option value="Kannada">ಕನ್ನಡ</option>
                        <option value="Malayalam">മലയാളം</option>
                        <option value="Bengali">বাংলা</option>
                        <option value="Punjabi">ਪੰਜਾਬੀ</option>
                    </select>

                    <button
                        onClick={onGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:opacity-50"
                    >

                        <RefreshCcw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />

                        {loading ? "Generating..." : "Generate"}

                    </button>

                </div>

                {!aiSummary && !loading && (

                    <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">

                        <Sparkles
                            size={40}
                            className="mx-auto mb-4 text-yellow-400"
                        />

                        <h3 className="text-lg font-semibold text-white">
                            Generate AI Review
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                            Click the button above to analyze your store.
                        </p>

                    </div>

                )}

                {loading && (

                    <div className="space-y-4">

                        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-800" />

                        <div className="h-4 w-full animate-pulse rounded bg-slate-800" />

                        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />

                        <div className="h-4 w-4/6 animate-pulse rounded bg-slate-800" />

                    </div>

                )}

                {aiSummary && !loading && (

                    <>

                        <div className="mb-6 rounded-xl bg-slate-800 p-5">

                            <div className="mb-4 flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                    <Star
                                        size={18}
                                        className="text-yellow-400"
                                    />

                                    <span className="font-semibold text-white">
                                        Store Health Score
                                    </span>

                                </div>

                                <span className="text-3xl font-bold text-emerald-400">
                                    {aiSummary.score}/100
                                </span>

                            </div>

                            <p className="leading-7 text-slate-300">
                                {aiSummary.summary}
                            </p>

                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">

                            <Section
                                title="Strengths"
                                icon={TrendingUp}
                                color="text-emerald-400"
                                items={aiSummary.strengths}
                            />

                            <Section
                                title="Concerns"
                                icon={AlertTriangle}
                                color="text-red-400"
                                items={aiSummary.concerns}
                            />

                            <Section
                                title="Recommendations"
                                icon={Lightbulb}
                                color="text-yellow-400"
                                items={aiSummary.recommendations}
                            />

                        </div>

                    </>

                )}

            </div>

        </div>
    );
}   