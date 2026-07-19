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

        const totalProducts = products.length;

        const totalViews = products.reduce(
            (sum, product) => sum + product.totalViews,
            0
        );

        const totalSales = products.reduce(
            (sum, product) => sum + product.totalSales,
            0
        );

        /*
          Weighted average rating:
    
          Since the Product model only stores averageRating and does not store
          the number of ratings directly, this calculates the average across
          rated products.
    
          Products with no rating are excluded.
        */
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

        const topProducts = products.slice(0, 10).map((product) => ({
            id: product.id,
            name: product.name,
            image: product.images?.[0] || null,
            category: product.category,
            views: product.totalViews,
            sales: product.totalSales,
            stock: product.quantity,
            rating: Number(product.averageRating.toFixed(1)),
            price: product.price,
            mrp: product.mrp,
            featured: product.featured,
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
                    sales: products[0].totalSales,
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
                        sales: product.totalSales,
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