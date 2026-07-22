import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const ACTIVE_DELIVERY_STATUSES = [
    "DRIVER_ASSIGNED",
    "REACHED_SHOP",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERY_INITIATED",
];

export async function GET(request) {
    try {
        const { searchParams } =
            new URL(request.url);

        const driverId =
            searchParams.get("driverId");

        if (!driverId) {
            return NextResponse.json(
                {
                    error: "Driver ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const driver =
            await prisma.driver.findUnique({
                where: {
                    id: driverId,
                },
            });

        if (!driver) {
            return NextResponse.json(
                {
                    error: "Driver not found",
                },
                {
                    status: 404,
                }
            );
        }

        const activeOrder =
            await prisma.order.findFirst({
                where: {
                    driverId,
                    status: {
                        in: ACTIVE_DELIVERY_STATUSES,
                    },
                },
                include: {
                    store: true,
                    address: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

        return NextResponse.json({
            success: true,
            driver,
            activeOrder,
        });
    } catch (error) {
        console.error(
            "Driver profile error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to load driver profile",
            },
            {
                status: 500,
            }
        );
    }
}