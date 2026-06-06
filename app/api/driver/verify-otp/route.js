import prisma from "@/lib/prisma"
import { verifyOtp } from "@/lib/otp"
import { NextResponse } from "next/server"

export async function POST(request) {

    try {

        const { orderId, otp } =
            await request.json()

        const order =
            await prisma.order.findUnique({
                where: {
                    id: orderId
                }
            })

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        const valid = verifyOtp(
            otp,
            order.deliveryOtp
        )
        if (!valid) {

            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    otpVerifyAttempts: {
                        increment: 1
                    }
                }
            })

            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            )
        }

        await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                otpVerified: true,
                deliveredAt: new Date(),
                status: "DELIVERED",
                statusHistory: {
                    ...(order.statusHistory || {}),
                    DELIVERED:
                        new Date().toISOString()
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: "Order Delivered"
        })

    } catch (error) {

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}