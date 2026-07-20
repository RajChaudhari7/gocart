"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { ERROR_STATE } from "./constants";

export default function ErrorState({
    message,
    refreshing = false,
    onRetry,
}) {
    return (
        <main className="flex min-h-[70vh] items-center justify-center p-6">
            <div
                className="
                    w-full
                    max-w-lg
                    rounded-3xl
                    border
                    border-red-500/20
                    bg-slate-900
                    p-10
                    text-center
                    shadow-2xl
                    shadow-black/20
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-full
                        bg-red-500/10
                    "
                >
                    <AlertTriangle
                        size={42}
                        className="text-red-400"
                    />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-white">
                    {ERROR_STATE.title}
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                    {message ||
                        ERROR_STATE.defaultMessage}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    disabled={refreshing}
                    className="
                        mt-8
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-violet-600
                        px-5
                        py-3
                        font-semibold
                        text-white
                        transition
                        hover:bg-violet-700
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    <RefreshCw
                        size={18}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? ERROR_STATE.retryingText
                        : ERROR_STATE.retryText}
                </button>
            </div>
        </main>
    );
}