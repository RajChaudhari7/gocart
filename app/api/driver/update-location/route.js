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

        await prisma.driver.update({
            where: {
                id: driverId
            },
            data: {
                latitude,
                longitude
            }
        })

        return NextResponse.json({
            success: true
        })

    } catch (error) {

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )

    }

}