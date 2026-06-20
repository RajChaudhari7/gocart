import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const driverId = searchParams.get("driverId");

        if (!driverId) {
            return NextResponse.json({ error: "Driver ID is required" }, { status: 400 });
        }

        // Fetch only the coordinates to keep the payload extremely lightweight for constant polling
        const driver = await prisma.driver.findUnique({
            where: { id: driverId },
            select: {
                latitude: true,
                longitude: true
            }
        });

        if (!driver) {
            return NextResponse.json({ error: "Driver not found" }, { status: 404 });
        }

        return NextResponse.json({
            latitude: driver.latitude,
            longitude: driver.longitude
        });

    } catch (error) {
        console.error("Error fetching driver location:", error);
        return NextResponse.json(
            { error: "Failed to fetch driver location" },
            { status: 500 }
        );
    }
}