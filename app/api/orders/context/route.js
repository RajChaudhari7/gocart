import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {

        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json(
                {
                    error: "Unauthorized"
                },
                {
                    status: 401
                }
            );
        }

        const orders = await prisma.order.findMany({

            where: {
                userId
            },

            include: {

                store: {
                    select: {
                        id: true,
                        name: true,
                        username: true
                    }
                },

                driver: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        vehicle: true,
                        vehicleNo: true
                    }
                },

                address: {
                    select: {
                        name: true,
                        phone: true,
                        street: true,
                        city: true,
                        state: true,
                        zip: true
                    }
                },

                orderItems: {

                    include: {

                        product: {

                            select: {

                                id: true,
                                name: true,
                                category: true,
                                subCategory: true,
                                images: true,
                                price: true

                            }

                        }

                    }

                }

            },

            orderBy: {
                createdAt: "desc"
            },

            take: 30

        });

        const context = orders.map(order => ({

            orderId: order.id,

            status: order.status,

            total: order.total,

            paymentMethod: order.paymentMethod,

            isPaid: order.isPaid,

            createdAt: order.createdAt,

            deliveredAt: order.deliveredAt,

            pickedAt: order.pickedAt,

            assignedAt: order.assignedAt,

            otpVerified: order.otpVerified,

            statusHistory: order.statusHistory,

            store: order.store,

            driver: order.driver,

            address: order.address,

            products: order.orderItems.map(item => ({

                id: item.product.id,

                name: item.product.name,

                category: item.product.category,

                subCategory: item.product.subCategory,

                quantity: item.quantity,

                price: item.price,

                image: item.product.images?.[0] || null

            }))

        }));

        return NextResponse.json({
            success: true,
            totalOrders: context.length,
            orders: context
        });

    } catch (error) {

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