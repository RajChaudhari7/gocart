import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {

    try {

        const { searchParams } = new URL(request.url)

        const driverId = searchParams.get("driverId")

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

        return NextResponse.json({
            driver
        })

    } catch (error) {

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )

    }

}