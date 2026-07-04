import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {

        const { searchParams } = new URL(req.url);

        const driverId = searchParams.get("driverId");

        const month = Number(searchParams.get("month"));
        const year = Number(searchParams.get("year"));
        const date = searchParams.get("date");

        if (!driverId) {
            return NextResponse.json(
                { error: "Driver id required" },
                { status: 400 }
            );
        }

        const getWeeklyData = async () => {
            const data = [];
            for (let i = 6; i >= 0; i--) {
                const start = new Date();
                start.setDate(start.getDate() - i);
                start.setHours(0, 0, 0, 0);

                const end = new Date(start);
                end.setDate(start.getDate() + 1);

                const orders = await prisma.order.findMany({
                    where: { driverId, status: "DELIVERED", createdAt: { gte: start, lt: end } }
                });

                data.push({
                    day: start.toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: orders.reduce((acc, o) => acc + (o.driverFee || 0), 0)
                });
            }
            return data;
        };

        const weeklyData = await getWeeklyData();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        let filter = {
            driverId,
            status: "DELIVERED"
        };

        if (date) {

            const start = new Date(date);
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setDate(end.getDate() + 1);

            filter.createdAt = {
                gte: start,
                lt: end
            }

        } else if (month && year) {

            filter.createdAt = {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1)
            }

        }

        // Today's Deliveries

        const todayOrders = await prisma.order.findMany({
            where: {
                driverId,
                status: "DELIVERED",
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        // Yesterday

        const yesterdayOrders = await prisma.order.findMany({
            where: {
                driverId,
                status: "DELIVERED",
                createdAt: {
                    gte: yesterday,
                    lt: today
                }
            }
        });

        // Selected Month / Date

        const filteredOrders = await prisma.order.findMany({
            where: filter,
            include: {
                address: {
                    select: {
                        name: true
                    }
                },
                store: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Active Orders

        const activeOrders = await prisma.order.count({
            where: {
                driverId,
                status: {
                    in: [
                        "DRIVER_ASSIGNED",
                        "REACHED_SHOP",
                        "PICKED_UP",
                        "OUT_FOR_DELIVERY",
                        "DELIVERY_INITIATED"
                    ]
                }
            }
        });

        // Total Delivered

        const totalDelivered = await prisma.order.count({
            where: {
                driverId,
                status: "DELIVERED"
            }
        });

        const recentOrders = filteredOrders.slice(0, 5).map(order => ({
            id: order.id,
            customer: order.address?.name || "Customer",
            store: order.store?.name || "",
            earning: order.driverFee || 0,
            status: order.status,
            createdAt: order.createdAt
        }));

        const sumRevenue = (orders) =>
            orders.reduce((acc, item) => acc + (item.driverFee || 0), 0);

        return NextResponse.json({

            dashboardData: {

                todayRevenue: sumRevenue(todayOrders),

                yesterdayRevenue: sumRevenue(yesterdayOrders),

                selectedRevenue: sumRevenue(filteredOrders),

                totalRevenue: sumRevenue(filteredOrders),

                todayDeliveries: todayOrders.length,

                yesterdayDeliveries: yesterdayOrders.length,

                selectedDeliveries: filteredOrders.length,

                activeOrders,

                totalDelivered,

                weeklyData,

                recentOrders

            }

        });

    } catch (error) {

        console.log(error);

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );

    }
}