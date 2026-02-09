import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/sendEmail"
import { generateOtp, hashOtp } from "@/lib/otp"


// ✅ Must match Prisma + frontend
const STATUS_FLOW = [
  "ORDER_PLACED",
  "PACKED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERY_INITIATED",
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
        orderItems: { include: { product: true } },
        user: true,
        store: true
      }
    })

    if (!order || order.storeId !== storeId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (["CANCELLED", "DELIVERED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Order status cannot be changed once finalized" },
        { status: 400 }
      )
    }

    const currentIndex = STATUS_FLOW.indexOf(order.status)
    const newIndex = STATUS_FLOW.indexOf(status)

    if (newIndex === -1 || newIndex <= currentIndex) {
      return NextResponse.json(
        { error: "Invalid order status flow" },
        { status: 400 }
      )
    }

    // ❌ BLOCK DELIVERY WITHOUT OTP VERIFICATION
    if (status === "DELIVERED") {
      if (order.status !== "DELIVERY_INITIATED") {
        return NextResponse.json(
          { error: "Order must be in DELIVERY_INITIATED state" },
          { status: 400 }
        )
      }

      if (!order.deliveryOtp) {
        return NextResponse.json(
          { error: "Delivery OTP not generated" },
          { status: 400 }
        )
      }

      if (!order.otpVerified) {
        return NextResponse.json(
          { error: "Delivery OTP not verified" },
          { status: 400 }
        )
      }
    }


    // ================= TRANSACTION =================
    let plainOtp = null

    await prisma.$transaction(async (tx) => {

      // 🔥 GENERATE OTP SAFELY INSIDE TRANSACTION
      if (status === "DELIVERY_INITIATED") {
        plainOtp = generateOtp()
        const hashedOtp = hashOtp(plainOtp)

        await tx.order.update({
          where: { id: orderId },
          data: {
            deliveryOtp: hashedOtp,
            deliveryOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
            otpVerified: false,
            otpVerifyAttempts: 0,   // ✅ RESET
            otpResendCount: 0      // ✅ RESET
          }
        })
      }

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

    // ================= SEND DELIVERY OTP EMAIL =================
    if (status === "DELIVERY_INITIATED" && plainOtp) {
      try {
        const userEmail = order.user?.email

        if (userEmail) {
          await sendEmail({
            to: userEmail,
            type: "otp",
            subject: `Your Delivery OTP for Order #${orderId}`,
            html: `
<div style="font-family:Arial;padding:20px;">
  <h2>Delivery OTP</h2>
  <p>Your OTP for confirming delivery is:</p>
  <h1 style="letter-spacing:4px;">${plainOtp}</h1>
  <p><b>Do NOT share</b> this OTP with anyone except the delivery person.</p>
  <p>This OTP will expire in 10 minutes.</p>
</div>
`
          })
        }
      } catch (err) {
        console.error("OTP email failed:", err.message)
      }
    }


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

        const storeName = order.store?.name || "Our Store"
        const storeLogo = order.store?.logo || null


        await sendEmail({
          to: userEmail,
          type: "order",
          subject: `Invoice – Order #${orderId} (${status})`,
          html: `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f9fafb;padding:20px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;padding:24px;border-radius:8px;box-shadow:0 4px 10px rgba(0,0,0,0.05);">

    <!-- STORE HEADER -->
    <div style="text-align:center;margin-bottom:20px;">
      ${storeLogo
              ? `<img src="${storeLogo}" alt="${storeName}" style="height:60px;margin-bottom:8px;object-fit:contain;" />`
              : ""
            }
      <h2 style="margin:0;color:#111827;">${storeName}</h2>
      <p style="margin:4px 0;color:#6b7280;font-size:14px;">Order Invoice</p>
    </div>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

    <!-- INVOICE HEADER -->
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <h3 style="margin:0;color:#111827;">INVOICE</h3>
      <span style="color:#16a34a;font-weight:600;font-size:14px;">${status}</span>
    </div>

    <!-- ORDER META -->
    <p style="color:#374151;font-size:14px;margin-top:12px;">
      <b>Order ID:</b> #${orderId}<br/>
      <b>Date:</b> ${new Date().toLocaleDateString()}
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

    <!-- CUSTOMER INFO -->
    <p style="font-size:14px;color:#111827;">
      <b>Billed To:</b><br/>
      ${order.user?.name || "Customer"}<br/>
      ${order.user?.email}
    </p>

    <!-- ORDER SUMMARY -->
    <h3 style="margin-top:24px;color:#111827;">Order Summary</h3>

    <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse;margin-top:8px;font-size:14px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th align="left" style="border:1px solid #e5e7eb;">Product</th>
          <th align="center" style="border:1px solid #e5e7eb;">Qty</th>
          <th align="right" style="border:1px solid #e5e7eb;">Price</th>
          <th align="right" style="border:1px solid #e5e7eb;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- GRAND TOTAL -->
    <p style="text-align:right;font-size:16px;font-weight:600;margin-top:16px;color:#111827;">
      Grand Total: ₹${grandTotal}
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

    <!-- STATUS MESSAGE -->
    <p style="font-size:14px;color:#374151;">
      Your order is currently <b>${status}</b>.
      You will receive updates as your order progresses.
    </p>

    <!-- FOOTER -->
    <p style="margin-top:24px;font-size:14px;color:#111827;">
      Thank you for shopping with us ❤️<br/>
      <b>${storeName} Team</b>
    </p>

    <p style="font-size:12px;color:#6b7280;margin-top:12px;">
      This is an automated email. Please do not reply.
    </p>

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
        orderItems: { include: { product: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    const activeOrdersCount = await prisma.order.count({
      where: {
        storeId,
        NOT: { status: { in: ["DELIVERED", "CANCELLED"] } }
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