import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request);

        // 1. Check if user is authenticated
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // 2. Fetch the single order from the database
        const order = await prisma.order.findUnique({
            where: {
                id: id, // Find by the specific order ID from the URL
                userId: userId, // Security check: Ensure this user actually owns this order
            },
            include: {
                orderItems: {
                    include: { product: true },
                },
                address: true,
                driver: true,
            },
        });

        // 3. If order doesn't exist, return a 404
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 4. Return the specific order back to the tracking page
        return NextResponse.json({ order });

    } catch (error) {
        console.error("Error fetching single order:", error);
        return NextResponse.json(
            { error: "Failed to load order details" },
            { status: 500 }
        );
    }
}