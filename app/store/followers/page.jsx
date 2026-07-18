"use client";

import { useEffect, useState } from "react";
import {
    Users,
    UserPlus,
    CalendarDays,
    TrendingUp,
    UserCircle2,
} from "lucide-react";
import axios from "axios";
import FollowersGrowthChart from "@/components/store/FollowersGrowthChart";
import { toast } from "sonner";
import Image from "next/image";

export default function StoreFollowersPage() {
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("7d");
    const [chartLoading, setChartLoading] = useState(false);

    const [stats, setStats] = useState(null);
    const [growth, setGrowth] = useState([]);
    const [recentFollowers, setRecentFollowers] = useState([]);

    const fetchFollowers = async (
        selectedRange = "7d",
        isRangeChange = false
    ) => {
        try {
            if (isRangeChange) {
                setChartLoading(true);
            } else {
                setLoading(true);
            }

            const { data } = await axios.get(
                `/api/store/followers?range=${selectedRange}`
            );

            setStats(data.stats);
            setGrowth(data.growth);
            setRecentFollowers(
                data.recentFollowers
            );
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.error ||
                "Failed to load followers"
            );
        } finally {
            setLoading(false);
            setChartLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowers("7d");
    }, []);

    const handleRangeChange = async (
        selectedRange
    ) => {
        if (
            selectedRange === range ||
            chartLoading
        ) {
            return;
        }

        setRange(selectedRange);

        await fetchFollowers(
            selectedRange,
            true
        );
    };

    const cards = [
        {
            title: "Total Followers",
            value: stats?.totalFollowers ?? 0,
            icon: Users,
            color: "from-cyan-500 to-blue-500",
        },
        {
            title: "Today",
            value: stats?.todayFollowers ?? 0,
            icon: UserPlus,
            color: "from-emerald-500 to-green-500",
        },
        {
            title: "This Week",
            value: stats?.weekFollowers ?? 0,
            icon: TrendingUp,
            color: "from-violet-500 to-purple-500",
        },
        {
            title: "This Month",
            value: stats?.monthFollowers ?? 0,
            icon: CalendarDays,
            color: "from-orange-500 to-red-500",
        },
    ];

    return (
        <section className="min-h-screen bg-[#020617] text-white p-6">

            {/* Header */}

            <div className="mb-10">

                <h1 className="text-4xl font-black">
                    Followers
                </h1>

                <p className="text-slate-400 mt-2">
                    Track how your store community is growing.
                </p>

            </div>

            {/* KPI Cards */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                {cards.map((card) => {

                    const Icon = card.icon;

                    return (

                        <div
                            key={card.title}
                            className="
                rounded-3xl
                border
                border-white/10
                bg-white/5
                backdrop-blur-xl
                p-6
              "
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-400">
                                        {card.title}
                                    </p>

                                    {loading ? (

                                        <div className="mt-3 h-9 w-24 rounded bg-slate-700 animate-pulse" />

                                    ) : (

                                        <h2 className="mt-3 text-4xl font-black">
                                            {card.value}
                                        </h2>

                                    )}

                                </div>

                                <div
                                    className={`
                    w-14
                    h-14
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    bg-gradient-to-br
                    ${card.color}
                  `}
                                >
                                    <Icon size={28} />
                                </div>

                            </div>

                        </div>

                    );

                })}

            </div>

            {/* Chart Placeholder */}

            <div
                className="
          mt-10
          rounded-3xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-xl
          p-8
        "
            >

                <h2 className="text-2xl font-bold mb-2">
                    Followers Growth
                </h2>

                <p className="text-slate-400 mb-8">
                    Daily follower growth chart will appear here.
                </p>

                <div className="mt-10">
                    <FollowersGrowthChart
                        data={growth}
                        range={range}
                        loading={chartLoading}
                        onRangeChange={handleRangeChange}
                    />
                </div>

            </div>

            {/* Recent Followers Placeholder */}

            <div
                className="
        mt-10
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-8
    "
            >

                <div className="flex items-center justify-between mb-8">

                    <div>

                        <h2 className="text-2xl font-bold">
                            Recent Followers
                        </h2>

                        <p className="text-slate-400 text-sm mt-1">
                            Latest customers following your store
                        </p>

                    </div>

                    <span className="text-sm text-slate-400">
                        {recentFollowers.length} Followers
                    </span>

                </div>

                {recentFollowers.length === 0 ? (

                    <div className="text-center py-14">

                        <UserCircle2
                            size={48}
                            className="mx-auto text-slate-600"
                        />

                        <p className="mt-4 text-slate-400">
                            No followers yet
                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {recentFollowers.map((user) => (

                            <div
                                key={user.id}
                                className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        bg-black/20
                        border
                        border-white/10
                        p-4
                        hover:border-emerald-400/30
                        transition
                    "
                            >

                                <div className="flex items-center gap-4">

                                    {user.image ? (

                                        <Image
                                            src={user.image}
                                            alt={user.name}
                                            width={52}
                                            height={52}
                                            className="rounded-full"
                                        />

                                    ) : (

                                        <div className="w-13 h-13 rounded-full bg-emerald-500 flex items-center justify-center font-bold">

                                            {user.name.charAt(0)}

                                        </div>

                                    )}

                                    <div>

                                        <h3 className="font-semibold">

                                            {user.name}

                                        </h3>

                                        <p className="text-sm text-slate-400">

                                            {user.email}

                                        </p>

                                    </div>

                                </div>

                                <div className="text-right">

                                    <p className="text-xs text-slate-400">

                                        {new Date(user.followedAt).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}

                                    </p>

                                    <span
                                        className="
                                inline-block
                                mt-2
                                px-3
                                py-1
                                rounded-full
                                bg-emerald-500/20
                                text-emerald-400
                                text-xs
                            "
                                    >
                                        New Follower
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </section>
    );
}