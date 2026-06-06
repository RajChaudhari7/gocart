import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
    try {
        const driver = await prisma.driver.findUnique({
            where: {
                id: params.id
            }
        });

        if (!driver) {
            return NextResponse.json(
                {
                    error: "Driver not found"
                },
                {
                    status: 404
                }
            );
        }

        const updatedDriver = await prisma.driver.update({
            where: {
                id: params.id
            },
            data: {
                isActive: !driver.isActive
            }
        });

        return NextResponse.json(updatedDriver);
    } catch (error) {
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