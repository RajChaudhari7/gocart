import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// api to get user wishlist
export async function GET() {

    try {

        const { userId } = await auth();

        if (!userId) {

            return NextResponse.json({ message: "Unautorized" }, { status: 401 });

        }

        const wishlist = await prisma.wishlist.findMany({

            where: {
                userId
            },

            include: {
                product: {
                    include: {
                        store: true,
                        rating: true,
                    }
                }
            },

            orderBy: {
                createdAt: "desc"
            }

        });

        return NextResponse.json(wishlist);

    } catch (error) {

        console.log(error);

        return NextResponse.json({ message: "Internal Server Error: " }, { status: 500 });
    }

}

// add product in the api
export async function POST(request) {

    try {

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ message: "Unautorized" }, { status: 401 });
        }

        const body = await request.json();


        const { productId } = body;

        if (!productId) {

            return NextResponse.json({ message: "Product required" }, { status: 400 });

        }

        const alreadyExists = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });

        if (alreadyExists) {
            return NextResponse.json({ message: "Already in Wishlist" }, { status: 400 });
        }

        const wishlist = await prisma.wishlist.create({
            data: {
                userId,
                productId
            }
        });

        return NextResponse.json(wishlist);

    } catch (error) {

        console.log(error);

        return NextResponse.json({ message: "Internal Server error" }, { status: 500 });

    }

}