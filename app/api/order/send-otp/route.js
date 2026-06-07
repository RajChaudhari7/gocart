import prisma from "@/lib/prisma"
import { generateOtp, hashOtp } from "@/lib/otp"
import { sendEmail } from "@/lib/sendEmail"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {

        const { orderId } = await request.json()

        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                user: true
            }
        })

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        if (!order.user?.email) {
            return NextResponse.json(
                { error: "Customer email not found" },
                { status: 400 }
            )
        }

        const otp = generateOtp()

        await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                deliveryOtp: hashOtp(otp),
                deliveryOtpExpiry: new Date(
                    Date.now() + 10 * 60 * 1000
                ),
                otpVerified: false,
                otpVerifyAttempts: 0
            }
        })

        await sendEmail({
            to: order.user.email,
            type: "otp",
            subject: "Delivery OTP",
            html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Delivery Verification OTP</h2>

          <p>Your OTP is:</p>

          <h1 style="letter-spacing:5px">
            ${otp}
          </h1>

          <p>
            Valid for 10 minutes.
          </p>
        </div>
      `
        })

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully"
        })

    } catch (error) {

        console.error(error)

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )

    }
}