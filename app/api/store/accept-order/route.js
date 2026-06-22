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

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                storeId: store.id
            }
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        if (order.status !== "ORDER_PLACED") {
            return NextResponse.json(
                {
                    error: "Order already processed"
                },
                {
                    status: 400
                }
            );
        }

        const updatedOrder =
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    status: "ORDER_CONFIRMED"
                }
            });

        return NextResponse.json({
            success: true,
            message: "Order accepted successfully",
            order: updatedOrder
        });

    } catch (error) {

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