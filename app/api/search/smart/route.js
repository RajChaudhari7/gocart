import prisma from "@/lib/prisma";
import { openai } from "@/configs/openai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { query } = await request.json();

        if (!query?.trim()) {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 }
            );
        }

        let aiSearch = {
            keywords: [query.toLowerCase()],
            category: "",
            subCategory: "",
            minPrice: 0,
            maxPrice: 999999,
            sort: "POPULAR",
        };

        // ---------- AI SEARCH ----------
        try {
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gemini-3-flash-preview",

                messages: [
                    {
                        role: "system",
                        content: `
You are an AI shopping assistant.

Convert the user's shopping query into JSON ONLY.

Return exactly:

{
  "keywords":[""],
  "category":"",
  "subCategory":"",
  "minPrice":0,
  "maxPrice":999999,
  "sort":"POPULAR"
}

sort can be:
POPULAR
PRICE_LOW
PRICE_HIGH
RATING

Return ONLY JSON.
`,
                    },
                    {
                        role: "user",
                        content: query,
                    },
                ],
            });

            const raw = completion.choices?.[0]?.message?.content || "";

            const jsonMatch = raw.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                aiSearch = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.log("AI Parsing Failed");
            console.log(e.message);
        }

        //-----------------------------------
        // Fetch Products
        //-----------------------------------

        const products = await prisma.product.findMany({
            where: {
                quantity: {
                    gt: 0,
                },

                isArchived: false,

                store: {
                    isActive: true,
                },

                price: {
                    gte: aiSearch.minPrice || 0,
                    lte: aiSearch.maxPrice || 999999,
                },
            },

            include: {
                store: true,
                rating: true,
            },
        });

        const keywords = (aiSearch.keywords || []).map((k) =>
            k.toLowerCase()
        );

        //-----------------------------------
        // Score Products
        //-----------------------------------

        const scored = products.map((product) => {
            let score = 0;

            const name = (product.name || "").toLowerCase();

            const description = (product.description || "").toLowerCase();

            const category = (product.category || "").toLowerCase();

            const subCategory = (product.subCategory || "").toLowerCase();

            keywords.forEach((keyword) => {
                if (name.includes(keyword)) score += 120;

                if (description.includes(keyword)) score += 60;

                if (category.includes(keyword)) score += 80;

                if (subCategory.includes(keyword)) score += 90;
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

            score += (product.totalSales || 0) * 3;

            score += (product.averageRating || 0) * 25;

            score += (product.totalViews || 0) * 0.2;

            if (product.featured) score += 100;

            return {
                ...product,
                score,
            };
        });

        //-----------------------------------
        // Sorting
        //-----------------------------------

        switch (aiSearch.sort) {
            case "PRICE_LOW":
                scored.sort((a, b) => a.price - b.price);
                break;

            case "PRICE_HIGH":
                scored.sort((a, b) => b.price - a.price);
                break;

            case "RATING":
                scored.sort(
                    (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
                );
                break;

            default:
                scored.sort((a, b) => b.score - a.score);
        }

        return NextResponse.json({
            products: scored.slice(0, 30),
        });
    } catch (error) {
        console.log("SMART SEARCH ERROR");
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