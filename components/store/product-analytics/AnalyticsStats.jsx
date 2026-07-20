"use client";

import KpiCard from "./KpiCard";
import { KPI_CONFIG } from "./constants";
import { formatNumber } from "./utils";

export default function AnalyticsStats({ stats }) {
    return (
        <section>
            <div className="mb-5">
                <h2 className="text-xl font-black text-white md:text-2xl">
                    Performance Overview
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Current performance summary of all active products in your
                    store.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {KPI_CONFIG.map((item, index) => (
                    <KpiCard
                        key={item.key}
                        index={index}
                        title={item.title}
                        description={item.description}
                        value={
                            item.key === "averageRating"
                                ? Number(stats[item.key] || 0).toFixed(1)
                                : formatNumber(stats[item.key])
                        }
                        icon={item.icon}
                        iconBackground={item.iconBackground}
                        iconShadow={item.iconShadow}
                        glow={item.glow}
                        suffix={item.suffix}
                    />
                ))}
            </div>
        </section>
    );
}