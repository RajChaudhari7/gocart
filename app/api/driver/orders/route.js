import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { calculateDistance } from "@/lib/distance"

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const driverId = searchParams.get("driverId")

        if (!driverId) {
            return NextResponse.json(
                { error: "Driver ID required" },
                { status: 400 }
            )
        }

        const driver = await prisma.driver.findUnique({
            where: { id: driverId }
        })

        const orders = await prisma.order.findMany({
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
            },
            include: {
                user: true,
                address: true,
                store: true,
                orderItems: {
                    include: { product: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        const ordersWithDistance = orders.map(order => ({
            ...order,

            distanceToStore:
                driver?.latitude &&
                    driver?.longitude &&
                    order.store?.latitude &&
                    order.store?.longitude
                    ? calculateDistance(
                        Number(driver.latitude),
                        Number(driver.longitude),
                        Number(order.store.latitude),
                        Number(order.store.longitude)
                    )
                    : null,

            distanceToCustomer:
                driver?.latitude &&
                    driver?.longitude &&
                    order.address?.latitude &&
                    order.address?.longitude
                    ? calculateDistance(
                        Number(driver.latitude),
                        Number(driver.longitude),
                        Number(order.address.latitude),
                        Number(order.address.longitude)
                    )
                    : null
        }))

        return NextResponse.json({
            orders: ordersWithDistance
        })

    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}