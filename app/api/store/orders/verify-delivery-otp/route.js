import { NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/lib/prisma"

const MAX_VERIFY_ATTEMPTS = 5

export async function POST(req) {
  try {
    const { orderId, otp } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order || order.status !== "DELIVERY_INITIATED") {
      return NextResponse.json(
        { error: "Invalid order state" },
        { status: 400 }
      )
    }

    // 🔒 Check verify attempts
    if ((order.otpVerifyAttempts || 0) >= MAX_VERIFY_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many failed attempts. OTP locked." },
        { status: 429 }
      )
    }

    if (!order.deliveryOtp || !order.deliveryOtpExpiry) {
      return NextResponse.json(
        { error: "OTP not found" },
        { status: 400 }
      )
    }

    if (order.deliveryOtpExpiry < new Date()) {
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      )
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex")

    // ❌ WRONG OTP
    if (hashedOtp !== order.deliveryOtp) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          otpVerifyAttempts: { increment: 1 } // 👈 count attempts
        }
      })

      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    // ✅ SUCCESS
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
        deliveryOtp: null,
        deliveryOtpExpiry: null,
        otpVerifyAttempts: 0,   // reset
        otpResendCount: 0,     // reset (for resend feature)
        otpVerified: true
      }
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err)
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    )
  }
}
