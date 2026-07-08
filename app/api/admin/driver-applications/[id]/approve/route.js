import prisma from "@/lib/prisma";
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

        // Already approved
        if (application.status === "APPROVED") {
            return NextResponse.json(
                {
                    error: "Application already approved",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if driver already exists
        const existingDriver = await prisma.driver.findUnique({
            where: {
                phone: application.phone,
            },
        });

        await prisma.$transaction(async (tx) => {

            await tx.driverApplication.update({
                where: {
                    id: application.id,
                },
                data: {
                    status: "APPROVED",
                    approvedAt: new Date(),
                    rejectedAt: null,
                    adminRemark: null,
                },
            });

            if (!existingDriver) {

                await tx.driver.create({
                    data: {
                        name: application.name,
                        phone: application.phone,

                        password: application.password,

                        profilePhoto: application.profilePhoto,

                        vehicle: application.vehicleType,
                        vehicleNo: application.vehicleNumber,

                        isOnline: false,
                        isAvailable: true,
                        isActive: true,
                    },
                });

            } else {

                await tx.driver.update({
                    where: {
                        id: existingDriver.id,
                    },
                    data: {
                        name: application.name,
                        email: application.email,

                        profilePhoto: application.profilePhoto,

                        vehicle: application.vehicleType,
                        vehicleNo: application.vehicleNumber,

                        isActive: true,
                    },
                });

            }

        });

        return NextResponse.json({
            success: true,
            message: "Driver Approved",
        });

    } catch (error) {

        console.log(error);

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