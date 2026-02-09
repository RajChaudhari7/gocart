import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { authSeller } from "@/middlewares/authSeller"

export async function GET(req, { params }) {
  const { userId } = getAuth(req)
  const storeId = await authSeller(userId)

  if (!storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { barcode } = params

  if (!barcode) {
    return NextResponse.json({ error: "Barcode required" }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { barcode }
  })

  if (!product) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({
    found: true,
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.images?.[0] || null
  })
}
