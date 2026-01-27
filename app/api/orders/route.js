import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { items, addressId, paymentMethod } = await request.json();
        if (!items || !addressId || !paymentMethod) return NextResponse.json({ error: "All fields required" }, { status: 400 });

        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.id } });
                if (!product) throw new Error(`Product ${item.id} not found`);
                if (item.quantity > product.quantity) throw new Error(`Insufficient stock for ${product.name}`);

                // Create order
                const order = await tx.order.create({
                    data: {
                        userId,
                        storeId: product.storeId,
                        addressId,
                        total: product.price * item.quantity,
                        paymentMethod,
                        orderItems: { create: [{ productId: item.id, quantity: item.quantity, price: product.price }] }
                    }
                });

                // Update stock
                await tx.product.update({
                    where: { id: item.id },
                    data: { quantity: product.quantity - item.quantity, inStock: product.quantity - item.quantity > 0 }
                });
            }

            // Clear cart
            await tx.user.update({ where: { id: userId }, data: { cart: {} } });
        });

        return NextResponse.json({ message: "Order placed successfully" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}



// get all orders of a user
export async function GET(request) {

    try {

        const { userId } = getAuth(request)
        const orders = await prisma.order.findMany({
            where: {
                userId, OR: [
                    { paymentMethod: PaymentMethod.COD },
                    {
                        AND: [
                            { paymentMethod: PaymentMethod.STRIPE },
                            { isPaid: true }
                        ]
                    }

                ]
            },
            include: {
                orderItems: {
                    include: { product: true }
                },
                address: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ orders })

    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }

}