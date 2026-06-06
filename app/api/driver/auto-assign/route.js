import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
    try {

        const orders = await prisma.order.findMany({
            where: {
                driverId: null,
                status: "ORDER_PLACED",
            },
            include: {
                store: true,
            },
        });

        const drivers = await prisma.driver.findMany({
            where: {
                isOnline: true,
                isActive: true,
            },
        });

        for (const order of orders) {

            const availableDriver = drivers.find(
                d => d.storeId === order.storeId
            );

            if (availableDriver) {
                await prisma.order.update({
                    where: {
                        id: order.id,
                    },
                    data: {
                        driverId: availableDriver.id,
                        assignedAt: new Date(),
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}