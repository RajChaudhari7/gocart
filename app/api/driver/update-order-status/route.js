import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/sendEmail"
import { generateOtp, hashOtp } from "@/lib/otp"

export const runtime = "nodejs"

const DRIVER_FLOW = [
    "DRIVER_ASSIGNED",
    "REACHED_SHOP",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERY_INITIATED",
    "DELIVERED"
]

export async function POST(request) {

    try {

        const {
            orderId,
            status,
            driverId
        } = await request.json()

        const order =
            await prisma.order.findUnique({
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

        if (order.driverId !== driverId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            )
        }

        if (order.status === "DELIVERED") {
            return NextResponse.json(
                { error: "Order already delivered" },
                { status: 400 }
            )
        }

        const currentIndex =
            DRIVER_FLOW.indexOf(order.status)

        const nextIndex =
            DRIVER_FLOW.indexOf(status)

        if (nextIndex !== currentIndex + 1) {
            return NextResponse.json(
                { error: "Invalid status flow" },
                { status: 400 }
            )
        }

        if (status === "DELIVERED") {
            return NextResponse.json(
                {
                    error: "Use OTP verification to complete delivery"
                },
                {
                    status: 400
                }
            )
        }

        let plainOtp = null



        if (status === "OUT_FOR_DELIVERY") {
            if (!order.user?.email) {
                return NextResponse.json(
                    { error: "Customer email not found" },
                    { status: 400 }
                )
            }

            plainOtp = generateOtp()

            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    status,
                    deliveryOtp: hashOtp(plainOtp),
                    deliveryOtpExpiry: new Date(
                        Date.now() + 10 * 60 * 1000
                    ),
                    otpVerified: false,
                    statusHistory: {
                        ...(order.statusHistory || {}),
                        OUT_FOR_DELIVERY: new Date().toISOString()
                    }
                }
            })



            try {
                await sendEmail({
                    to: order.user.email,
                    type: "otp",
                    subject: "Delivery OTP",
                    html: `
          <h2>Delivery OTP</h2>
          <h1>${plainOtp}</h1>
          <p>Valid for 10 minutes</p>
        `
                })

                console.log("OTP email sent to:", order.user.email)

            } catch (err) {
                console.error("EMAIL FAILED:", err)
            }

        } else {

            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    status,
                    statusHistory: {
                        ...(order.statusHistory || {}),
                        [status]:
                            new Date().toISOString()
                    }
                }
            })
        }

        return NextResponse.json({
            success: true
        })

    } catch (error) {

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}