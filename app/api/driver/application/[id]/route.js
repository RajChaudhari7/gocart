import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {

    try {

        const body = await request.json();

        await prisma.driverApplication.update({

            where: {
                id: params.id
            },

            data: {

                ...body,

                status: "PENDING",

                adminRemark: null,

                rejectedAt: null,

                approvedAt: null,

            }

        });

        return NextResponse.json({

            success: true,

            message: "Application Updated"

        });

    }

    catch (error) {

        console.log(error);

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