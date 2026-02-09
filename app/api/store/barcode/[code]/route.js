import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { authSeller } from "@/middlewares/authSeller"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    /* ================= AUTH ================= */
    const { userId } = getAuth(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /* ================= BARCODE NORMALIZATION ================= */
    const rawBarcode = params?.barcode

    if (!rawBarcode) {
      return NextResponse.json(
        { error: "Barcode is required" },
        { status: 400 }
      )
    }

    const barcode = rawBarcode.trim()

    /* ================= LOOKUP (STORE-SCOPED) ================= */
    const product = await prisma.product.findFirst({
      where: {
        barcode,
        storeId, // 🔒 MULTI-VENDOR SAFE
      },
      select: {
        id: true,
        name: true,
        description: true,
        mrp: true,
        price: true,
        category: true,
        quantity: true,
        images: true,
        barcode: true,
      },
    })

    /* ================= FOUND ================= */
    if (product) {
      return NextResponse.json({
        found: true,
        source: "local",
        product,
      })
    }

    /* ================= NOT FOUND ================= */
    return NextResponse.json(
      { found: false },
      { status: 404 }
    )

  } catch (error) {
    console.error("BARCODE LOOKUP ERROR:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
