import prisma from "@/lib/prisma"
import { authAdmin } from "@/middlewares/authAdmin"
import { NextResponse } from "next/server"


export async function GET(request) {
    try {
        const admin = await authAdmin()

        if (!admin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)

        const status = searchParams.get("status") || "ALL"
        const search = searchParams.get("search")?.trim() || ""

        const where = {}

        // Status filter
        if (status !== "ALL") {
            where.status = status
        }

        // Search filter
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

        const earnings = await prisma.sellerEarning.findMany({
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
                        total: true,
                        createdAt: true,
                        deliveredAt: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },

            take: 200,
        })

        // Calculate summary from ALL seller earnings.
        const allEarnings = await prisma.sellerEarning.findMany({
            select: {
                netAmount: true,
                status: true,
            },
        })

        const summary = {
            total: 0,
            pending: 0,
            available: 0,
            paid: 0,
            adjusted: 0,
        }

        for (const earning of allEarnings) {
            const amount = Number(earning.netAmount || 0)

            summary.total += amount

            if (earning.status === "PENDING") {
                summary.pending += amount
            }

            if (earning.status === "AVAILABLE") {
                summary.available += amount
            }

            if (earning.status === "PAID") {
                summary.paid += amount
            }

            if (earning.status === "ADJUSTED") {
                summary.adjusted += amount
            }
        }

        return NextResponse.json({
            success: true,
            earnings,
            summary,
        })

    } catch (error) {
        console.error("SELLER EARNINGS API ERROR:", error)

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch seller earnings",
            },
            {
                status: 500,
            }
        )
    }
}