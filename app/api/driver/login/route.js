import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request) {

    try {

        const {
            phone,
            password
        } = await request.json()

        const driver = await prisma.driver.findFirst({
            where: {
                phone
            }
        })

        if (!driver) {
            return NextResponse.json(
                {
                    error: "Driver not found"
                },
                {
                    status: 404
                }
            )
        }

        const match = await bcrypt.compare(
            password,
            driver.password
        )

        if (!match) {
            return NextResponse.json(
                {
                    error: "Invalid credentials"
                },
                {
                    status: 400
                }
            )
        }

        const updatedDriver =
            await prisma.driver.update({
                where: {
                    id: driver.id
                },
                data: {
                    isOnline: true,
                    isAvailable: true
                }
            })

        // Find active order
        const activeOrder =
            await prisma.order.findFirst({
                where: {
                    driverId: driver.id,
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

        // Driver already has an order
        if (activeOrder) {

            await prisma.driver.update({
                where: {
                    id: driver.id
                },
                data: {
                    isAvailable: false
                }
            })

        } else {

            await prisma.driver.update({
                where: {
                    id: driver.id
                },
                data: {
                    isAvailable: true
                }
            })

        }

        return NextResponse.json({
            success: true,
            driver: updatedDriver
        })

    } catch (error) {

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