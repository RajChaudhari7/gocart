import prisma from "@/lib/prisma";
import { openai } from "@/configs/openai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {

        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Fetch available products
        const products = await prisma.product.findMany({

            where: {
                quantity: {
                    gt: 0
                },
                isArchived: false,
                store: {
                    isActive: true
                }
            },

            include: {
                store: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }

        });

        // Convert products into AI context
        const productContext = products
            .map((p) => {

                return `
ID: ${p.id}
Name: ${p.name}
Category: ${p.category}
SubCategory: ${p.subCategory || ""}
Price: ₹${p.price}
MRP: ₹${p.mrp}
Rating: ${p.averageRating}
Featured: ${p.featured}
Store: ${p.store.name}
Description: ${p.description}
`;

            })
            .join("\n-----------------------\n");

        const messages = [

            {
                role: "system",

                content: `
You are Nandurbar Bazar AI.

You are an intelligent shopping assistant.

Your job is ONLY to recommend products from the provided catalog.

Rules:

1. NEVER invent products.

2. NEVER recommend products not present in catalog.

3. If user asks for unavailable products, politely say unavailable.

4. Recommend maximum 5 products.

5. Explain naturally.

6. Return ONLY valid JSON.

Format:

{
    "reply":"Natural response",
    "productIds":["id1","id2"]
}

Here is the product catalog:

${productContext}

`
            },

            {
                role: "user",
                content: message
            }

        ];

        const response = await openai.chat.completions.create({

            model:
                process.env.OPENAI_MODEL ||
                "gemini-3-flash-preview",

            messages,

            response_format: {
                type: "json_object"
            }

        });

        const raw =
            response.choices[0].message.content;

        let ai;

        try {

            ai = JSON.parse(raw);

        } catch {

            return NextResponse.json(
                {
                    error: "Invalid AI response"
                },
                {
                    status: 500
                }
            );

        }

        const recommendedProducts =
            await prisma.product.findMany({

                where: {
                    id: {
                        in: ai.productIds || []
                    }
                },

                include: {
                    store: true,
                    rating: true
                }

            });

        return NextResponse.json({

            reply: ai.reply,

            products: recommendedProducts

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