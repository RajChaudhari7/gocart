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

    // ✅ IMPORTANT: product included
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true }
        },
        user: true
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

    if (newIndex === -1 || newIndex <= currentIndex) {
      return NextResponse.json(
        { error: "Invalid order status flow" },
        { status: 400 }
      )
    }

    // ================= DB TRANSACTION =================
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

      // UPDATE STATUS + HISTORY
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

    // ================= SEND INVOICE EMAIL =================
    try {
      const userEmail = order.user?.email
      if (userEmail) {

        const itemsHtml = order.orderItems
          .map(item => `
            <tr>
              <td style="border:1px solid #ddd;padding:8px;">
                ${item.product?.name || "Product"}
              </td>
              <td align="center" style="border:1px solid #ddd;">
                ${item.quantity}
              </td>
              <td align="right" style="border:1px solid #ddd;">
                ₹${item.price}
              </td>
              <td align="right" style="border:1px solid #ddd;">
                ₹${item.price * item.quantity}
              </td>
            </tr>
          `).join("")

        const grandTotal = order.orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )

        await sendEmail({
          to: userEmail,
          subject: `Invoice – Order #${orderId} (${status})`,
          html: `
          <div style="font-family:Arial,sans-serif;background:#f9fafb;padding:20px;">
            <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:8px;">

              <div style="display:flex;justify-content:space-between;">
                <h2 style="margin:0;">INVOICE</h2>
                <span style="color:#16a34a;font-weight:600;">${status}</span>
              </div>

              <p style="color:#555;">
                Order ID: <b>#${orderId}</b><br/>
                Date: ${new Date().toLocaleDateString()}
              </p>

              <hr/>

              <p>
                <b>Billed To:</b><br/>
                ${order.user?.name || "Customer"}<br/>
                ${order.user?.email}
              </p>

              <h3>Order Summary</h3>

              <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse;">
                <thead>
                  <tr style="background:#f3f4f6;">
                    <th align="left" style="border:1px solid #ddd;">Product</th>
                    <th style="border:1px solid #ddd;">Qty</th>
                    <th align="right" style="border:1px solid #ddd;">Price</th>
                    <th align="right" style="border:1px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <p style="text-align:right;margin-top:16px;">
                <b>Grand Total: ₹${grandTotal}</b>
              </p>

              <hr/>

              <p>
                Your order is currently <b>${status}</b>.
                We’ll notify you when the status changes.
              </p>

              <p style="margin-top:24px;">
                Thank you for shopping with us ❤️<br/>
                <b>Your Store Team</b>
              </p>

              <small style="color:#777;">
                This is an automated email. Please do not reply.
              </small>

            </div>
          </div>
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
