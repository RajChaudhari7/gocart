import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { authSeller } from "@/middlewares/authSeller"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  const { barcode } = params
  const { userId } = getAuth(req)
  const storeId = await authSeller(userId)

  if (!storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 🔍 CHECK YOUR OWN DATABASE FIRST
  const product = await prisma.product.findFirst({
    where: {
      barcode,
      storeId,
    },
  })

  if (product) {
    return NextResponse.json({
      found: true,
      source: "local",
      product,
    })
  }

  // OPTIONAL: external API later
  return NextResponse.json(
    { found: false },
    { status: 404 }
  )
}
