import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {

    const { userId } = getAuth(req)

    const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: {
            orderItems: {
                include: { product: true }
            }
        }
    })

    return NextResponse.json({
        items: order.orderItems
    })

}