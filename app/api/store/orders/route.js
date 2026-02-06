import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/sendEmail"


// ✅ Must match Prisma + frontend
const STATUS_FLOW = [
  "ORDER_PLACED",
  "PACKED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
]

// ================= UPDATE SELLER ORDER STATUS =================
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: true   // 👈 REQUIRED for email
      }
    })


    if (!order || order.storeId !== storeId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // ❌ FINAL STATES LOCK
    if (["CANCELLED", "DELIVERED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Order status cannot be changed once finalized" },
        { status: 400 }
      )
    }

    // ❌ NO BACKWARD STATUS
    const currentIndex = STATUS_FLOW.indexOf(order.status)
    const newIndex = STATUS_FLOW.indexOf(status)

    if (newIndex === -1) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    if (newIndex <= currentIndex) {
      return NextResponse.json(
        { error: "Order status cannot go backward" },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {


      // RESTOCK ON CANCEL
      if (status === "CANCELLED") {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.quantity },
              inStock: true
            }
          })
        }
      }

      // ✅ UPDATE STATUS + STATUS HISTORY
      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          statusHistory: {
            ...(order.statusHistory || {}),
            [status]: new Date().toISOString()
          }
        }
      })
    })

    // 🔔 SEND EMAIL AFTER STATUS UPDATE
    try {
      const userEmail = order.user?.email

      if (userEmail) {
        await sendEmail({
          to: userEmail,
          subject: `Order status updated to ${status}`,
          html: `
        <h2>Order Update</h2>
        <p>Your order <b>#${orderId}</b> status has been updated.</p>
        <p><b>Current Status:</b> ${status}</p>
        <p>Thank you for shopping with us.</p>
      `
        })
      }
    } catch (err) {
      console.error("Email sending failed:", err.message)
    }


    return NextResponse.json({ message: "Order status updated successfully" })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// ================= GET ALL SELLER ORDERS =================
export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        user: true,
        address: true,
        store: true,
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const activeOrdersCount = await prisma.order.count({
      where: {
        storeId,
        NOT: {
          status: { in: ["DELIVERED", "CANCELLED"] }
        }
      }
    })

    return NextResponse.json({
      orders,
      activeCount: activeOrdersCount
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
