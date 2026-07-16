import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

    try {

        const stores = await prisma.store.findMany({

            include: {

                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },

                _count: {
                    select: {
                        Product: true
                    }
                }

            },

            orderBy: {
                createdAt: "desc"
            }

        });


        const data = stores.map((store) => ({

            id: store.id,

            name: store.name,

            username: store.username,

            logo: store.logo,

            status: store.status,

            isActive: store.isActive,

            ownerName: store.user?.name,

            ownerEmail: store.user?.email,

            _count: {
                Product: store._count.Product
            }

        }));


        return NextResponse.json(data);


    } catch (error) {

        console.log(error);

        return NextResponse.json(
            {
                error: error?.message || "Something went wrong"
            },
            {
                status: 500
            }
        );

    }

}