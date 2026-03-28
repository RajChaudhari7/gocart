import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { authSeller } from "@/middlewares/authSeller"
import { NextResponse } from "next/server"

export async function PATCH(req) {
  try {
    const { userId } = getAuth(req)
    await authSeller(userId)

    const { orderId, driverId } = await req.json()

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { driverId }
    })

    return NextResponse.json({ order })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}