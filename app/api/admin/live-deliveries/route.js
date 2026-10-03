import prisma from "@/lib/prisma"
import { authAdmin } from "@/middlewares/authAdmin"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const ACTIVE_STATUSES = [
    "DRIVER_ASSIGNED",
    "REACHED_SHOP",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERY_INITIATED",
]

export async function GET(request) {
    try {

        const { userId } = getAuth(request)

        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({
                error: "Not authorized"
            },
                {
                    status: 401
                }
            )
        }

        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: ACTIVE_STATUSES,
                },
            },

            orderBy: {
                updatedAt: "desc",
            },

            select: {
                id: true,
                status: true,
                total: true,
                createdAt: true,
                updatedAt: true,

                driverId: true,

                driver: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        vehicle: true,
                        vehicleNo: true,
                        latitude: true,
                        longitude: true,
                        locationUpdatedAt: true,
                        isOnline: true,
                        isAvailable: true,
                    },
                },

                store: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        latitude: true,
                        longitude: true,
                    },
                },

                address: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        street: true,
                        city: true,
                        state: true,
                        zip: true,
                        latitude: true,
                        longitude: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            orders,
        })

    } catch (error) {

        console.error("Admin live deliveries error:", error)

        return NextResponse.json({
            error: "Failed to fetch live deliveries",
        },
            {
                status: 500,
            }
        )
    }
}