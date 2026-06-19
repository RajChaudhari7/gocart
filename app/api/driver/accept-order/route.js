import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {

    try {

        const { orderId } = await request.json()

        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            }
        })

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        // Check if driver already has an active order
        const activeOrder =
            await prisma.order.findFirst({
                where: {
                    driverId: order.driverId,
                    id: {
                        not: orderId
                    },
                    status: {
                        in: [
                            "DRIVER_ASSIGNED",
                            "REACHED_SHOP",
                            "PICKED_UP",
                            "OUT_FOR_DELIVERY",
                            "DELIVERY_INITIATED"
                        ]
                    }
                }
            })

        if (activeOrder) {
            return NextResponse.json(
                {
                    error: "You already have an active order"
                },
                {
                    status: 400
                }
            )
        }

        await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                driverAccepted: true,
                assignmentStatus: "ACCEPTED",
                assignmentExpiresAt: null,
                status: "DRIVER_ASSIGNED",
                statusHistory: {
                    DRIVER_ASSIGNED:
                        new Date().toISOString()
                }
            }
        })

        return NextResponse.json({
            success: true
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