import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {

    try {

        const {
            driverId,
            latitude,
            longitude
        } = await request.json()

        if (!driverId) {
            return NextResponse.json(
                { error: "Driver ID required" },
                { status: 400 }
            )
        }

        console.log("LOCATION UPDATE:", {
            driverId,
            latitude,
            longitude
        })

        await prisma.driver.update({
            where: {
                id: driverId
            },
            data: {
                latitude: Number(latitude),
                longitude: Number(longitude)
            }
        })

        const updatedDriver =
            await prisma.driver.findUnique({
                where: {
                    id: driverId
                }
            })

        console.log(
            "DRIVER SAVED:",
            updatedDriver.latitude,
            updatedDriver.longitude
        )

        return NextResponse.json({
            success: true
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