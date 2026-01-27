import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { imagekit } from "@/configs/imageKit";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const formData = await request.formData();

        const orderId = formData.get("orderId");
        const productId = formData.get("productId");
        const rating = Number(formData.get("rating"));
        const review = formData.get("review");
        const photos = formData.getAll("photos"); // ✅ MULTIPLE FILES

        if (!orderId || !productId || !rating || !review)
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.userId !== userId)
            return NextResponse.json(
                { error: "Order not found or unauthorized" },
                { status: 404 }
            );

        const alreadyRated = await prisma.rating.findFirst({
            where: { productId, orderId },
        });
        if (alreadyRated)
            return NextResponse.json({ error: "Already rated" }, { status: 400 });

        const uploadedUrls = [];

        for (const file of photos) {
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const upload = await imagekit.upload({
                    file: buffer,
                    fileName: `review-${Date.now()}-${file.name}`,
                    folder: "/reviews",
                });
                uploadedUrls.push(upload.url);
            }
        }

        const response = await prisma.rating.create({
            data: {
                userId,
                productId,
                orderId,
                rating,
                review,
                photos: uploadedUrls,
            },
            include: { user: true },
        });

        return NextResponse.json({
            message: "Rating added successfully",
            rating: response,
        });
    } catch (error) {
        console.error("POST /rating error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}


export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const ratings = await prisma.rating.findMany({
            where: { userId },
            include: { user: true },
        });

        return NextResponse.json({ ratings });
    } catch (error) {
        console.error("GET /rating error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
