import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {

        const { driverId } = await request.json()

        if (!driverId) {
            return NextResponse.json(
                { error: "Driver ID required" },
                { status: 400 }
            )
        }

        const driver = await prisma.driver.findUnique({
            where: {
                id: driverId
            }
        })

        if (!driver) {
            return NextResponse.json(
                { error: "Driver not found" },
                { status: 404 }
            )
        }

        const updatedDriver = await prisma.driver.update({
            where: {
                id: driverId
            },
            data: {
                isOnline: !driver.isOnline
            }
        })

        return NextResponse.json({
            success: true,
            isOnline: updatedDriver.isOnline
        })

    } catch (error) {

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )

    }
}