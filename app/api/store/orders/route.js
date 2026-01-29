import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const STATUS_FLOW = ["ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"]

// ================= UPDATE SELLER ORDER STATUS =================
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 })
        }

        const { orderId, status } = await request.json()

        if (!orderId || !status) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
        })

        if (!order || order.storeId !== storeId) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // ❌ FINAL STATES LOCK
        if (["CANCELLED", "RETURNED", "DELIVERED"].includes(order.status)) {
            return NextResponse.json(
                { error: "Order status cannot be changed" },
                { status: 400 }
            )
        }

        // ❌ NO BACKWARD STATUS
        const currentIndex = STATUS_FLOW.indexOf(order.status)
        const newIndex = STATUS_FLOW.indexOf(status)

        if (newIndex <= currentIndex) {
            return NextResponse.json(
                { error: "Order status cannot go backward" },
                { status: 400 }
            )
        }

        await prisma.$transaction(async (tx) => {
            // RESTOCK ON CANCEL / RETURN
            if (status === "CANCELLED" || status === "RETURNED") {
                for (const item of order.orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            quantity: { increment: item.quantity },
                            inStock: true
                        }
                    })
                }
            }

            await tx.order.update({
                where: { id: orderId },
                data: { status }
            })
        })

        return NextResponse.json({ message: "Order status updated successfully" })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

// ================= GET ALL SELLER ORDERS =================
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 })
        }

        const orders = await prisma.order.findMany({
            where: { storeId },
            include: {
                user: true,
                address: true,
                store: true,
                orderItems: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // --- NEW LOGIC: Calculate only orders needing attention ---
        // Excludes DELIVERED, CANCELLED, and RETURNED
        const activeOrdersCount = await prisma.order.count({
            where: {
                storeId,
                NOT: {
                    status: { in: ["DELIVERED", "CANCELLED", "RETURNED"] }
                }
            }
        })

        return NextResponse.json({ 
            orders, 
            activeCount: activeOrdersCount // Send this to the frontend store
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}