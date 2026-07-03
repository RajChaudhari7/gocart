import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {

    try {

        const { remark } = await req.json();

        const application =
            await prisma.driverApplication.findUnique({
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

        if (application.status === "APPROVED") {
            return NextResponse.json(
                {
                    error: "Approved application cannot be rejected",
                },
                {
                    status: 400,
                }
            );
        }

        await prisma.driverApplication.update({

            where: {
                id: application.id,
            },

            data: {
                status: "REJECTED",
                adminRemark: remark,
                rejectedAt: new Date(),
            },

        });

        return NextResponse.json({

            success: true,
            message: "Driver Rejected",

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