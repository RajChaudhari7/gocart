import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
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

        const store = await prisma.store.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
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

        const products = await prisma.product.findMany({
            where: {
                storeId: store.id,
                isArchived: false,
            },

            select: {
                id: true,
                name: true,
                images: true,
                category: true,
                quantity: true,
                totalViews: true,
                totalSales: true,
                averageRating: true,
                price: true,
                mrp: true,
                featured: true,
                createdAt: true,
            },

            orderBy: {
                totalSales: "desc",
            },
        });

        const orderItems = await prisma.orderItem.findMany({

            where: {

                order: {
                    storeId: store.id,
                    isPaid: true,
                }

            },

            include: {

                product: {

                    select: {
                        id: true,
                        name: true,
                        totalViews: true,
                    }

                }

            }

        });

        const totalProducts = products.length;

        const totalViews = products.reduce(
            (sum, product) => sum + product.totalViews,
            0
        );

        const totalSales = products.reduce(
            (sum, product) => sum + product.totalSales,
            0
        );


        const ratedProducts = products.filter(
            (product) => product.averageRating > 0
        );

        const averageRating =
            ratedProducts.length === 0
                ? 0
                : Number(
                    (
                        ratedProducts.reduce(
                            (sum, product) => sum + product.averageRating,
                            0
                        ) / ratedProducts.length
                    ).toFixed(1)
                );

        const topProducts = products
            .slice(0, 10)
            .map((product, index) => ({
                rank: index + 1,

                id: product.id,

                name: product.name,

                image: product.images?.[0] || null,

                category: product.category,

                sold: product.totalSales,

                views: product.totalViews,

                stock: product.quantity,

                rating: Number(
                    product.averageRating.toFixed(1)
                ),

                price: product.price,

                mrp: product.mrp,

                featured: product.featured,

                revenue: Number(
                    (
                        product.totalSales *
                        product.price
                    ).toFixed(2)
                ),
            }));

        const viewsVsSalesChart = products
            .map((product) => ({
                id: product.id,
                product: product.name,
                views: product.totalViews,
                sales: product.totalSales,
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        const salesByCategory = Object.values(

            products.reduce((acc, product) => {

                const category = product.category || "Others";

                if (!acc[category]) {

                    acc[category] = {
                        category,
                        sales: 0,
                        revenue: 0,
                        products: 0,
                    };

                }

                acc[category].sales += product.totalSales;

                acc[category].revenue +=
                    product.totalSales * product.price;

                acc[category].products += 1;

                return acc;

            }, {})

        ).sort((a, b) => b.sales - a.sales);

        const topProductSalesChart = products
            .filter((product) => product.totalSales > 0)
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 10)
            .map((product, index) => ({
                rank: index + 1,

                id: product.id,

                product: product.name,

                image: product.images?.[0] || null,

                category: product.category,

                sales: product.totalSales,

                views: product.totalViews,

                price: Number(product.price),

                revenue: Number(
                    (
                        product.totalSales *
                        product.price
                    ).toFixed(2)
                ),
            }));

        const monthlySalesMap = new Map();

        const paidOrders = await prisma.order.findMany({
            where: {
                storeId: store.id,
                isPaid: true,
            },

            include: {
                orderItems: true,
            },

            orderBy: {
                createdAt: "asc",
            },
        });

        paidOrders.forEach((order) => {
            const orderDate = new Date(order.createdAt);

            const key = `${orderDate.getFullYear()}-${String(
                orderDate.getMonth() + 1
            ).padStart(2, "0")}`;

            const label = orderDate.toLocaleString("en-IN", {
                month: "short",
                year: "2-digit",
            });

            if (!monthlySalesMap.has(key)) {
                monthlySalesMap.set(key, {
                    key,
                    month: label,
                    sales: 0,
                    revenue: 0,
                    orders: 0,
                });
            }

            const current = monthlySalesMap.get(key);

            current.orders += 1;

            current.revenue += Number(order.total || 0);

            current.sales += order.orderItems.reduce(
                (sum, item) =>
                    sum + Number(item.quantity || 0),
                0
            );
        });

        const monthlySalesChart = Array.from(
            monthlySalesMap.values()
        ).map((item) => ({
            ...item,
            revenue: Number(item.revenue.toFixed(2)),
        }));

        const lowStockProducts = products
            .filter(
                (product) =>
                    product.quantity > 0 &&
                    product.quantity <= 10
            )
            .sort((a, b) => a.quantity - b.quantity)
            .map((product) => ({
                id: product.id,
                name: product.name,
                image: product.images?.[0] || null,
                stock: product.quantity,
                views: product.totalViews,
                sales: product.totalSales,
            }));

        const outOfStockProducts = products
            .filter((product) => product.quantity === 0)
            .map((product) => ({
                id: product.id,
                name: product.name,
                image: product.images?.[0] || null,
                stock: product.quantity,
                views: product.totalViews,
                sales: product.totalSales,
            }));

        const highViewsLowSalesProducts = products
            .filter(
                (product) =>
                    product.totalViews >= 100 &&
                    product.totalSales <= 5
            )
            .sort((a, b) => b.totalViews - a.totalViews)
            .map((product) => ({
                id: product.id,
                name: product.name,
                image: product.images?.[0] || null,
                views: product.totalViews,
                sales: product.totalSales,
                stock: product.quantity,
                rating: Number(product.averageRating.toFixed(1)),
            }));

        const lowRatedProducts = products
            .filter(
                (product) =>
                    product.averageRating > 0 &&
                    product.averageRating < 3.5
            )
            .sort(
                (a, b) =>
                    a.averageRating - b.averageRating
            )
            .map((product) => ({
                id: product.id,
                name: product.name,
                image: product.images?.[0] || null,
                rating: Number(product.averageRating.toFixed(1)),
                views: product.totalViews,
                sales: product.totalSales,
                stock: product.quantity,
            }));

        const bestSeller =
            products.length > 0
                ? {
                    id: products[0].id,
                    name: products[0].name,
                    image: products[0].images?.[0] || null,
                    sold: products[0].totalSales,

                    revenue:
                        Number(
                            (
                                products[0].totalSales *
                                products[0].price
                            ).toFixed(2)
                        ),
                    views: products[0].totalViews,
                    rating: Number(
                        products[0].averageRating.toFixed(1)
                    ),
                }
                : null;

        const mostViewedProduct =
            products.length > 0
                ? [...products]
                    .sort(
                        (a, b) =>
                            b.totalViews - a.totalViews
                    )
                    .map((product) => ({
                        id: product.id,
                        name: product.name,
                        image: product.images?.[0] || null,
                        sold: product.totalSales,

                        revenue:
                            Number(
                                (
                                    product.totalSales *
                                    product.price
                                ).toFixed(2)
                            ),
                        views: product.totalViews,
                        rating: Number(
                            product.averageRating.toFixed(1)
                        ),
                    }))[0]
                : null;

        return NextResponse.json({
            stats: {
                totalProducts,
                totalViews,
                totalSales,
                averageRating,
            },

            highlights: {
                bestSeller,
                mostViewedProduct,
            },

            charts: {

                viewsVsSales: viewsVsSalesChart,
                salesByCategory,
                topProductSales: topProductSalesChart,
                monthlySales: monthlySalesChart,

            },

            topProducts,

            insights: {
                lowStock: lowStockProducts.length,
                outOfStock: outOfStockProducts.length,
                highViewsLowSales:
                    highViewsLowSalesProducts.length,
                lowRated: lowRatedProducts.length,
            },

            insightProducts: {
                lowStockProducts,
                outOfStockProducts,
                highViewsLowSalesProducts,
                lowRatedProducts,
            },
        });
    } catch (error) {
        console.error(
            "Product analytics API error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error.message ||
                    "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}