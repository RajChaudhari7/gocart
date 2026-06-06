import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

    try {

        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: [
                        "OUT_FOR_DELIVERY",
                        "DELIVERY_INITIATED"
                    ]
                }
            },
            include: {
                user: true,
                address: true
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