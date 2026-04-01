import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)

        const storeId = searchParams.get("storeId")
        const month = Number(searchParams.get("month"))
        const year = Number(searchParams.get("year"))

        let dateFilter = {}

        if (month !== 0 && month && year) {
            const start = new Date(year, month - 1, 1)
            const end = new Date(year, month, 1)

            dateFilter = {
                createdAt: {
                    gte: start,
                    lt: end
                }
            }
        }

        // ✅ Get all approved stores
        if (!storeId) {
            const stores = await prisma.store.findMany({
                where: { status: "approved" },
                select: { id: true, name: true }
            })

            return NextResponse.json({ stores })
        }

        // ✅ Store-specific data
        const orders = await prisma.order.findMany({
            where: {
                storeId,
                ...dateFilter
            },
            include: {
                orderItems: true
            }
        })

        let deliveredRevenue = 0
        let cancelledAmount = 0
        let returnedAmount = 0

        let deliveredCount = 0
        let cancelledCount = 0
        let returnedCount = 0

        const productMap = {}

        orders.forEach(order => {

            if (order.status === "DELIVERED") {
                deliveredRevenue += order.total
                deliveredCount++

                order.orderItems.forEach(item => {
                    productMap[item.productId] =
                        (productMap[item.productId] || 0) + item.quantity
                })
            }

            if (order.status === "CANCELLED") {
                cancelledAmount += order.total
                cancelledCount++
            }

            if (order.status === "RETURNED") {
                returnedAmount += order.total
                returnedCount++
            }
        })

        // ✅ Most sold product
        let topProductId = null
        let maxQty = 0

        for (let pid in productMap) {
            if (productMap[pid] > maxQty) {
                maxQty = productMap[pid]
                topProductId = pid
            }
        }

        let topProduct = null

        if (topProductId) {
            topProduct = await prisma.product.findUnique({
                where: { id: topProductId },
                select: { name: true, images: true }
            })
        }

        return NextResponse.json({
            data: {
                deliveredRevenue,
                cancelledAmount,
                returnedAmount,
                deliveredCount,
                cancelledCount,
                returnedCount,
                topProduct
            }
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        )
    }
}