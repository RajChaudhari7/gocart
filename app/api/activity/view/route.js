import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({});
        }

        const { productId } = await req.json();

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            return NextResponse.json(
                {
                    error: "Product not found"
                },
                {
                    status: 404
                }
            );
        }

        await prisma.$transaction([

            prisma.productView.create({

                data: {

                    userId,

                    productId,

                    category: product.category,

                    subCategory: product.subCategory,

                },

            }),

            prisma.product.update({

                where: {
                    id: productId,
                },

                data: {
                    totalViews: {
                        increment: 1,
                    },
                },

            }),

        ]);

        return NextResponse.json({
            success: true
        });

    } catch (e) {

        console.log(e);

        return NextResponse.json(
            {
                error: e.message
            },
            {
                status: 500
            }
        );

    }
}