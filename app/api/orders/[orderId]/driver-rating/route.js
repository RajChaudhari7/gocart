import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { orderId } = await params;
        const { rating, review } = await request.json();

        const ratingValue = Number(rating);

        if (
            !Number.isInteger(ratingValue) ||
            ratingValue < 1 ||
            ratingValue > 5
        ) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId
            },
            select: {
                id: true,
                status: true,
                driverId: true
            }
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        if (order.status !== "DELIVERED") {
            return NextResponse.json(
                {
                    error: "You can rate the driver only after delivery"
                },
                { status: 400 }
            );
        }

        if (!order.driverId) {
            return NextResponse.json(
                { error: "No driver assigned to this order" },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const driverRating = await tx.driverRating.create({
                data: {
                    rating: ratingValue,
                    review: review?.trim() || null,
                    driverId: order.driverId,
                    orderId: order.id,
                    userId
                }
            });

            const ratingStats = await tx.driverRating.aggregate({
                where: {
                    driverId: order.driverId
                },
                _avg: {
                    rating: true
                },
                _count: {
                    rating: true
                }
            });

            const driver = await tx.driver.update({
                where: {
                    id: order.driverId
                },
                data: {
                    averageRating: ratingStats._avg.rating || 0,
                    totalRatings: ratingStats._count.rating
                },
                select: {
                    id: true,
                    averageRating: true,
                    totalRatings: true,
                    totalDeliveries: true
                }
            });

            return {
                driverRating,
                driver
            };
        });

        return NextResponse.json({
            success: true,
            message: "Driver rated successfully",
            rating: result.driverRating,
            driver: result.driver
        });
    } catch (error) {
        console.error("DRIVER_RATING_ERROR:", error);

        if (error.code === "P2002") {
            return NextResponse.json(
                {
                    error: "You have already rated this driver for this order"
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                error: error.message || "Failed to rate driver"
            },
            { status: 500 }
        );
    }
}