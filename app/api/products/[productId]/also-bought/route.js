import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {

        const { productId } = params;

        // Orders containing current product
        const orderItems = await prisma.orderItem.findMany({
            where: {
                productId
            },
            select: {
                orderId: true
            }
        });

        const orderIds = orderItems.map(item => item.orderId);

        if (orderIds.length === 0) {
            return NextResponse.json([]);
        }

        // Fetch all items from those orders
        const allItems = await prisma.orderItem.findMany({

            where: {
                orderId: {
                    in: orderIds
                }
            },

            include: {
                product: {
                    include: {
                        store: true,
                        rating: true
                    }
                }
            }

        });

        // Count products
        const frequency = {};

        for (const item of allItems) {

            if (item.productId === productId) continue;

            if (
                item.product.isArchived ||
                item.product.quantity <= 0 ||
                !item.product.store?.isActive
            ) {
                continue;
            }

            frequency[item.productId] ??= {
                count: 0,
                product: item.product
            };

            frequency[item.productId].count++;

        }

        const recommendations = Object.values(frequency)
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
            .map(item => item.product);

        return NextResponse.json(recommendations);

    } catch (error) {

        console.log(error);

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