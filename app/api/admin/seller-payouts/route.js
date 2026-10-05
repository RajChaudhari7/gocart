import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // ---------------------------------------
        // ADMIN AUTH
        // ---------------------------------------
        const { userId } = getAuth(request);

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // ---------------------------------------
        // QUERY PARAMS
        // ---------------------------------------
        const { searchParams } = new URL(request.url);

        const status = searchParams.get("status") || "ALL";
        const search = searchParams.get("search")?.trim() || "";

        // ---------------------------------------
        // PAYOUT HISTORY FILTER
        // ---------------------------------------
        const payoutWhere = {
            recipientType: "SELLER",
        };

        if (status !== "ALL") {
            payoutWhere.status = status;
        }

        if (search) {
            payoutWhere.store = {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        username: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            };
        }

        // ---------------------------------------
        // ACTUAL PAYOUT HISTORY
        // ---------------------------------------
        const payouts = await prisma.payout.findMany({
            where: payoutWhere,

            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        logo: true,
                        email: true,
                        contact: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },

            take: 200,
        });

        // ---------------------------------------
        // SELLER PAYABLES
        // ---------------------------------------
        // These are earnings that are available
        // to be paid to sellers.
        //
        // IMPORTANT:
        // These do NOT require a Payout record.
        // ---------------------------------------

        const sellerEarnings = await prisma.sellerEarning.findMany({
            where: {
                status: "AVAILABLE",

                ...(search
                    ? {
                        store: {
                            OR: [
                                {
                                    name: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    username: {
                                        contains: search,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    }
                    : {}),
            },

            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        logo: true,
                        email: true,
                        contact: true,
                    },
                },

                order: {
                    select: {
                        id: true,
                        total: true,
                        createdAt: true,
                        deliveredAt: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        // ---------------------------------------
        // TOTAL SELLER PAYABLE
        // ---------------------------------------
        const payable = sellerEarnings.reduce(
            (sum, earning) =>
                sum + Number(earning.netAmount || 0),
            0
        );

        // ---------------------------------------
        // PAYABLE BY STORE
        // ---------------------------------------
        const payableByStore = {};

        for (const earning of sellerEarnings) {
            if (!payableByStore[earning.storeId]) {
                payableByStore[earning.storeId] = 0;
            }

            payableByStore[earning.storeId] += Number(
                earning.netAmount || 0
            );
        }

        // ---------------------------------------
        // GROUP PAYABLES BY STORE
        // ---------------------------------------
        const sellerPayablesMap = {};

        for (const earning of sellerEarnings) {
            const storeId = earning.storeId;

            if (!sellerPayablesMap[storeId]) {
                sellerPayablesMap[storeId] = {
                    storeId,
                    store: earning.store,
                    amount: 0,
                    earningCount: 0,
                    lastEarningAt: earning.createdAt,
                };
            }

            sellerPayablesMap[storeId].amount += Number(
                earning.netAmount || 0
            );

            sellerPayablesMap[storeId].earningCount += 1;

            if (
                new Date(earning.createdAt) >
                new Date(
                    sellerPayablesMap[storeId].lastEarningAt
                )
            ) {
                sellerPayablesMap[storeId].lastEarningAt =
                    earning.createdAt;
            }
        }

        const sellerPayables = Object.values(
            sellerPayablesMap
        );

        // ---------------------------------------
        // PAYOUT SUMMARY
        // ---------------------------------------
        const allPayouts = await prisma.payout.groupBy({
            by: ["status"],

            where: {
                recipientType: "SELLER",
            },

            _sum: {
                amount: true,
            },

            _count: {
                id: true,
            },
        });

        const summary = {
            // Money currently owed to sellers
            payable,

            // Actual payout history
            total: 0,
            pending: 0,
            processing: 0,
            success: 0,
            failed: 0,
            cancelled: 0,

            // Counts
            totalCount: 0,
            pendingCount: 0,
            processingCount: 0,
            successCount: 0,
            failedCount: 0,
            cancelledCount: 0,
        };

        for (const item of allPayouts) {
            const amount = Number(
                item._sum.amount || 0
            );

            const count = Number(
                item._count.id || 0
            );

            summary.total += amount;
            summary.totalCount += count;

            if (item.status === "PENDING") {
                summary.pending += amount;
                summary.pendingCount += count;
            }

            if (item.status === "PROCESSING") {
                summary.processing += amount;
                summary.processingCount += count;
            }

            if (item.status === "SUCCESS") {
                summary.success += amount;
                summary.successCount += count;
            }

            if (item.status === "FAILED") {
                summary.failed += amount;
                summary.failedCount += count;
            }

            if (item.status === "CANCELLED") {
                summary.cancelled += amount;
                summary.cancelledCount += count;
            }
        }

        // ---------------------------------------
        // RESPONSE
        // ---------------------------------------
        return NextResponse.json({
            success: true,

            // Actual payout records
            payouts,

            // Seller earnings available for payout
            sellerPayables,

            // Raw earnings
            sellerEarnings,

            // Store -> payable amount
            payableByStore,

            // Summary
            summary,
        });

    } catch (error) {
        console.error(
            "SELLER PAYOUTS API ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error.message ||
                    "Failed to fetch seller payouts",
            },
            {
                status: 500,
            }
        );
    }
}