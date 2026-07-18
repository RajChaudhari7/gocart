import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json([], { status: 200 });
        }

        const following = await prisma.storeFollower.findMany({

            where: {
                userId,
            },

            include: {

                store: {

                    select: {

                        id: true,
                        name: true,
                        username: true,
                        logo: true,
                        isActive: true,

                    },

                },

            },

            orderBy: {
                createdAt: "desc",
            },

        });

        return NextResponse.json(
            following.map((item) => item.store)
        );

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

export async function POST(req) {

    try {

        const { userId } = await auth();

        if (!userId) {

            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );

        }

        const { storeId } = await req.json();

        if (!storeId) {

            return NextResponse.json(
                {
                    error: "Store ID is required",
                },
                {
                    status: 400,
                }
            );

        }

        const store = await prisma.store.findUnique({

            where: {
                id: storeId,
            },

        });

        if (!store) {

            return NextResponse.json(
                {
                    error: "Store not found",
                },
                {
                    status: 404,
                }
            );

        }

        const existing = await prisma.storeFollower.findUnique({

            where: {

                userId_storeId: {

                    userId,
                    storeId,

                },

            },

        });

        if (existing) {

            return NextResponse.json(
                {
                    message: "Already following",
                },
                {
                    status: 200,
                }
            );

        }

        await prisma.storeFollower.create({

            data: {

                userId,
                storeId,

            },

        });

        return NextResponse.json({
            success: true,
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