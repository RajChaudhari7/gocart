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

        // ✅ GET MONTH & YEAR FROM QUERY
        const { searchParams } = new URL(request.url)

        const month = Number(searchParams.get("month"))
        const year = Number(searchParams.get("year"))

        // ✅ DATE FILTER LOGIC
        let dateFilter = {}

        if (month !== 0 && month && year) {
            const startDate = new Date(year, month - 1, 1)
            const endDate = new Date(year, month, 1)

            dateFilter = {
                createdAt: {
                    gte: startDate,
                    lt: endDate
                }
            }
        }

        // ✅ ONLY Delivered Orders Count (FILTERED)
        const orders = await prisma.order.count({
            where: {
                status: "DELIVERED",
                ...dateFilter
            }
        })

        // ✅ ONLY Approved Stores (NO DATE FILTER)
        const stores = await prisma.store.count({
            where: {
                status: "approved"
            }
        })

        // ✅ FILTERED Orders for Chart
        const allOrders = await prisma.order.findMany({
            where: {
                status: "DELIVERED",
                ...dateFilter
            },
            select: {
                createdAt: true,
                total: true,
            }
        })

        // ✅ FILTERED Revenue
        const revenueData = await prisma.order.aggregate({
            _sum: { total: true },
            where: {
                status: "DELIVERED",
                ...dateFilter
            }
        })

        const revenue = (revenueData._sum.total || 0).toFixed(2)

        // ✅ Products (no filter)
        const products = await prisma.product.count()

        const dashboardData = {
            orders,
            stores,
            products,
            revenue,
            allOrders
        }

        return NextResponse.json({ dashboardData })

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        )
    }
}