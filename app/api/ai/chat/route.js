import prisma from "@/lib/prisma";
import { openai } from "@/configs/openai";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(request) {
    try {

        const { message } = await request.json();
        const { userId } = getAuth(request);

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

        let orderContext = "User is not logged in.";

        if (userId) {

            const orders = await prisma.order.findMany({

                where: {
                    userId
                },

                include: {

                    store: {
                        select: {
                            name: true
                        }
                    },

                    driver: {
                        select: {
                            name: true,
                            vehicle: true,
                            vehicleNo: true
                        }
                    },

                    orderItems: {

                        include: {

                            product: {

                                select: {

                                    id: true,
                                    name: true,
                                    category: true,
                                    price: true

                                }

                            }

                        }

                    }

                },

                orderBy: {
                    createdAt: "desc"
                },

                take: 20

            });

            orderContext = orders.map(order => {

                return `

Order ID: ${order.id}

Status: ${order.status}

Total: ₹${order.total}

Payment: ${order.paymentMethod}

Store: ${order.store?.name || "Unknown"}

Driver: ${order.driver?.name || "Not Assigned"}

Products:

${order.orderItems.map(item =>
                    `- ${item.product.name} x${item.quantity}`
                ).join("\n")}

`;

            }).join("\n====================\n");

        }

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

You help users with:

• Finding products
• Comparing products
• Recommending products
• Checking order status
• Delivery information
• Previous purchases
• Store information
• Driver information

Rules:

1. NEVER invent products.

2. NEVER invent orders.

3. Use ONLY the provided catalog and order history.

4. If user asks about products,
search Product Catalog.

5. If user asks about orders,
search Order History.

6. Recommend maximum 5 products.

7. If information is unavailable,
politely say so.

Return ONLY JSON.

Format:

{
    "reply":"Natural response",
    "productIds":["id1","id2"]
}

========================
PRODUCT CATALOG
========================

${productContext}

========================
ORDER HISTORY
========================

${orderContext}

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

        let recommendedProducts = [];

        if (ai.productIds?.length) {

            recommendedProducts =
                await prisma.product.findMany({

                    where: {
                        id: {
                            in: ai.productIds
                        }
                    },

                    include: {
                        store: true,
                        rating: true
                    }

                });

        }
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