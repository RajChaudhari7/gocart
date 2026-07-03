import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {

    try {

        const { searchParams } = new URL(request.url);

        const status =
            searchParams.get("status") || "PENDING";

        const drivers =
            await prisma.driverApplication.findMany({

                where: {
                    status
                },

                orderBy: {
                    createdAt: "desc"
                }

            });

        return NextResponse.json(drivers);

    }

    catch (error) {

        return NextResponse.json(
            {
                error: error.message
            },
            {
                status: 500
            }
        );

    }

}