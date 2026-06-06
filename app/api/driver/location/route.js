import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {

    const {
        driverId,
        latitude,
        longitude,
    } = await req.json();

    await prisma.driver.update({
        where: {
            id: driverId,
        },
        data: {
            latitude,
            longitude,
            isOnline: true,
        },
    });

    return NextResponse.json({
        success: true,
    });
}