import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { orderId } = await req.json();

    const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
    });

    return NextResponse.json({ success: true, order });
}