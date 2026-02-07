import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hashOtp } from "@/lib/otp"

const MAX_VERIFY_ATTEMPTS = 5

export async function POST(req) {
  try {
    const { orderId, otp } = await req.json()

    if (!orderId || !otp) {
      return NextResponse.json(
        { error: "orderId and otp are required" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
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

    if ((order.otpVerifyAttempts || 0) >= MAX_VERIFY_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many failed attempts. OTP locked." },
        { status: 429 }
      )
    }

    if (!order.deliveryOtp || !order.deliveryOtpExpiry) {
      return NextResponse.json(
        { error: "OTP not generated" },
        { status: 400 }
      )
    }

    if (order.deliveryOtpExpiry < new Date()) {
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      )
    }

    const cleanOtp = String(otp).trim()
    const hashedUserOtp = hashOtp(cleanOtp)

    // 🔍 DEBUG (REMOVE IN PROD)
    console.log("🔐 DB OTP HASH:", order.deliveryOtp)
    console.log("👤 USER OTP:", cleanOtp)
    console.log("🔑 HASHED USER OTP:", hashedUserOtp)

    // ❌ WRONG OTP
    if (hashedUserOtp !== order.deliveryOtp) {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          otpVerifyAttempts: { increment: 1 }
        }
      })

      console.log("❌ OTP FAILED, attempts:", updated.otpVerifyAttempts)

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
        otpVerifyAttempts: 0,
        otpResendCount: 0,
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
