import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const { orderId, otp } = await request.json()

        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                category: true,
                                subCategory: true
                            }
                        }
                    }
                }
            }
        })

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            )
        }

        // 1. Check if OTP has expired (10 minute limit)
        if (order.deliveryOtpExpiry && new Date() > new Date(order.deliveryOtpExpiry)) {
            return NextResponse.json(
                { error: "OTP has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // 2. Direct string comparison (since we are storing plain text now)
        const valid = String(otp) === String(order.deliveryOtp)

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

        // 3. Mark as Delivered
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
                    DELIVERED: new Date().toISOString()
                }
            }
        })

        // Save user preferences for AI recommendations

        for (const item of order.orderItems) {

            await prisma.userPreference.upsert({

                where: {
                    userId_productId: {
                        userId: order.userId,
                        productId: item.product.id
                    }
                },

                update: {
                    purchasedAt: new Date()
                },

                create: {

                    userId: order.userId,

                    productId: item.product.id,

                    category: item.product.category,

                    subCategory: item.product.subCategory

                }

            })

        }

        for (const item of order.orderItems) {

            await prisma.product.update({

                where: {
                    id: item.productId
                },

                data: {
                    totalSales: {
                        increment: item.quantity
                    }
                }

            })

        }

        // 4. Driver becomes available again
        if (order.driverId) {
            await prisma.driver.update({
                where: {
                    id: order.driverId
                },
                data: {
                    isAvailable: true,

                    totalDeliveries: {
                        increment: 1
                    }
                }
            })

            // Trigger assignment for the next pending order
            try {
                await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL}/api/driver/assign-pending-orders`,
                    { method: "POST" }
                )
            } catch (err) {
                console.log("Failed to trigger assignment", err)
            }
        }

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