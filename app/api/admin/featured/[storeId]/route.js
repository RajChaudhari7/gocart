import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {

    try {

        const { storeId } = params;

        const products = await prisma.product.findMany({

            where: {
                storeId,
                isArchived: false,
            },

            select: {

                id: true,

                name: true,

                images: true,

                price: true,

                mrp: true,

                quantity: true,

                category: true,

                subCategory: true,

                featured: true,

                featuredPriority: true,

                averageRating: true,

                totalSales: true,

                totalViews: true,

                createdAt: true,

            },

            orderBy: [
                {
                    featured: "desc",
                },
                {
                    featuredPriority: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],

        });

        return NextResponse.json(products);

    } catch (error) {

        console.log(error);

        return NextResponse.json(
            {
                error: error.message,
            },
            {
                status: 500,
            }
        );

    }

}