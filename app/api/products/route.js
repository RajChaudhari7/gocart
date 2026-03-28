import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// ================= GET USER PRODUCTS =================
export async function GET(request) {
    try {
        let products = await prisma.product.findMany({
            where: {
                quantity: {
                    gt: 0, // ✅ only show in-stock products
                },
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

        // remove products with inactive store
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
