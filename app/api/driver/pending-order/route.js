import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(1);
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get("driverId");
    const driverLat = parseFloat(searchParams.get("lat"));
    const driverLng = parseFloat(searchParams.get("lng"));

    // Check if driver already has an active order
    const activeOrder =
        await prisma.order.findFirst({
            where: {
                driverId,
                status: {
                    in: [
                        "DRIVER_ASSIGNED",
                        "REACHED_SHOP",
                        "PICKED_UP",
                        "OUT_FOR_DELIVERY",
                        "DELIVERY_INITIATED"
                    ]
                }
            }
        })

    if (activeOrder) {
        return NextResponse.json({
            order: null
        })
    }

    const order = await prisma.order.findFirst({
        where: {
            driverId,
            driverAccepted: false,
            assignmentStatus: "PENDING",
            assignmentExpiresAt: { gt: new Date() }
        },
        include: { store: true }
    });

    if (order && driverLat && driverLng) {
        const distanceToStore = getDistance(driverLat, driverLng, order.store.lat, order.store.lng);
        return NextResponse.json({ order: { ...order, distanceToStore } });
    }

    return NextResponse.json({ order });
}
