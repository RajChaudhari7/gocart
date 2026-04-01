import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// get dashboard data for admin
export async function GET(request) {

    try {

        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: "not authorized" }, { status: 401 })
        }

        // ✅ ONLY Delivered Orders Count (optional but better)
        const orders = await prisma.order.count({
            where: {
                status: "DELIVERED" // adjust if needed
            }
        })

        // ✅ ONLY Approved Stores
        const stores = await prisma.store.count({
            where: {
                isApproved: true
            }
        })

        // ✅ ONLY Delivered Orders for Revenue + Chart
        const allOrders = await prisma.order.findMany({
            where: {
                status: "DELIVERED"
            },
            select: {
                createdAt: true,
                total: true,
            }
        })

        // ✅ Revenue Calculation (Delivered Only)
        let totalRevenue = 0
        allOrders.forEach(order => {
            totalRevenue += order.total
        })

        const revenue = totalRevenue.toFixed(2)

        // ✅ Total Products (same)
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