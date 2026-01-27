import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orderId } = await request.json();
        if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        });

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        if (order.userId !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (order.status === "CANCELLED") return NextResponse.json({ error: "Order already canceled" }, { status: 400 });

        // Start transaction
        await prisma.$transaction(async (prisma) => {
            // Restore product quantity
            for (const item of order.orderItems) {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: product.quantity + item.quantity,
                        inStock: true
                    }
                });
            }

            // Update order status
            await prisma.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" }
            });
        });

        return NextResponse.json({
            message: "Order canceled successfully",
            orderId: order.id,
            canceledAmount: order.total
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 500 });
    }
}
