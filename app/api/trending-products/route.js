import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {

    try {
        const products = await prisma.product.findMany({

            where: {
                isArchived: false,

                quantity: {
                    gt: 0,
                },

                store: {
                    isActive: true,
                },
            },

            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                    },
                },

                rating: {
                    select: {
                        rating: true,
                    },
                },
            },

        });

        const trendingProducts = products.map((product) => {

            const reviewCount = product.rating.length;

            const averageRating = reviewCount > 0 ? product.rating.reduce(
                (sum, item) => sum + item.rating, 0
            ) / reviewCount : 0;


            const trendingScore =
                (product.totalSales * 5) +
                (product.totalViews * 0.15) +
                (averageRating * 30) +
                (reviewCount * 3);


            return {
                ...product,
                averageRating,
                reviewCount,
                trendingScore,
            };
        })

            .sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 12);

        return NextResponse.json(trendingProducts);

    } catch (error) {

        console.log(error);

        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })

    }
}