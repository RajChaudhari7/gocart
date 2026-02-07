import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateOtp, hashOtp } from "@/lib/otp"
import { sendEmail } from "@/lib/sendEmail"

const MAX_RESENDS = 3
const OTP_EXPIRY_MINUTES = 5

export async function POST(req) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }   // ✅ for email
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "DELIVERY_INITIATED") {
      return NextResponse.json(
        { error: `Invalid order status: ${order.status}` },
        { status: 400 }
      )
    }

    if ((order.otpResendCount || 0) >= MAX_RESENDS) {
      return NextResponse.json(
        { error: "Resend limit reached" },
        { status: 429 }
      )
    }

    const plainOtp = generateOtp()
    const hashedOtp = hashOtp(String(plainOtp).trim())
    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    console.log("📤 RESEND OTP (DEV ONLY):", plainOtp)

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryOtp: hashedOtp,
        deliveryOtpExpiry: expiry,
        otpResendCount: { increment: 1 },
        otpVerifyAttempts: 0,
        otpVerified: false
      },
      include: { user: true }
    })

    // ================= SEND OTP EMAIL =================
    try {
      const userEmail = updatedOrder.user?.email

      if (userEmail) {
        await sendEmail({
          to: userEmail,
          type: "otp",
          subject: `Your Delivery OTP for Order #${orderId}`,
          html: `
<div style="font-family:Arial;padding:20px;">
  <h2>Delivery OTP (Resent)</h2>
  <p>Your new OTP for confirming delivery is:</p>
  <h1 style="letter-spacing:4px;">${plainOtp}</h1>
  <p><b>Do NOT share</b> this OTP with anyone except the delivery person.</p>
  <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
</div>
`
        })
      }
    } catch (emailErr) {
      console.error("❌ RESEND OTP EMAIL FAILED:", emailErr.message)
      // Do NOT fail API if email fails
    }

    // ✅ RETURN UPDATED ORDER (MATCH FRONTEND)
    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (err) {
    console.error("RESEND OTP ERROR:", err)
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    )
  }
}
