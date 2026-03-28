import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search")

        let products = await prisma.product.findMany({
            where: {
                quantity: {
                    gt: 0,
                },
                ...(search && {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }),
            },
            include: {
                rating: {
                    select: {
                        createdAt: true,
                        rating: true,
                        review: true,
                        user: { select: { name: true, image: true } },
                    },
                },
                store: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // remove inactive stores
        products = products.filter((product) => product.store.isActive);

        return NextResponse.json({ products });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
}