import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        
        // ADMIN AUTH
        const { userId } = getAuth(request);

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        // QUERY PARAMS 
        const { searchParams } = new URL(request.url);

        const status = searchParams.get("status") || "ALL";
        const search = searchParams.get("search")?.trim() || "";

        // PAYOUT FILTER   
        const where = {
            recipientType: "SELLER",
        };

        if (status !== "ALL") {
            where.status = status;
        }

        if (search) {
            where.store = {
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
        
        // PAYOUT HISTORY        
        const payouts = await prisma.payout.findMany({
            where,
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
        
        // SELLER PAYABLE        
        const totalSellerPayable = await prisma.sellerEarning.aggregate({
            where: {
                status: "AVAILABLE",
            },
            _sum: {
                netAmount: true,
            },
        });

        const payable = Number(
            totalSellerPayable._sum.netAmount || 0
        );
        
        // PAYABLE BY STORE       
        const sellerPayables = await prisma.sellerEarning.groupBy({
            by: ["storeId"],
            where: {
                status: "AVAILABLE",
            },
            _sum: {
                netAmount: true,
            },
        });

        const payableMap = {};

        for (const item of sellerPayables) {
            payableMap[item.storeId] = Number(
                item._sum.netAmount || 0
            );
        }
        
        // PAYOUT SUMMARY        
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
            // Current unpaid seller earnings
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
        
        return NextResponse.json({
            success: true,

            payouts,

            payableMap,

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
            { status: 500 }
        );
    }
}