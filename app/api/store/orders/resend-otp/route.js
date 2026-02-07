import { NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/lib/prisma"

const MAX_RESENDS = 3
const OTP_EXPIRY_MINUTES = 5

export async function POST(req) {
    try {
        const { orderId } = await req.json()

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        })

        if (!order || order.status !== "DELIVERY_INITIATED") {
            return NextResponse.json({ error: "Invalid order" }, { status: 400 })
        }

        if (order.otpResendCount >= MAX_RESENDS) {
            return NextResponse.json(
                { error: "Resend limit reached" },
                { status: 429 }
            )
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        const hashedOtp = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex")

        const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

        await prisma.order.update({
            where: { id: orderId },
            data: {
                deliveryOtp: hashedOtp,
                deliveryOtpExpiry: expiry,
                otpResendCount: { increment: 1 },
                otpVerifyAttempts: 0 // reset attempts on resend
            }
        })

        // 📧 SEND EMAIL HERE
        // await sendOtpEmail(order.user.email, otp)

        return NextResponse.json({
            success: true,
            expiry
        })

    } catch (err) {
        return NextResponse.json(
            { error: "Failed to resend OTP" },
            { status: 500 }
        )
    }
}
