import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {

        const { userId } = getAuth(request);

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 401 }
            );
        }

        // Today
        const now = new Date();

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        // today's orders
        const todayOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startOfToday,
                    lt: startOfTomorrow,
                },
            },
            select: {
                id: true,
                status: true,
                total: true,
                deliveryFee: true,
                driverFee: true,
                commissionPercent: true,

                orderItems: {
                    select: {
                        price: true,
                        quantity: true,
                    },
                },
            },
        });

        // order count
        const ordersToday = todayOrders.length;

        // GMV
        let gmvToday = 0;

        for (const order of todayOrders) {
            const productTotal = order.orderItems.reduce(
                (sum, item) => sum + Number(item.price) * Number(item.quantity),
                0
            );

            gmvToday += productTotal;
        }

        // Platform revenue (commission + deliveryfee - driverfee)
        let platformRevenueToday = 0;

        for (const order of todayOrders) {
            if (order.status !== "DELIVERED") {
                continue;
            }

            const productTotal = order.orderItems.reduce(
                (sum, item) => sum + Number(item.price) * Number(item.quantity),
                0
            );

            const commission = (productTotal * Number(order.commissionPercent ?? 10)) / 100;

            const deliveryFee = Number(order.deliveryFee ?? 0);
            const driverFee = Number(order.driverFee ?? 0);

            platformRevenueToday += commission + deliveryFee - driverFee;
        }

        // Active deliveries
        const activeDeliveryStatuses = [
            "DRIVER_ASSIGNED",
            "REACHED_SHOP",
            "PICKED_UP",
            "OUT_FOR_DELIVERY",
            "DELIVERY_INITIATED",
        ];

        const activeDeliveries = await prisma.order.count({
            where: {
                status: {
                    in: activeDeliveryStatuses,
                },
            },
        });

        // Active Drivers
        const activeDrivers = await prisma.driver.count({
            where: {
                isActive: true,
                orders: {
                    some: {
                        status: {
                            in: activeDeliveryStatuses,
                        },
                    },
                },
            },
        });

        // online drivers
        const onlineDrivers = await prisma.driver.count({
            where: {
                isActive: true,
                isOnline: true,
            },
        });

        // seller payable
        const sellerPayableResult = await prisma.sellerEarning.aggregate({
            where: {
                status: "AVAILABLE",
            },
            _sum: {
                netAmount: true,
            },
        });

        const sellerPayable = Number(sellerPayableResult._sum.netAmount ?? 0);

        // driver payable
        const driverPayableResult = await prisma.driverEarning.aggregate({
            where: {
                status: "AVAILABLE",
            },
            _sum: {
                amount: true,
            },
        });

        const driverPayable = Number(driverPayableResult._sum.amount ?? 0);

        // pending seller payouts
        const pendingSellerPayouts = await prisma.payout.count({
            where: {
                recipientType: "SELLER",
                status: "PENDING",
            },
        });

        // pending driver payouts
        const pendingDriverPayouts = await prisma.payout.count({
            where: {
                recipientType: "DRIVER",
                status: "PENDING",
            },
        });

        // existing marketplace counts
        const products = await prisma.product.count();

        const stores = await prisma.store.count({
            where: {
                status: "approved",
            },
        });

        // existing orders chart
        const { searchParams } = new URL(request.url);

        const month = Number(searchParams.get("month"));
        const year = Number(searchParams.get("year"));

        let chartDateFilter = {};

        if (month !== 0 && year) {
            const startDate = new Date(year, month - 1, 1);

            const endDate = new Date(year, month, 1);

            chartDateFilter = {
                createdAt: {
                    gte: startDate,
                    lt: endDate,
                },
            };
        }

        const allOrders = await prisma.order.findMany({
            where: {
                status: "DELIVERED",
                ...chartDateFilter,
            },
            select: {
                createdAt: true,
                total: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        // Response
        const dashboardData = {
            ordersToday,
            gmvToday: gmvToday.toFixed(2),
            platformRevenueToday: platformRevenueToday.toFixed(2),
            activeDeliveries,
            activeDrivers,
            onlineDrivers,
            sellerPayable: sellerPayable.toFixed(2),
            driverPayable: driverPayable.toFixed(2),
            pendingSellerPayouts,
            pendingDriverPayouts,
            products,
            stores,
            allOrders,
        };

        return NextResponse.json({
            dashboardData,
        });
    } catch (error) {

        console.error("Admin Dashboard Error:", error);

        return NextResponse.json({
            error: error?.message || "Unable to load admin dashboard",
        },
            {
                status: 500,
            }
        );
    }
}