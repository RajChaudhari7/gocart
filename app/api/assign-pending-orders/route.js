import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { calculateDistance } from "@/lib/distance"

export async function POST() {

    try {

        const pendingOrders =
            await prisma.order.findMany({
                where: {
                    status: "ORDER_PACKED",

                    assignmentStatus: {
                        in: ["NO_DRIVER", "PENDING"]
                    },

                    OR: [
                        {
                            driverId: null
                        },
                        {
                            assignmentExpiresAt: {
                                lt: new Date()
                            }
                        }
                    ]
                },
                include: {
                    store: true
                }
            })
        if (!pendingOrders.length) {
            return NextResponse.json({
                success: true,
                message: "No pending orders"
            })
        }

        let assignedCount = 0

        for (const order of pendingOrders) {

            if (
                order.assignmentExpiresAt &&
                order.assignmentExpiresAt < new Date()
            ) {
                await prisma.order.update({
                    where: {
                        id: order.id
                    },
                    data: {
                        driverId: null,
                        driverAccepted: false
                    }
                })
            }

            const drivers =
                await prisma.driver.findMany({
                    where: {

                        isOnline: true,

                        isActive: true,

                        isAvailable: true,

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
                continue
            }

            let nearestDriver = null
            let shortestDistance = Infinity

            for (const driver of drivers) {

                const distance =
                    calculateDistance(
                        Number(order.store.latitude),
                        Number(order.store.longitude),
                        Number(driver.latitude),
                        Number(driver.longitude)
                    )

                if (distance < shortestDistance) {

                    shortestDistance = distance
                    nearestDriver = driver
                }
            }

            if (!nearestDriver) {
                continue
            }

            await prisma.order.update({
                where: {
                    id: order.id
                },
                data: {
                    driverId: nearestDriver.id,

                    driverAccepted: false,

                    assignmentStatus: "PENDING",

                    assignedAt: new Date(),

                    assignmentExpiresAt: new Date(
                        Date.now() + 60 * 1000 // 1 minute
                    )
                }
            })

            assignedCount++
        }

        return NextResponse.json({
            success: true,
            assignedCount
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