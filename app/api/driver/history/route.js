import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {

        const { searchParams } = new URL(request.url)

        const driverId = searchParams.get("driverId")

        if (!driverId) {
            return NextResponse.json(
                {
                    error: "Driver ID is required"
                },
                {
                    status: 400
                }
            )
        }

        const orders = await prisma.order.findMany({
            where: {
                driverId,
                status: "DELIVERED"
            },
            include: {
                user: true,
                address: true,
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        })

        return NextResponse.json({
            success: true,
            orders
        })

    } catch (error) {

        console.log(error)

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