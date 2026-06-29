import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/sendEmail"
import { generateOtp } from "@/lib/otp" // Removed hashOtp import
import { calculateDistance } from "@/lib/distance"

const SELLER_FLOW = [
  "ORDER_PLACED",
  "ORDER_CONFIRMED",
  "ORDER_PACKING",
  "ORDER_PACKED"
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
        orderItems: {
          include: {
            product: true
          }
        },
        user: true,
        store: true,
        address: true
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

    const currentIndex = SELLER_FLOW.indexOf(order.status)
    const newIndex = SELLER_FLOW.indexOf(status)

    if (
      currentIndex !== -1 &&
      newIndex !== -1 &&
      newIndex <= currentIndex
    ) {
      return NextResponse.json(
        { error: "Invalid status flow" },
        { status: 400 }
      )
    }

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

    let plainOtp = null

    await prisma.$transaction(async (tx) => {

      if (status === "DELIVERY_INITIATED") {
        // Generate plain OTP and save it DIRECTLY without hashing
        plainOtp = generateOtp()

        await tx.order.update({
          where: { id: orderId },
          data: {
            deliveryOtp: String(plainOtp), // Saved as plain text
            deliveryOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
            otpVerified: false,
            otpVerifyAttempts: 0,
            otpResendCount: 0
          }
        })
      }

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

      if (
        !order.store?.latitude ||
        !order.store?.longitude
      ) {
        throw new Error(
          "Store location not configured. Please update store location first."
        )
      }

      if (status === "ORDER_PACKED") {
        const drivers = await tx.driver.findMany({
          where: {
            isOnline: true,
            isActive: true,
            latitude: { not: null },
            longitude: { not: null }
          }
        })

        if (drivers.length === 0) {
          throw new Error("No online drivers available")
        }

        let nearestDriver = null
        let shortestDistance = Infinity

        for (const driver of drivers) {
          const distance = calculateDistance(
            order.store.latitude,
            order.store.longitude,
            driver.latitude,
            driver.longitude
          )

          if (distance < shortestDistance) {
            shortestDistance = distance
            nearestDriver = driver
          }
        }

        if (!nearestDriver) {
          throw new Error("No suitable driver found")
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            driverId: nearestDriver.id,
            driverAccepted: false,
            assignmentStatus: "PENDING",
            assignmentExpiresAt: new Date(Date.now() + 10000),
            assignedAt: new Date(),
            status: "ORDER_PACKED",
            statusHistory: {
              ...(order.statusHistory || {}),
              ORDER_PACKED: new Date().toISOString()
            }
          }
        })
        return
      }
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

    <div style="text-align:center;margin-bottom:20px;">
      ${storeLogo ? `<img src="${storeLogo}" alt="${storeName}" style="height:60px;margin-bottom:8px;object-fit:contain;" />` : ""}
      <h2 style="margin:0;color:#111827;">${storeName}</h2>
      <p style="margin:4px 0;color:#6b7280;font-size:14px;">Order Invoice</p>
    </div>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

    <div style="display:flex;justify-content:space-between;align-items:center;">
      <h3 style="margin:0;color:#111827;">INVOICE</h3>
      <span style="color:#16a34a;font-weight:600;font-size:14px;">${status}</span>
    </div>

    <p style="color:#374151;font-size:14px;margin-top:12px;">
      <b>Order ID:</b> #${orderId}<br/>
      <b>Date:</b> ${new Date().toLocaleDateString()}
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

    <p style="font-size:14px;color:#111827;">
      <b>Billed To:</b><br/>
      ${order.user?.name || "Customer"}<br/>
      ${order.user?.email}
    </p>

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

    <p style="text-align:right;font-size:16px;font-weight:600;margin-top:16px;color:#111827;">
      Grand Total: ₹${grandTotal}
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

    <p style="font-size:14px;color:#374151;">
      Your order is currently <b>${status}</b>.
      You will receive updates as your order progresses.
    </p>

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

// ================= GET SELLER ORDERS =================
export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const settings =
      await prisma.platformSettings.findFirst() || {
        commissionPercent: 10,
        deliveryFee: 50,
        driverFee: 30,
        freeDeliveryAbove: 999999,
      };

    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        user: true,
        address: true,
        store: true,
        orderItems: {
          include: { product: true }
        },
        returnRequests: {
          include: {
            items: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const activeOrdersCount = await prisma.order.count({
      where: {
        storeId,
        NOT: {
          status: {
            in: ["DELIVERED", "CANCELLED"]
          }
        }
      }
    })

    return NextResponse.json({
      orders,
      activeCount: activeOrdersCount,
       settings,
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}