import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {

    const { searchParams } = new URL(request.url)

    const driverId =
        searchParams.get("driverId")

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