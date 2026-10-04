import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {

        const admin = await authAdmin()

        if (!admin) {
            return NextResponse.json({
                error: "Unauthorized"
            }, {
                status: 401
            }
            )
        }

        const { searchParams } = new URL(request.url)

        const status = searchParams.get("status")
        const search = searchParams.get("sarch")?.trim()

        const where = {}

        if (status && status !== "ALL") {
            where.status = status
        }

        if (search) {
            where.OR = [
                {
                    orderId: {
                        contains: search,
                        mode: "insensitive",
                    },
                },

                {
                    store: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },

                {
                    store: {
                        username: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
            ]
        }

        const [earnings, summary] = await Promise.all([
            prisma.sellerEarning.findMany({
                where,
                include: {
                    store: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            logo: true,
                        },
                    },

                    order: {
                        select: {
                            id: true,
                            status: true,
                            createdAt: true,
                            deliveredAt: true,
                            total: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: "desc",
                },

                take: 200,
            }),

            prisma.sellerEarning.groupBy({
                by: ["status"],
                _sum: {
                    netAmount: true,
                },
                _count: {
                    id: true,
                },
            }),
        ])

        const summaryData = {
            total: 0,
            pending: 0,
            available: 0,
            paid: 0,
            adjusted: 0,
        }

        for (const item of summary) {
            const amount = Number(item._sum.netAmount || 0)

            summaryData.total += amount

            if (item.status === "PENDING") {
                summaryData.pending += amount
            }

            if (item.status === "AVAILABLE") {
                summaryData.available += amount
            }

            if (item.status === "PAID") {
                summaryData.paid += amount
            }

            if (item.status === "ADJUSTED") {
                summaryData.adjusted += amount
            }
        }

        return NextResponse.json({
            earnings,
            summary: summaryData,
        })

    } catch (error) {
        console.error("Seller Earnings Error:", error);
        return NextResponse.json({
            error: error.message || "Failed to fetch seller earnings",
        },
            {
                status: 500,
            }
        )
    }
}