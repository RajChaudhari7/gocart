import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req) {
    try {
        const { userId } = getAuth(req)
        const storeId = await authSeller(userId)

        const count = await prisma.order.count({
            where: {
                storeId,
                status: {
                    in: ["ORDER_PLACED"]
                }
            }
        })

        return NextResponse.json({ count })
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}