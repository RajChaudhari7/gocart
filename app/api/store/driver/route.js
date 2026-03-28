import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req) {
  try {
    const { userId } = getAuth(req)
    const storeId = await authSeller(userId)

    const drivers = await prisma.driver.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ drivers })

  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}