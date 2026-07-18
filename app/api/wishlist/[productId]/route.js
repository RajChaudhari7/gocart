import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {

    try {

        const { userId } = await auth();

        if (!userId) {

            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );

        }

        const { productId } = params;

        await prisma.wishlist.delete({

            where: {

                userId_productId: {

                    userId,
                    productId,

                }

            }

        });

        return NextResponse.json({

            success: true

        });

    } catch (error) {

        console.log(error);

        return NextResponse.json(

            {
                message: "Internal Server Error"
            },

            {
                status: 500
            }

        );

    }

}