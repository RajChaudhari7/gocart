import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {

        const application = await prisma.driverApplication.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!application) {
            return NextResponse.json(
                {
                    error: "Application not found",
                },
                {
                    status: 404,
                }
            );
        }

        if (application.status !== "PENDING") {
            return NextResponse.json(
                {
                    error: "Application already processed",
                },
                {
                    status: 400,
                }
            );
        }

        const hashedPassword = await bcrypt.hash(
            application.password,
            10
        );

        await prisma.$transaction([

            prisma.driverApplication.update({
                where: {
                    id: application.id,
                },
                data: {
                    status: "APPROVED",
                    approvedAt: new Date(),
                },
            }),

            prisma.driver.create({
                data: {

                    name: application.name,

                    phone: application.phone,

                    password: hashedPassword,

                    vehicle: application.vehicleType,

                    vehicleNo: application.vehicleNumber,

                    isOnline: false,

                    isAvailable: true,

                    isActive: true,

                },
            }),

        ]);

        return NextResponse.json({
            success: true,
            message: "Driver Approved",
        });

    } catch (error) {

        console.log(error);

        return NextResponse.json(
            {
                error: "Something went wrong",
            },
            {
                status: 500,
            }
        );

    }
}