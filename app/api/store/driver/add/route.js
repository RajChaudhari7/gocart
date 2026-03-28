import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

/* ================= ADD DRIVER ================= */
export async function POST(req) {
  try {
    const { userId } = getAuth(req)
    const storeId = await authSeller(userId)

    const { name, phone, vehicle } = await req.json()

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      )
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        phone,
        vehicle,
        storeId
      }
    })

    return NextResponse.json({ driver })
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
