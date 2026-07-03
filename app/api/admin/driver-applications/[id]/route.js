import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
    try {
        const application = await prisma.driverApplication.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(application);
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}