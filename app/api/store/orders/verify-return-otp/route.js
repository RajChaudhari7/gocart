import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { hashOtp } from "@/lib/otp"

export async function POST(req) {

    try {

        const { userId } = getAuth(req)
        const { orderId, otp } = await req.json()

        const hashedOtp = hashOtp(otp)

        const returnRequest = await prisma.returnRequest.findFirst({
            where: {
                orderId,
                otp: hashedOtp,
                verified: false
            },
            include: {
                items: true
            }
        })

        if (!returnRequest) {
            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            )
        }

        if (new Date() > returnRequest.otpExpiry) {
            return NextResponse.json(
                { error: "OTP expired" },
                { status: 400 }
            )
        }

        await prisma.$transaction(async (tx) => {

            for (const item of returnRequest.items) {

                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: {
                            increment: item.quantity
                        }
                    }
                })

            }

            await tx.returnRequest.update({
                where: { id: returnRequest.id },
                data: {
                    verified: true,
                    status: "COMPLETED"
                }
            })

            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: "RETURNED"
                }
            })

        })

        return NextResponse.json({
            message: "Order returned successfully"
        })

    } catch (error) {

        console.error(error)

        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        )

    }

}