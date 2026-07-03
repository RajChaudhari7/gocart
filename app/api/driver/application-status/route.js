import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {

    try {

        const { searchParams } = new URL(request.url);

        const phone = searchParams.get("phone");

        if (!phone) {

            return NextResponse.json(
                {
                    error: "Phone number is required",
                },
                {
                    status: 400,
                }
            );

        }

        const application =
            await prisma.driverApplication.findUnique({

                where: {
                    phone,
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

        return NextResponse.json({

            status: application.status,

            reason: application.adminRemark,

            application,

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