import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const settings =
        await prisma.platformSettings.findFirst() || {
            commissionPercent: 10,
            deliveryFee: 50,
            driverFee: 30,
            freeDeliveryAbove: 999999
        };

    return NextResponse.json(settings);
}