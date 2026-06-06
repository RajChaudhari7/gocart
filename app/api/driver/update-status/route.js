import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {

    try {

        const {
            orderId,
            status
        } = await request.json()

        const order = await prisma.order.findUnique({
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
                status
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