import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req) {
    try {
        const { userId } = getAuth(req)

        const store = await prisma.store.findFirst({
            where: { userId }
        })

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        return NextResponse.json(store)

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}