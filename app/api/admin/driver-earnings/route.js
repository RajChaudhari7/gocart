import prisma from "@/lib/prisma"
import { authAdmin } from "@/middlewares/authAdmin"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


export const runtime = "nodejs"

export async function GET(request) {
    try {

        const { userId } = getAuth(request)

        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({
                error: "Not authorized"
            },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)

        const status = searchParams.get("status")

        const search = searchParams.get("search")?.trim()

        const where = {}

        if (status && status !== " ALL") {
            where.status = status
        }

        if (search) {
            where.OR = [
                {
                    driver: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    driver: {
                        phone: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                }
            ]
        }

        const [
            earnings,
            total,
            pending,
            available,
            paid,
        ] = await Promise.all([
            prisma.driverEarning.findMany({
                where,

                orderBy: {
                    createdAt: "desc",
                },
                take: 200,

                include: {
                    driver: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            }),

            prisma.driverEarning.aggregate({
                where,
                _sum: {
                    amount: true,
                },
            }),

            prisma.driverEarning.aggregate({
                where: {
                    ...where,
                    status: "PENDING",
                },
                _sum: {
                    amount: true,
                },
            }),

            prisma.driverEarning.aggregate({
                where: {
                    ...where,
                    status: "AVAILABLE",
                },
                _sum: {
                    amount: true,
                },
            }),

            prisma.driverEarning.aggregate({
                where: {
                    ...where,
                    status: "PAID",
                },
                _sum: {
                    amount: true,
                },
            }),
        ])

        return NextResponse.json({
            success: true,
            earnings,

            summary: {
                total: total._sum.amount || 0,
                pending: pending._sum.amount || 0,
                available: available._sum.amount || 0,
                paid: paid._sum.amount || 0,
            },
        })

    } catch (error) {
        console.error("Admin Driver Earnings Error:", error)
        return NextResponse.json({
            error: "Failed to fetch driver earnings",
        },
            {
                status: 500,
            }
        )
    }
}