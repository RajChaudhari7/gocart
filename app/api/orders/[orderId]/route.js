import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request);

        // 1. Check if user is logged in
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = params;

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // 2. Fetch the specific order from the database
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId, // Security check: Ensure the order belongs to the logged-in user!
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                address: true,

                driver: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        latitude: true,
                        longitude: true,
                        isOnline: true,
                    },
                },

                store: true,
            },
        });

        // 3. If order doesn't exist or belongs to someone else
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 4. Return the order safely
        return NextResponse.json({ order });

    } catch (error) {
        console.error("Error fetching single order:", error);
        return NextResponse.json(
            { error: "Failed to fetch order details" },
            { status: 500 }
        );
    }
}