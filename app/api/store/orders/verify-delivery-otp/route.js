import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { sendEmail } from "@/lib/sendEmail"

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex")

export async function POST(request) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { orderId, otp } = await request.json()

    if (!orderId || !otp) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (!order || order.userId !== userId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "DELIVERY_INITIATED") {
      return NextResponse.json(
        { error: "Order not ready for delivery verification" },
        { status: 400 }
      )
    }

    if (order.otpVerified) {
      return NextResponse.json(
        { error: "Order already delivered" },
        { status: 400 }
      )
    }

    if (!order.deliveryOtp || !order.deliveryOtpExpiry) {
      return NextResponse.json(
        { error: "OTP not generated" },
        { status: 400 }
      )
    }

    if (new Date() > new Date(order.deliveryOtpExpiry)) {
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      )
    }

    const hashedOtp = hashOtp(otp)

    if (hashedOtp !== order.deliveryOtp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    // ✅ FINAL DELIVERY CONFIRMATION
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        otpVerified: true,
        deliveryOtp: null,
        deliveryOtpExpiry: null,
        statusHistory: {
          ...(order.statusHistory || {}),
          DELIVERED: new Date().toISOString()
        }
      }
    })

    // 📧 DELIVERY CONFIRMATION EMAIL
    await sendEmail({
      to: order.user.email,
      type: "order",
      subject: "📦 Order Delivered Successfully",
      html: `
        <h2>Order Delivered</h2>
        <p>Your order <b>#${orderId}</b> has been delivered successfully.</p>
        <p>Thank you for shopping with us 🙌</p>
      `
    })

    return NextResponse.json({
      message: "Order delivered successfully"
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
