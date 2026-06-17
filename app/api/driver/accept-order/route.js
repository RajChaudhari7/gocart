import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {

    const { orderId } =
        await request.json()

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
}