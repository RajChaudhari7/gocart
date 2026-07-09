import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {

        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json([]);
        }

        // Purchase history
        const preferences = await prisma.userPreference.findMany({
            where: {
                userId
            }
        });

        if (preferences.length === 0) {

            const products = await prisma.product.findMany({

                where: {
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
                        featured: "desc"
                    },
                    {
                        totalSales: "desc"
                    },
                    {
                        averageRating: "desc"
                    }
                ],

                take: 20

            });

            return NextResponse.json(products);

        }

        // Purchased products
        const purchasedIds = preferences.map(p => p.productId);

        // Favorite categories
        const categoryScore = {};

        for (const item of preferences) {

            categoryScore[item.category] =
                (categoryScore[item.category] || 0) + 1;

        }

        const favouriteCategories = Object.keys(categoryScore);

        const recommendations = await prisma.product.findMany({

            where: {

                category: {
                    in: favouriteCategories
                },

                id: {
                    notIn: purchasedIds
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

        recommendations.sort((a, b) => {

            const scoreA =
                (a.featured ? 100 : 0) +
                a.totalSales * 2 +
                a.averageRating * 15;

            const scoreB =
                (b.featured ? 100 : 0) +
                b.totalSales * 2 +
                b.averageRating * 15;

            return scoreB - scoreA;

        });

        return NextResponse.json(
            recommendations.slice(0, 20)
        );

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