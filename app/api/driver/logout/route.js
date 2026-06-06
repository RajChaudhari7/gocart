import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {

    try {

        const { driverId } = await request.json()

        await prisma.driver.update({
            where: {
                id: driverId
            },
            data: {
                isOnline: false
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