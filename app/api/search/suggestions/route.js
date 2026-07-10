import prisma from "@/lib/prisma";
import { openai } from "@/configs/openai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { query } = await request.json();

        if (!query || query.trim() === "") {
            return NextResponse.json({
                products: [],
                categories: [],
                stores: [],
                suggestions: [],
            });
        }

        // ----------------------------
        // AI understands the query
        // ----------------------------

        const ai = await openai.chat.completions.create({
            model:
                process.env.OPENAI_MODEL ||
                "gemini-3-flash-preview",

            messages: [
                {
                    role: "system",
                    content: `
You are an ecommerce search assistant.

Return ONLY JSON.

Schema:

{
 "keywords":[]
}

Example:

User:
bat

Output

{
 "keywords":["bat","cricket bat","sports"]
}
`,
                },
                {
                    role: "user",
                    content: query,
                },
            ],

            response_format: {
                type: "json_object",
            },
        });

        let keywords = [];

        try {
            keywords =
                JSON.parse(ai.choices[0].message.content)
                    .keywords || [];
        } catch {
            keywords = [query];
        }

        keywords.push(query);

        // remove duplicates
        keywords = [...new Set(keywords)];

        //----------------------------------------
        // Products
        //----------------------------------------

        const products = await prisma.product.findMany({
            where: {
                quantity: {
                    gt: 0,
                },

                isArchived: false,

                store: {
                    isActive: true,
                },

                OR: keywords.flatMap((k) => [
                    {
                        name: {
                            contains: k,
                            mode: "insensitive",
                        },
                    },
                    {
                        description: {
                            contains: k,
                            mode: "insensitive",
                        },
                    },
                    {
                        category: {
                            contains: k,
                            mode: "insensitive",
                        },
                    },
                    {
                        subCategory: {
                            contains: k,
                            mode: "insensitive",
                        },
                    },
                ]),
            },

            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },

            take: 6,
        });

        //----------------------------------------
        // Categories
        //----------------------------------------

        const categories = [
            ...new Set(
                products
                    .map((p) => p.category)
                    .filter(Boolean)
            ),
        ];

        //----------------------------------------
        // Stores
        //----------------------------------------

        const stores = [
            ...new Map(
                products.map((p) => [
                    p.store.id,
                    p.store,
                ])
            ).values(),
        ];

        //----------------------------------------
        // AI Suggestions
        //----------------------------------------

        const suggestions = [
            ...new Set([
                ...keywords,
                ...products.map((p) => p.name),
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