import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {

        const { userId } = getAuth(req);

        // Guest user
        if (!userId) {

            const guestProducts = await prisma.product.findMany({

                where: {
                    isArchived: false,
                    quantity: {
                        gt: 0
                    }
                },

                include: {
                    store: true
                }

            });

            guestProducts.sort((a, b) => {

                const scoreA =
                    (a.featured ? 1000 : 0) +
                    a.totalSales * 5 +
                    a.averageRating * 40 +
                    a.totalViews;

                const scoreB =
                    (b.featured ? 1000 : 0) +
                    b.totalSales * 5 +
                    b.averageRating * 40 +
                    b.totalViews;

                return scoreB - scoreA;

            });

            return NextResponse.json(guestProducts.slice(0, 20));

        }

        const preferences = await prisma.userPreference.findMany({

            where: {
                userId
            }

        });

        const views = await prisma.productView.findMany({

            where: {
                userId
            },

            orderBy: {
                viewedAt: "desc"
            },

            take: 100

        });

        // No purchase history
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
                }

            });

            products.sort((a, b) => {

                const scoreA =
                    (a.featured ? 1000 : 0) +
                    a.totalSales * 5 +
                    a.averageRating * 40 +
                    a.totalViews;

                const scoreB =
                    (b.featured ? 1000 : 0) +
                    b.totalSales * 5 +
                    b.averageRating * 40 +
                    b.totalViews;

                return scoreB - scoreA;

            });

            return NextResponse.json(products.slice(0, 20));

        }

        const purchasedIds = preferences.map(p => p.productId);

        const favouriteCategories = [

            ...new Set([

                ...preferences.map(p => p.category),

                ...views.map(v => v.category)

            ])

        ];

        const favouriteSubCategories = [

            ...new Set([

                ...preferences
                    .map(p => p.subCategory)
                    .filter(Boolean),

                ...views
                    .map(v => v.subCategory)
                    .filter(Boolean)

            ])

        ];
        const activities = await prisma.userActivity.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 150,
        });

        const viewedProducts = activities
            .filter(a => a.action === "VIEW")
            .map(a => a.productId);

        const searchedCategories = activities
            .filter(a => a.action === "SEARCH")
            .map(a => a.category)
            .filter(Boolean);

        const viewedCategories = activities
            .filter(a => a.action === "VIEW")
            .map(a => a.category)
            .filter(Boolean);

        const interestedCategories = [
            ...new Set([
                ...searchedCategories,
                ...viewedCategories,
                ...favouriteCategories,
            ]),
        ];

        const products = await prisma.product.findMany({

            where: {

                quantity: {
                    gt: 0
                },

                isArchived: false

            },

            include: {
                store: true
            }

        });

        const scoredProducts = products
            .filter(product => !purchasedIds.includes(product.id))
            .map(product => {

                let score = 0;

                /* Featured */
                if (product.featured)
                    score += 100;

                /* Purchased Category */
                if (favouriteCategories.includes(product.category))
                    score += 150;

                const recentlyViewed = views.find(
                    v => v.productId === product.id
                );

                if (recentlyViewed) {
                    score += 40;
                }

                /* Viewed / Search Category */
                if (interestedCategories.includes(product.category))
                    score += 120;

                /* Purchased SubCategory */
                if (
                    product.subCategory &&
                    favouriteSubCategories.includes(product.subCategory)
                )
                    score += 180;

                /* User viewed this product before */
                if (viewedProducts.includes(product.id))
                    score += 70;

                /* Popular Products */
                score += product.totalSales * 4;

                /* Highly Rated */
                score += product.averageRating * 25;

                /* Trending */
                score += product.totalViews * 0.15;

                /* Slight randomness */
                score += Math.random() * 40;

                // Penalize already purchased
                if (purchasedIds.includes(product.id))
                    score -= 500;

                return {
                    ...product,
                    recommendationScore: score
                };

            });

        scoredProducts.sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        );

        if (scoredProducts.length === 0) {

            const fallback = await prisma.product.findMany({

                where: {
                    quantity: {
                        gt: 0
                    },
                    isArchived: false
                },

                include: {
                    store: true
                }

            });

            return NextResponse.json(fallback.slice(0, 20));

        }

        return NextResponse.json(
            scoredProducts.slice(0, 20)
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