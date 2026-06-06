import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {

    const {
        orderId,
        status,
    } = await req.json();

    await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status,
        },
    });

    return NextResponse.json({
        success: true,
    });
}