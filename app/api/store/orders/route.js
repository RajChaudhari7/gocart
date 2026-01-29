import prisma from "@/lib/prisma"
import { authSeller } from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Status flow for valid, paid orders
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

        // ❌ SECURITY LOCK: Prevent modifying orders that haven't been paid for yet
        if (order.status === "PENDING_PAYMENT") {
            return NextResponse.json(
                { error: "Payment not confirmed for this order yet." },
                { status: 400 }
            )
        }

        // ❌ FINAL STATES LOCK
        if (["CANCELLED", "RETURNED", "DELIVERED"].includes(order.status)) {
            return NextResponse.json(
                { error: "Order status cannot be changed once finalized" },
                { status: 400 }
            )
        }

        // ❌ NO BACKWARD STATUS
        const currentIndex = STATUS_FLOW.indexOf(order.status)
        const newIndex = STATUS_FLOW.indexOf(status)

        // Allow cancellation/return at any point, but don't allow "Processing" -> "Placed"
        if (status !== "CANCELLED" && status !== "RETURNED" && newIndex <= currentIndex) {
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
            where: { 
                storeId,
                // ✅ EXCLUDE GHOST ORDERS: Only show orders where payment succeeded
                NOT: {
                    status: "PENDING_PAYMENT"
                }
            },
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

        // --- Calculate count for paid active orders only ---
        const activeOrdersCount = await prisma.order.count({
            where: {
                storeId,
                NOT: {
                    status: { in: ["DELIVERED", "CANCELLED", "RETURNED", "PENDING_PAYMENT"] }
                }
            }
        })

        return NextResponse.json({ 
            orders, 
            activeCount: activeOrdersCount 
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}