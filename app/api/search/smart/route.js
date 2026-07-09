import prisma from "@/lib/prisma";
import { openai } from "@/configs/openai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {

        const { query } = await request.json();

        if (!query || query.trim() === "") {
            return NextResponse.json(
                {
                    error: "Search query is required"
                },
                {
                    status: 400
                }
            );
        }

        //---------------------------------------
        // AI understands search intent
        //---------------------------------------

        const messages = [

            {

                role: "system",

                content: `

You are Nandurbar Bazar AI.

Convert user's shopping query into JSON.

Return ONLY JSON.

Schema:

{
    "keywords":[""],
    "category":"",
    "subCategory":"",
    "minPrice":0,
    "maxPrice":999999,
    "sort":"POPULAR"
}

Rules:

1. keywords should contain useful search words.

2. category should match if obvious.

3. subCategory if possible.

4. If no price mentioned,
minPrice=0,
maxPrice=999999.

5. sort can be

POPULAR
PRICE_LOW
PRICE_HIGH
RATING

Examples:

User:
Protein for gym under 2000

Output:

{
"keywords":["protein","whey","gym"],
"category":"Food & Drink",
"subCategory":"Protein",
"minPrice":0,
"maxPrice":2000,
"sort":"POPULAR"
}

User:
Cheap shampoo

{
"keywords":["shampoo"],
"category":"Beauty & Health",
"subCategory":"Hair Care",
"minPrice":0,
"maxPrice":999999,
"sort":"PRICE_LOW"
}

`

            },

            {

                role: "user",

                content: query

            }

        ];

        const aiResponse =
            await openai.chat.completions.create({

                model:
                    process.env.OPENAI_MODEL ||
                    "gemini-3-flash-preview",

                messages,

                response_format: {
                    type: "json_object"
                }

            });

        let aiSearch;

        try {

            aiSearch = JSON.parse(
                aiResponse.choices[0].message.content
            );

        } catch {

            aiSearch = {

                keywords: [query],

                category: "",

                subCategory: "",

                minPrice: 0,

                maxPrice: 999999,

                sort: "POPULAR"

            };

        }

        //---------------------------------------
        // Search Products
        //---------------------------------------

        const products = await prisma.product.findMany({

            where: {

                quantity: {
                    gt: 0
                },

                isArchived: false,

                store: {
                    isActive: true
                },

                price: {

                    gte:
                        aiSearch.minPrice || 0,

                    lte:
                        aiSearch.maxPrice || 999999

                }

            },

            include: {

                store: true,

                rating: true

            }

        });

        //---------------------------------------
        // Semantic Scoring
        //---------------------------------------

        const keywords =
            (aiSearch.keywords || [])
                .map(k => k.toLowerCase());

        const scoredProducts =
            products.map(product => {

                let score = 0;

                const name =
                    product.name.toLowerCase();

                const description =
                    product.description.toLowerCase();

                const category =
                    (product.category || "")
                        .toLowerCase();

                const subCategory =
                    (product.subCategory || "")
                        .toLowerCase();

                keywords.forEach(keyword => {

                    if (name.includes(keyword))
                        score += 100;

                    if (description.includes(keyword))
                        score += 40;

                    if (category.includes(keyword))
                        score += 70;

                    if (subCategory.includes(keyword))
                        score += 80;

                });

                if (
                    aiSearch.category &&
                    product.category === aiSearch.category
                ) {

                    score += 150;

                }

                if (
                    aiSearch.subCategory &&
                    product.subCategory === aiSearch.subCategory
                ) {

                    score += 200;

                }

                score +=
                    product.totalSales * 2;

                score +=
                    product.averageRating * 20;

                if (product.featured)
                    score += 80;

                return {

                    ...product,

                    score

                };

            });

        //---------------------------------------
        // Sorting
        //---------------------------------------

        switch (aiSearch.sort) {

            case "PRICE_LOW":

                scoredProducts.sort(
                    (a, b) => a.price - b.price
                );

                break;

            case "PRICE_HIGH":

                scoredProducts.sort(
                    (a, b) => b.price - a.price
                );

                break;

            case "RATING":

                scoredProducts.sort(
                    (a, b) =>
                        b.averageRating -
                        a.averageRating
                );

                break;

            default:

                scoredProducts.sort(
                    (a, b) =>
                        b.score - a.score
                );

        }

        return NextResponse.json({

            intent: aiSearch,

            products:
                scoredProducts.slice(0, 30)

        });

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