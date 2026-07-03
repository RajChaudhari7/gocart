import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {

        const { phone, password } = await request.json();

        const driver = await prisma.driver.findUnique({
            where: {
                phone,
            },
        });

        if (!driver) {
            return NextResponse.json(
                {
                    error: "Driver not found",
                },
                {
                    status: 404,
                }
            );
        }

        const match = await bcrypt.compare(
            password,
            driver.password
        );

        if (!match) {
            return NextResponse.json(
                {
                    error: "Invalid credentials",
                },
                {
                    status: 400,
                }
            );
        }

        if (driver.sessionId) {
            return NextResponse.json(
                {
                    error:
                        "This account is already logged in on another device. Please logout first.",
                },
                {
                    status: 400,
                }
            );
        }

        // Create new session
        const sessionId = randomUUID();

        const updatedDriver = await prisma.driver.update({
            where: {
                id: driver.id,
            },
            data: {
                isOnline: true,
                isAvailable: true,
                sessionId,
            },
        });

        // Check if driver already has an active order
        const activeOrder = await prisma.order.findFirst({
            where: {
                driverId: driver.id,
                status: {
                    in: [
                        "DRIVER_ASSIGNED",
                        "REACHED_SHOP",
                        "PICKED_UP",
                        "OUT_FOR_DELIVERY",
                        "DELIVERY_INITIATED",
                    ],
                },
            },
        });

        if (activeOrder) {
            await prisma.driver.update({
                where: {
                    id: driver.id,
                },
                data: {
                    isAvailable: false,
                },
            });

            updatedDriver.isAvailable = false;
        }

        return NextResponse.json({
            success: true,
            driver: updatedDriver,
            sessionId,
        });

    } catch (error) {

        return NextResponse.json(
            {
                error: error.message,
            },
            {
                status: 500,
            }
        );

    }
}