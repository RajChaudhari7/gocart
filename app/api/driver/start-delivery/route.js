import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {

    const { orderId } = await req.json();

    const order = await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status: "OUT_FOR_DELIVERY",
            pickedAt: new Date(),
        },
    });

    return NextResponse.json(order);
}