import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {

    try {

        const { orderId } =
            await request.json()

        const order =
            await prisma.order.findUnique({
                where: {
                    id: orderId
                }
            })

        if (!order) {
            return NextResponse.json(
                {
                    error: "Order not found"
                },
                {
                    status: 404
                }
            )
        }

        await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                driverId: null,
                driverAccepted: false,
                assignmentStatus: "DECLINED",
                assignmentExpiresAt: null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Order declined"
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