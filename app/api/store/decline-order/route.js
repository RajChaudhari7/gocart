import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { orderId } = await req.json();

    const orderItems = await prisma.orderItem.findMany({
        where: {
            orderId
        }
    })

    for (const item of orderItems) {
        await prisma.product.update({
            where: {
                id: item.productId
            },
            data: {
                stock: {
                    increment: item.quantity
                }
            }
        })
    }

    const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
    });

    return NextResponse.json({ success: true, order });
}