import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function POST(request) {

    const { orderId } = await request.json()

    await prisma.order.update({
        where: { id: orderId },
        data: {
            driverAccepted: true,
            assignmentStatus: "ACCEPTED",
            status: "DRIVER_ASSIGNED"
        }
    })

    return NextResponse.json({
        success: true
    })

}