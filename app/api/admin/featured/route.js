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

            totalProducts: store.Product.length,

            featuredProducts: store.Product.filter(
                (product) => product.featured
            ).length,

        }));

        return NextResponse.json(data);

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