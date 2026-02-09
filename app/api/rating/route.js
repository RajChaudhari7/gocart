import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/* ========================== POST: CREATE RATING ========================== */
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, productId, rating, review } = await request.json()

    if (!orderId || !productId || !review || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid or missing fields' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { select: { productId: true } },
      },
    })

    if (!order || order.userId !== userId) {
      return NextResponse.json(
        { error: 'Order not found or unauthorized' },
        { status: 404 }
      )
    }

    const productInOrder = order.orderItems.some(
      (item) => item.productId === productId
    )

    if (!productInOrder) {
      return NextResponse.json(
        { error: 'This product does not belong to this order' },
        { status: 400 }
      )
    }

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
        { error: 'You have already rated this product for this order' },
        { status: 400 }
      )
    }

    const ratingResponse = await prisma.rating.create({
      data: {
        userId,
        productId,
        orderId,
        rating,
        review,
        photos: [], // ✅ keep field empty if schema requires it
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        product: {
          select: { id: true, name: true, images: true },
        },
      },
    })

    return NextResponse.json({
      message: 'Rating added successfully',
      rating: ratingResponse,
    })
  } catch (error) {
    console.error('POST /api/rating error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

/* ========================== GET: USER RATINGS ========================== */
export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ratings = await prisma.rating.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        product: {
          select: { id: true, name: true, images: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ratings })
  } catch (error) {
    console.error('GET /api/rating error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}
