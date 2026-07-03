import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {

    try {

        const { driverId } = await request.json();

        // Check active order
        const activeOrder = await prisma.order.findFirst({
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
        });

        if (activeOrder) {
            return NextResponse.json(
                {
                    error: "You cannot logout while an order is active."
                },
                {
                    status: 400
                }
            );
        }

        await prisma.driver.update({
            where: {
                id: driverId
            },
            data: {
                isOnline: false,
                isAvailable: true,
                sessionId: null
            }
        });

        return NextResponse.json({
            success: true
        });

    } catch (error) {

        return NextResponse.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        );

    }

}