import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const ACTIVE_DELIVERY_STATUSES = [
    "DRIVER_ASSIGNED",
    "REACHED_SHOP",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERY_INITIATED",
];

export async function POST(request) {
    try {
        const { driverId } = await request.json();

        if (!driverId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Driver ID is required",
                },
                {
                    status: 400,
                }
            );
        }

        const driver = await prisma.driver.findUnique({
            where: {
                id: driverId,
            },
        });

        if (!driver) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Driver not found",
                },
                {
                    status: 404,
                }
            );
        }

        /*
         * Only check for an active delivery when the
         * driver is trying to go offline.
         */
        if (driver.isOnline) {
            const activeOrder = await prisma.order.findFirst({
                where: {
                    driverId,
                    status: {
                        in: ACTIVE_DELIVERY_STATUSES,
                    },
                },
                select: {
                    id: true,
                    status: true,
                },
            });

            if (activeOrder) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Complete your active delivery before going offline.",
                        activeOrder,
                    },
                    {
                        status: 409,
                    }
                );
            }
        }

        const updatedDriver = await prisma.driver.update({
            where: {
                id: driverId,
            },
            data: {
                isOnline: !driver.isOnline,

                /*
                 * Keep this only if your Driver model
                 * contains isAvailable.
                 */
                isAvailable: !driver.isOnline,
            },
            select: {
                id: true,
                name: true,
                isOnline: true,
                isAvailable: true,
                profilePhoto: true,
                averageRating: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: updatedDriver.isOnline
                ? "You are now online"
                : "You are now offline",
            isOnline: updatedDriver.isOnline,
            driver: updatedDriver,
        });
    } catch (error) {
        console.error("Driver status update failed:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to update driver status",
            },
            {
                status: 500,
            }
        );
    }
}