import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PATCH(req) {
    try {
        const { userId } = getAuth(req)
        const storeId = await authSeller(userId)

        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: { isActive: !store.isActive }
        })

        return NextResponse.json({
            isActive: updatedStore.isActive
        })
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 400 }
        )
    }
}
