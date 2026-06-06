import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {

    const { searchParams } =
        new URL(req.url);

    const driverId =
        searchParams.get("driverId");

    const orders =
        await prisma.order.findMany({
            where: {
                driverId,
            },
            include: {
                user: true,
                address: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

    return NextResponse.json(
        orders
    );
}