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

        if (status && status !== "ALL") {
            where.status = status
        }

        if (search) {
            where.OR = [
                {
                    id: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    user: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
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
            ]
        }

        const orders = await prisma.order.findMany({
            where,

            orderBy: {
                createdAt: "desc",
            },

            take: 100,

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },

                store: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                driver: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },

                orderItems: {
                    select: {
                        productId: true,
                        quantity: true,
                        price: true,

                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                            },
                        },
                    },
                },

                orderEvents: {
                    orderBy: {
                        createdAt: "asc",
                    },

                    select: {
                        id: true,
                        status: true,
                        actorType: true,
                        actorId: true,
                        note: true,
                        createdAt: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            orders,
        })

    } catch (error) {
        console.error("Admin Orders Error:", error)

        return NextResponse.json({
            error: "Failed to fetch orders",
        },
            {
                status: 500,
            }
        )
    }
}