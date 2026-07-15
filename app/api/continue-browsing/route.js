import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {

    try {

        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json([]);
        }

        // Latest viewed products
        const views = await prisma.productView.findMany({

            where: {
                userId
            },

            orderBy: {
                viewedAt: "desc"
            },

            take: 100

        });

        if (views.length === 0) {
            return NextResponse.json([]);
        }

        // Remove duplicate products
        const uniqueProductIds = [];

        const seen = new Set();

        for (const view of views) {

            if (!seen.has(view.productId)) {

                seen.add(view.productId);

                uniqueProductIds.push(view.productId);

            }

            if (uniqueProductIds.length >= 10)
                break;

        }

        const products = await prisma.product.findMany({

            where: {

                id: {
                    in: uniqueProductIds
                },

                quantity: {
                    gt: 0
                },

                isArchived: false

            },

            include: {
                store: true
            }

        });

        // Preserve browsing order
        const orderedProducts = uniqueProductIds
            .map(id => products.find(product => product.id === id))
            .filter(Boolean);

        return NextResponse.json(orderedProducts);

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