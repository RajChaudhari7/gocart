import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const { searchParams } = new URL(request.url);

        const range = searchParams.get("range") || "7d";

        const allowedRanges = ["7d", "30d", "12m"];

        if (!allowedRanges.includes(range)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid range",
                },
                {
                    status: 400,
                }
            );
        }

        const store = await prisma.store.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (!store) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Store not found",
                },
                {
                    status: 404,
                }
            );
        }

        const now = new Date();

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = getStartOfWeek(now);

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const graphStartDate = getGraphStartDate(range, now);

        const [
            totalFollowers,
            todayFollowers,
            weekFollowers,
            monthFollowers,
            graphFollowers,
            recentFollowerRecords,
        ] = await prisma.$transaction([
            prisma.storeFollower.count({
                where: {
                    storeId: store.id,
                },
            }),

            prisma.storeFollower.count({
                where: {
                    storeId: store.id,
                    createdAt: {
                        gte: startOfToday,
                    },
                },
            }),

            prisma.storeFollower.count({
                where: {
                    storeId: store.id,
                    createdAt: {
                        gte: startOfWeek,
                    },
                },
            }),

            prisma.storeFollower.count({
                where: {
                    storeId: store.id,
                    createdAt: {
                        gte: startOfMonth,
                    },
                },
            }),

            prisma.storeFollower.findMany({
                where: {
                    storeId: store.id,
                    createdAt: {
                        gte: graphStartDate,
                    },
                },
                select: {
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "asc",
                },
            }),

            prisma.storeFollower.findMany({
                where: {
                    storeId: store.id,
                },
                include: {
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            }),
        ]);

        const growth = buildGrowthData({
            range,
            startDate: graphStartDate,
            endDate: now,
            followers: graphFollowers,
        });

        const recentFollowers = recentFollowerRecords.map(
            (record) => {
                const user = record.user || {};

                return {
                    id: record.id,
                    userId: record.userId,

                    name:
                        user.name ||
                        user.fullName ||
                        user.username ||
                        "Customer",

                    email: user.email || null,

                    image:
                        user.image ||
                        user.imageUrl ||
                        user.profileImage ||
                        null,

                    followedAt: record.createdAt,
                };
            }
        );

        return NextResponse.json(
            {
                success: true,

                store: {
                    id: store.id,
                    name: store.name,
                },

                range,

                stats: {
                    totalFollowers,
                    todayFollowers,
                    weekFollowers,
                    monthFollowers,
                },

                growth,

                recentFollowers,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("GET STORE FOLLOWERS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error?.message ||
                    "Failed to fetch followers",
            },
            {
                status: 500,
            }
        );
    }
}

function getStartOfWeek(dateValue) {
    const date = new Date(dateValue);

    date.setHours(0, 0, 0, 0);

    const day = date.getDay();

    const daysSinceMonday =
        day === 0
            ? 6
            : day - 1;

    date.setDate(
        date.getDate() - daysSinceMonday
    );

    return date;
}

function getGraphStartDate(range, dateValue) {
    const date = new Date(dateValue);

    date.setHours(0, 0, 0, 0);

    if (range === "7d") {
        date.setDate(date.getDate() - 6);
    }

    if (range === "30d") {
        date.setDate(date.getDate() - 29);
    }

    if (range === "12m") {
        date.setMonth(date.getMonth() - 11);
        date.setDate(1);
    }

    return date;
}

function buildGrowthData({
    range,
    startDate,
    endDate,
    followers,
}) {
    if (range === "12m") {
        return buildMonthlyGrowth(
            startDate,
            endDate,
            followers
        );
    }

    return buildDailyGrowth(
        startDate,
        endDate,
        followers
    );
}

function buildDailyGrowth(
    startDate,
    endDate,
    followers
) {
    const growthMap = {};

    followers.forEach((follower) => {
        const key = formatDate(follower.createdAt);

        growthMap[key] =
            (growthMap[key] || 0) + 1;
    });

    const growth = [];

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const key = formatDate(currentDate);

        growth.push({
            date: key,

            label: currentDate.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                }
            ),

            count: growthMap[key] || 0,
        });

        currentDate.setDate(
            currentDate.getDate() + 1
        );
    }

    return growth;
}

function buildMonthlyGrowth(
    startDate,
    endDate,
    followers
) {
    const growthMap = {};

    followers.forEach((follower) => {
        const key = formatMonth(
            follower.createdAt
        );

        growthMap[key] =
            (growthMap[key] || 0) + 1;
    });

    const growth = [];

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const key = formatMonth(currentDate);

        growth.push({
            date: key,

            label: currentDate.toLocaleDateString(
                "en-IN",
                {
                    month: "short",
                    year: "2-digit",
                }
            ),

            count: growthMap[key] || 0,
        });

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );
    }

    return growth;
}

function formatDate(dateValue) {
    const date = new Date(dateValue);

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatMonth(dateValue) {
    const date = new Date(dateValue);

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
}