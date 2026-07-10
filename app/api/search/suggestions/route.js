import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const query = searchParams.get("q")?.trim();

        if (!query) {
            return NextResponse.json({
                products: [],
                categories: [],
                stores: [],
                suggestions: [],
            });
        }

        //------------------------------------
        // Products
        //------------------------------------

        const words = query
            .toLowerCase()
            .split(" ")
            .filter(Boolean);

        const products = await prisma.product.findMany({
            where: {
                quantity: {
                    gt: 0,
                },

                isArchived: false,

                store: {
                    isActive: true,
                },

                OR: words.flatMap((word) => [
                    {
                        name: {
                            contains: word,
                            mode: "insensitive",
                        },
                    },

                    {
                        description: {
                            contains: word,
                            mode: "insensitive",
                        },
                    },

                    {
                        category: {
                            contains: word,
                            mode: "insensitive",
                        },
                    },

                    {
                        subCategory: {
                            contains: word,
                            mode: "insensitive",
                        },
                    },

                    {
                        keywords: {
                            has: word,
                        },
                    },
                ]),
            },

            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        isActive:true
                    },
                },
            },

            take: 6,
        });

        //------------------------------------
        // Categories
        //------------------------------------

        const categories = [
            ...new Set(
                products
                    .map((p) => p.category)
                    .filter(Boolean)
            ),
        ];

        //------------------------------------
        // Stores
        //------------------------------------

        const stores = [
            ...new Map(
                products.map((p) => [
                    p.store.id,
                    p.store,
                ])
            ).values(),
        ];

        //------------------------------------
        // Suggestions
        //------------------------------------

        const suggestions = [
            ...new Set([
                query,
                ...products.map((p) => p.name),
                ...products.map((p) => p.category),
                ...products
                    .map((p) => p.subCategory)
                    .filter(Boolean),
            ]),
        ].slice(0, 8);

        return NextResponse.json({
            products,
            categories,
            stores,
            suggestions,
        });

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