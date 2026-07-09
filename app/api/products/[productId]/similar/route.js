import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {

    try {

        const { productId } = params;

        const currentProduct = await prisma.product.findUnique({

            where: {
                id: productId
            }

        });

        if (!currentProduct) {

            return NextResponse.json([]);

        }

        const products = await prisma.product.findMany({

            where: {

                id: {
                    not: productId
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

        const scored = products.map(product => {

            let score = 0;

            // Same Subcategory
            if (
                product.subCategory &&
                product.subCategory === currentProduct.subCategory
            ) {
                score += 100;
            }

            // Same Category
            if (
                product.category === currentProduct.category
            ) {
                score += 60;
            }

            // Featured
            if (product.featured)
                score += 50;

            // Same Store
            if (product.storeId === currentProduct.storeId)
                score += 30;

            // Rating
            score += product.averageRating * 12;

            // Sales
            score += product.totalSales * 3;

            // Similar Price
            const difference =
                Math.abs(product.price - currentProduct.price);

            if (difference <= currentProduct.price * 0.20)
                score += 15;

            return {

                ...product,

                score

            };

        });

        scored.sort((a, b) => b.score - a.score);

        return NextResponse.json(

            scored.slice(0, 8)

        );

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