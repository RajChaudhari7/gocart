export const runtime = "nodejs" // 🔥 REQUIRED FOR BUFFER + IMAGE UPLOADS

import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { imagekit } from "@/configs/imageKit"

const MAX_PHOTOS = 5

/* ========================== POST: CREATE RATING ========================== */
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()

    const orderId = formData.get("orderId")
    const productId = formData.get("productId")
    const rating = Number(formData.get("rating"))
    const review = formData.get("review")
    const photos = formData.getAll("photos") || []

    /* -------------------- Basic Validation -------------------- */
    if (!orderId || !productId || !review || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      )
    }

    if (photos.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_PHOTOS} photos` },
        { status: 400 }
      )
    }

    /* -------------------- Validate Order + Ownership -------------------- */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          select: { productId: true },
        },
      },
    })

    if (!order || order.userId !== userId) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      )
    }

    /* -------------------- Ensure Product Belongs To Order -------------------- */
    const productInOrder = order.orderItems.some(
      (item) => item.productId === productId
    )

    if (!productInOrder) {
      return NextResponse.json(
        { error: "This product does not belong to this order" },
        { status: 400 }
      )
    }

    /* -------------------- Prevent Duplicate Rating -------------------- */
    const alreadyRated = await prisma.rating.findUnique({
      where: {
        userId_productId_orderId: {
          userId,
          productId,
          orderId,
        },
      },
    })

    if (alreadyRated) {
      return NextResponse.json(
        { error: "You have already rated this product for this order" },
        { status: 400 }
      )
    }

    /* -------------------- Upload Images -------------------- */
    const uploadedUrls = []

    for (const file of photos) {
      if (!file || file.size === 0) continue

      if (!file.type?.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed" },
          { status: 400 }
        )
      }

      // ✅ Node.js runtime required
      const buffer = Buffer.from(await file.arrayBuffer())

      const upload = await imagekit.upload({
        file: buffer.toString("base64"),
        fileName: `review-${orderId}-${Date.now()}-${file.name}`,
        folder: "/reviews",
      })

      uploadedUrls.push(upload.url)
    }

    /* -------------------- Create Rating -------------------- */
    const ratingResponse = await prisma.rating.create({
      data: {
        userId,
        productId,
        orderId,
        rating,
        review,
        photos: uploadedUrls,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Rating added successfully",
      rating: ratingResponse,
    })
  } catch (error) {
    console.error("POST /api/rating error:", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}

/* ========================== GET: USER RATINGS ========================== */
export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ ratings })
  } catch (error) {
    console.error("GET /api/rating error:", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}
