import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        const { productId } = await params;

        const product = await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                totalViews: {
                    increment: 1,
                },
            },
            select: {
                id: true,
                totalViews: true,
            },
        });

        return NextResponse.json(product);

    } catch (error) {

        console.log(error);

        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}