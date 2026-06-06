import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request) {

    const { userId } = getAuth(request)

    const { latitude, longitude } = await request.json()

    const store = await prisma.store.findFirst({
        where: { userId }
    })

    await prisma.store.update({
        where: { id: store.id },
        data: {
            latitude,
            longitude
        }
    })

    return NextResponse.json({
        success: true
    })
}