import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {

    const { returnId, otp } = await req.json()

    const returnReq = await prisma.returnRequest.findUnique({
        where: { id: returnId },
        include: { items: true }
    })

    if (returnReq.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" })
    }

    await prisma.$transaction(async (tx) => {

        for (const item of returnReq.items) {

            await tx.product.update({
                where: { id: item.productId },
                data: {
                    quantity: { increment: item.quantity }
                }
            })

        }

        await tx.order.update({
            where: { id: returnReq.orderId },
            data: {
                status: "RETURNED"
            }
        })

        await tx.returnRequest.update({
            where: { id: returnReq.id },
            data: {
                verified: true,
                status: "RETURNED"
            }
        })

    })

    return NextResponse.json({ message: "Order Returned" })

}