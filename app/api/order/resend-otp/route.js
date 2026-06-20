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
                otpResendCount: {
                    increment: 1
                }
            }
        })

        const customerName = order.user.name ? order.user.name.split(' ')[0] : 'Customer'

        await sendEmail({
            to: order.user.email,
            type: "otp",
            subject: "Updated Delivery Verification Code",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 40px 20px; margin: 0;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
                        
                        <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                            <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">NandurbarBazar</h2>
                        </div>
                        
                        <div style="padding: 40px 30px; text-align: center;">
                            <p style="color: #4b5563; font-size: 16px; margin-bottom: 8px;">Hello ${customerName},</p>
                            <p style="color: #1f2937; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 24px;">Here is your new verification code.</p>
                            <p style="color: #6b7280; font-size: 15px; margin-bottom: 32px; line-height: 1.5;">Please share this updated code with your driver to complete your delivery.</p>

                            <div style="background-color: #eef2ff; border: 2px dashed #a5b4fc; border-radius: 8px; padding: 24px; margin: 0 auto; max-width: 280px;">
                                <h1 style="color: #312e81; font-size: 42px; letter-spacing: 12px; margin: 0; font-weight: 700; text-align: center;">${otp}</h1>
                            </div>

                            <p style="color: #ef4444; font-size: 14px; margin-top: 32px; font-weight: 500;">
                                ⏱️ This code expires in 10 minutes.
                            </p>
                        </div>
                        
                        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                                If you did not request a new code, please inform the driver immediately.
                            </p>
                        </div>
                    </div>
                </div>
            `
        })

        return NextResponse.json({
            success: true,
            message: "OTP resent successfully"
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}