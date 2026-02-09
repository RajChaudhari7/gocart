import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    const { barcode } = params

    if (!barcode) {
      return NextResponse.json(
        { error: "Barcode is required" },
        { status: 400 }
      )
    }

    // ✅ CORRECT WAY IN APP ROUTER
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 403 }
      )
    }

    // 🔍 STRICT: barcode + storeId
    const product = await prisma.product.findUnique({
      where: {
        barcode_storeId: {
          barcode,
          storeId,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { found: false },
        { status: 200 } // ✅ IMPORTANT (not 404)
      )
    }

    return NextResponse.json({
      found: true,
      product,
    })

  } catch (error) {
    console.error("BARCODE LOOKUP ERROR:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
