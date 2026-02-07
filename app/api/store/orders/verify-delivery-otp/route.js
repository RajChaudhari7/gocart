import { NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/lib/prisma"

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
            .update(otp)
            .digest("hex")

        if (hashedOtp !== order.deliveryOtp) {
            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            )
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "DELIVERED",
                deliveredAt: new Date(),
                deliveryOtp: null,
                deliveryOtpExpires: null,
                otpVerified: true
            }
        })


        return NextResponse.json({ success: true })

    } catch (err) {
        return NextResponse.json(
            { error: "OTP verification failed" },
            { status: 500 }
        )
    }
}
