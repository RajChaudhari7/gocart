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

        // get total orders
        const orders = await prisma.order.count()

        // get total stores on app
        const stores = await prisma.store.count()

        // get all orders include necessary info
        const allOrdersRaw = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10, // show only recent 10 orders
            select: {
                id: true,
                createdAt: true,
                total: true,
                status: true,
                customer: { select: { name: true } }
            }
        })

        // calculate total revenue
        let totaRevenue = 0
        allOrdersRaw.forEach(order => { totaRevenue += order.total })
        const revenue = totaRevenue.toFixed(2)

        // total products on app
        const products = await prisma.product.count()

        // format orders for frontend
        const allOrders = allOrdersRaw.map(order => ({
            id: order.id,
            createdAt: order.createdAt,
            amount: order.total,
            status: order.status,
            customerName: order.customer?.name || 'Unknown'
        }))

        const dashboardData = { orders, stores, products, revenue, allOrders }

        return NextResponse.json({ dashboardData })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }

}
