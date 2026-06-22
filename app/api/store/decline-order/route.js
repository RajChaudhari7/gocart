import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
    try {

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        // Find seller store
        const store = await prisma.store.findFirst({
            where: {
                clerkUserId: userId
            }
        });

        if (!store) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 404 }
            );
        }

        // Verify order belongs to this store
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                storeId: store.id
            },
            include: {
                orderItems: true
            }
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Already processed
        if (
            order.status !== "ORDER_PLACED"
        ) {
            return NextResponse.json(
                {
                    error: "Order already processed"
                },
                {
                    status: 400
                }
            );
        }

        // Restore stock
        for (const item of order.orderItems) {

            await prisma.product.update({
                where: {
                    id: item.productId
                },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            });

        }

        // Cancel order
        const updatedOrder =
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    status: "CANCELLED",
                    cancelledAt: new Date()
                }
            });

        return NextResponse.json({
            success: true,
            message: "Order declined successfully",
            order: updatedOrder
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        );
    }
}