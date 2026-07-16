import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {

    try {

        const { productId } = params;

        const body = await req.json();

        const {
            featured,
            featuredPriority,
        } = body;

        const product = await prisma.product.update({

            where: {
                id: productId,
            },

            data: {

                ...(featured !== undefined && {
                    featured,
                }),

                ...(featuredPriority !== undefined && {
                    featuredPriority: Number(featuredPriority),
                }),

            },

        });

        return NextResponse.json(product);

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