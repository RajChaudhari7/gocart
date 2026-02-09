import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    const rawBarcode = params?.barcode
    if (!rawBarcode) {
      return NextResponse.json({ found: false })
    }

    const barcode = rawBarcode.trim()

    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const storeId = await authSeller(userId)
    if (!storeId) {
      return NextResponse.json({ error: "Store not found" }, { status: 403 })
    }

    const product = await prisma.product.findUnique({
      where: {
        barcode_storeId: {
          barcode,
          storeId,
        },
      },
    })

    return NextResponse.json({
      found: Boolean(product),
      product,
    })
  } catch (err) {
    console.error("BARCODE LOOKUP ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
