import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const products = await prisma.product.findMany({

            where: {

                featured: true,

                isArchived: false,

                quantity: {
                    gt: 0
                }

            },

            include: {
                store: true
            },

            orderBy: [

                {
                    totalSales: "desc"
                },

                {
                    averageRating: "desc"
                }

            ],

            take: 8

        });

        return NextResponse.json(products);

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