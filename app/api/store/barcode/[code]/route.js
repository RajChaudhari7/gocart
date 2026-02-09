import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    let { barcode } = params

    if (!barcode) {
      return NextResponse.json({ found: false })
    }

    barcode = barcode.trim() // 🔥 VERY IMPORTANT

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

    console.log("LOOKUP:", { barcode, storeId, found: !!product })

    return NextResponse.json({
      found: !!product,
      product: product || null,
    })
  } catch (err) {
    console.error("BARCODE LOOKUP ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
