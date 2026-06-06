import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {

    try {

        const { searchParams } = new URL(request.url)

        const driverId = searchParams.get("driverId")

        if (!driverId) {
            return NextResponse.json(
                { error: "Driver ID required" },
                { status: 400 }
            )
        }

        const orders = await prisma.order.findMany({
            where: {
                driverId,
                status: {
                    in: [
                        "DRIVER_ASSIGNED",
                        "REACHED_SHOP",
                        "PICKED_UP",
                        "OUT_FOR_DELIVERY",
                        "DELIVERY_INITIATED"
                    ]
                }
            },
            include: {
                user: true,
                address: true,
                store: true,
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return NextResponse.json({
            orders
        })

    } catch (error) {

        return NextResponse.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        )
    }
}