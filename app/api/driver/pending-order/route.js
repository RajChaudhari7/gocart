import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {

    const { searchParams } = new URL(request.url)

    const driverId =
        searchParams.get("driverId")

    // Check if driver already has an active order
    const activeOrder =
        await prisma.order.findFirst({
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
            }
        })

    if (activeOrder) {
        return NextResponse.json({
            order: null
        })
    }

    const order = await prisma.order.findFirst({
        where: {
            driverId,
            driverAccepted: false,
            assignmentStatus: "PENDING",
            assignmentExpiresAt: {
                gt: new Date()
            }
        },
        orderBy: {
            assignedAt: "desc"
        },
        include: {
            store: true
        }
    })

    return NextResponse.json({
        order
    })
}