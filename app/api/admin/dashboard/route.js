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

        // ✅ ONLY Delivered Orders Count
        const orders = await prisma.order.count({
            where: {
                status: "DELIVERED"
            }
        })

        // ✅ ONLY Approved Stores
        const stores = await prisma.store.count({
            where: {
                status: "approved" // 🔥 important
            }
        })

        // ✅ ONLY Delivered Orders for Chart + Revenue
        const allOrders = await prisma.order.findMany({
            where: {
                status: "DELIVERED"
            },
            select: {
                createdAt: true,
                total: true,
            }
        })

        // ✅ Revenue using aggregate (BEST PRACTICE)
        const revenueData = await prisma.order.aggregate({
            _sum: { total: true },
            where: {
                status: "DELIVERED"
            }
        })

        const revenue = (revenueData._sum.total || 0).toFixed(2)

        // ✅ Total Products (unchanged)
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