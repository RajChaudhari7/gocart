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

        const orders = await prisma.order.count({ where: { status: "DELIVERED", ...dateFilter } })

        const deliveredOrders = await prisma.order.findMany({
            where: {
                status: "DELIVERED",
                ...dateFilter
            },
            select: {
                orderItems: {
                    select: {
                        price: true,
                        quantity: true
                    }
                },
                commissionPercent: true,
                deliveryFee: true,
                driverFee: true,
                createdAt: true,
                total: true
            }
        })

        let sellerRevenue = 0;
        let adminRevenue = 0;

        for (const order of deliveredOrders) {

            const productTotal = order.orderItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            const commission =
                (productTotal * (order.commissionPercent || 10)) / 100;

            sellerRevenue +=
                productTotal - commission;

            adminRevenue +=
                commission +
                (order.deliveryFee || 0) -
                (order.driverFee || 0);
        }

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



        // ✅ Products (no filter)
        const products = await prisma.product.count()

        const dashboardData = {
            orders,
            stores,
            products,
            sellerRevenue: sellerRevenue.toFixed(2),
            adminRevenue: adminRevenue.toFixed(2),
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