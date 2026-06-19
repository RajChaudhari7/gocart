import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { calculateDistance } from "@/lib/distance"

export async function POST(request) {

    try {

        const {
            orderId,
            currentDriverId
        } = await request.json()

        const order =
            await prisma.order.findUnique({
                where: {
                    id: orderId
                },
                include: {
                    store: true
                }
            })

        if (!order) {
            return NextResponse.json(
                {
                    error: "Order not found"
                },
                {
                    status: 404
                }
            )
        }

        const drivers = await prisma.driver.findMany({
            where: {
                isOnline: true,
                isActive: true,
                isAvailable: true,

                id: {
                    not: currentDriverId
                },

                latitude: {
                    not: null
                },

                longitude: {
                    not: null
                },

                orders: {
                    none: {
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
                }
            }
        })

        if (!drivers.length) {

            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    driverId: null,
                    assignmentStatus: "NO_DRIVER"
                }
            })

            return NextResponse.json(
                {
                    error: "No available drivers"
                },
                {
                    status: 404
                }
            )
        }

        let nearestDriver = null
        let shortestDistance = Infinity

        for (const driver of drivers) {

            const distance =
                calculateDistance(
                    order.store.latitude,
                    order.store.longitude,
                    driver.latitude,
                    driver.longitude
                )

            if (distance < shortestDistance) {

                shortestDistance =
                    distance

                nearestDriver =
                    driver
            }
        }

        if (!nearestDriver) {

            return NextResponse.json(
                {
                    error: "No suitable driver found"
                },
                {
                    status: 404
                }
            )
        }

        if (order.reassignCount >= 5) {

            await prisma.order.update({
                where: { id: orderId },
                data: {
                    assignmentStatus: "NO_DRIVER",
                    driverId: null
                }
            })

            return NextResponse.json({
                error: "No driver accepted order"
            })
        }

        await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                driverId: nearestDriver.id,

                driverAccepted: false,

                assignmentStatus: "PENDING",

                assignmentExpiresAt: new Date(
                    Date.now() + 10000
                ),

                assignedAt: new Date(),

                // Keep order waiting for driver acceptance
                status: "ORDER_PACKED",

                reassignCount: {
                    increment: 1
                }
            }
        })

        return NextResponse.json({
            success: true,
            driver: nearestDriver
        })

    } catch (error) {

        console.error(error)

        return NextResponse.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        )
    }
}