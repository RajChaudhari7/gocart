import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    // ✅ FIX: param name MUST match folder name
    let { code } = params

    if (!code) {
      return NextResponse.json({ found: false })
    }

    const barcode = code.trim()

    const { userId } = getAuth(req)
    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: {
        barcode_storeId: {
          barcode,
          storeId,
        },
      },
    })

    console.log("BARCODE LOOKUP:", barcode, "STORE:", storeId, "FOUND:", !!product)

    return NextResponse.json({
      found: Boolean(product),
      product: product ?? null,
    })
  } catch (error) {
    console.error("BARCODE LOOKUP ERROR:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
