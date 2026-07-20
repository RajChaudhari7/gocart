import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        /*
        |--------------------------------------------------------------------------
        | 1. Authenticate seller
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | 2. Find seller store
        |--------------------------------------------------------------------------
        */

        const store = await prisma.store.findUnique({
            where: {
                userId,
            },

            select: {
                id: true,
                name: true,
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

        /*
        |--------------------------------------------------------------------------
        | 3. Fetch active products
        |--------------------------------------------------------------------------
        |
        | Product data is used for:
        | - Product name
        | - Images
        | - Category
        | - Stock
        | - Views
        | - Rating
        | - Current selling price
        |
        | Product.totalSales will not be used as the analytics source.
        |--------------------------------------------------------------------------
        */

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
                averageRating: true,
                price: true,
                mrp: true,
                featured: true,
                createdAt: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        /*
        |--------------------------------------------------------------------------
        | 4. Fetch store orders
        |--------------------------------------------------------------------------
        |
        | isPaid is intentionally not used because COD orders generally have
        | isPaid = false until delivery/payment confirmation.
        |
        | For now, all store orders are included.
        |--------------------------------------------------------------------------
        */

        const orders = await prisma.order.findMany({
            where: {
                storeId: store.id,
            },

            select: {
                id: true,
                total: true,
                isPaid: true,
                status: true,
                createdAt: true,

                orderItems: {
                    select: {
                        id: true,
                        productId: true,
                        quantity: true,
                        price: true,

                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "asc",
            },
        });

        /*
        |--------------------------------------------------------------------------
        | 5. Create product lookup map
        |--------------------------------------------------------------------------
        */

        const productMap = new Map(
            products.map((product) => [
                product.id,
                product,
            ])
        );

        /*
        |--------------------------------------------------------------------------
        | 6. Create product sales map
        |--------------------------------------------------------------------------
        |
        | Structure:
        |
        | productId => {
        |     unitsSold,
        |     revenue,
        |     orderCount
        | }
        |--------------------------------------------------------------------------
        */

        const productSalesMap = new Map();

        /*
        |--------------------------------------------------------------------------
        | 7. Create monthly sales map
        |--------------------------------------------------------------------------
        */

        const monthlySalesMap = new Map();

        /*
        |--------------------------------------------------------------------------
        | 8. Create category sales map
        |--------------------------------------------------------------------------
        */

        const categorySalesMap = new Map();

        /*
        |--------------------------------------------------------------------------
        | 9. Process every order
        |--------------------------------------------------------------------------
        */

        orders.forEach((order) => {
            const orderDate = new Date(order.createdAt);

            const monthKey = `${orderDate.getFullYear()}-${String(
                orderDate.getMonth() + 1
            ).padStart(2, "0")}`;

            const monthLabel = orderDate.toLocaleString(
                "en-IN",
                {
                    month: "short",
                    year: "2-digit",
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Create monthly record
            |--------------------------------------------------------------------------
            */

            if (!monthlySalesMap.has(monthKey)) {
                monthlySalesMap.set(monthKey, {
                    key: monthKey,
                    month: monthLabel,
                    sales: 0,
                    revenue: 0,
                    orders: 0,
                });
            }

            const monthlyRecord =
                monthlySalesMap.get(monthKey);

            monthlyRecord.orders += 1;

            /*
            |--------------------------------------------------------------------------
            | Process each order item
            |--------------------------------------------------------------------------
            */

            order.orderItems.forEach((item) => {
                const product = productMap.get(
                    item.productId
                );

                /*
                |--------------------------------------------------------------------------
                | The historical order item price should be preferred.
                |
                | Fallback order:
                | 1. item.price
                | 2. related product price from OrderItem
                | 3. current product price
                |--------------------------------------------------------------------------
                */

                const itemPrice = Number(
                    item.price ??
                    item.product?.price ??
                    product?.price ??
                    0
                );

                const quantity = Number(
                    item.quantity || 0
                );

                const itemRevenue =
                    itemPrice * quantity;

                /*
                |--------------------------------------------------------------------------
                | Product sales aggregation
                |--------------------------------------------------------------------------
                */

                if (
                    !productSalesMap.has(
                        item.productId
                    )
                ) {
                    productSalesMap.set(
                        item.productId,
                        {
                            unitsSold: 0,
                            revenue: 0,
                            orderIds: new Set(),
                        }
                    );
                }

                const productSales =
                    productSalesMap.get(
                        item.productId
                    );

                productSales.unitsSold += quantity;

                productSales.revenue +=
                    itemRevenue;

                productSales.orderIds.add(
                    order.id
                );

                /*
                |--------------------------------------------------------------------------
                | Monthly aggregation
                |--------------------------------------------------------------------------
                */

                monthlyRecord.sales += quantity;

                monthlyRecord.revenue +=
                    itemRevenue;

                /*
                |--------------------------------------------------------------------------
                | Category aggregation
                |--------------------------------------------------------------------------
                */

                const category =
                    product?.category ||
                    "Others";

                if (
                    !categorySalesMap.has(
                        category
                    )
                ) {
                    categorySalesMap.set(
                        category,
                        {
                            category,
                            sales: 0,
                            revenue: 0,
                            productIds:
                                new Set(),
                        }
                    );
                }

                const categorySales =
                    categorySalesMap.get(
                        category
                    );

                categorySales.sales += quantity;

                categorySales.revenue +=
                    itemRevenue;

                categorySales.productIds.add(
                    item.productId
                );
            });
        });

        /*
        |--------------------------------------------------------------------------
        | 10. Normalize product sales map
        |--------------------------------------------------------------------------
        |
        | Convert Set-based order IDs into an order count.
        |--------------------------------------------------------------------------
        */

        const normalizedProductSalesMap =
            new Map();

        productSalesMap.forEach(
            (salesData, productId) => {
                normalizedProductSalesMap.set(
                    productId,
                    {
                        unitsSold:
                            salesData.unitsSold,

                        revenue: Number(
                            salesData.revenue.toFixed(
                                2
                            )
                        ),

                        orderCount:
                            salesData.orderIds.size,
                    }
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | 11. Enrich every product with actual sales
        |--------------------------------------------------------------------------
        |
        | All later tables and charts should use:
        |
        | product.unitsSold
        | product.revenue
        |
        | instead of:
        |
        | product.totalSales
        |--------------------------------------------------------------------------
        */

        const enrichedProducts = products.map(
            (product) => {
                const salesData =
                    normalizedProductSalesMap.get(
                        product.id
                    ) || {
                        unitsSold: 0,
                        revenue: 0,
                        orderCount: 0,
                    };

                return {
                    ...product,

                    price: Number(
                        product.price || 0
                    ),

                    mrp: Number(
                        product.mrp || 0
                    ),

                    averageRating: Number(
                        product.averageRating || 0
                    ),

                    totalViews: Number(
                        product.totalViews || 0
                    ),

                    quantity: Number(
                        product.quantity || 0
                    ),

                    unitsSold:
                        salesData.unitsSold,

                    revenue:
                        salesData.revenue,

                    orderCount:
                        salesData.orderCount,
                };
            }
        );

        /*
        |--------------------------------------------------------------------------
        | 12. Sorted products
        |--------------------------------------------------------------------------
        */

        const productsBySales = [
            ...enrichedProducts,
        ].sort((a, b) => {
            if (b.unitsSold !== a.unitsSold) {
                return (
                    b.unitsSold - a.unitsSold
                );
            }

            return b.revenue - a.revenue;
        });

        const productsByViews = [
            ...enrichedProducts,
        ].sort(
            (a, b) =>
                b.totalViews - a.totalViews
        );

        const totalProducts = enrichedProducts.length;

        const totalViews = enrichedProducts.reduce(
            (sum, product) => sum + product.totalViews,
            0
        );

        const totalSales = enrichedProducts.reduce(
            (sum, product) => sum + product.unitsSold,
            0
        );

        const totalRevenue = enrichedProducts.reduce(
            (sum, product) => sum + product.revenue,
            0
        );

        const ratedProducts = enrichedProducts.filter(
            (product) => product.averageRating > 0
        );

        const averageRating =
            ratedProducts.length === 0
                ? 0
                : Number(
                    (
                        ratedProducts.reduce(
                            (sum, product) =>
                                sum + product.averageRating,
                            0
                        ) / ratedProducts.length
                    ).toFixed(1)
                );

        /*
        |--------------------------------------------------------------------------
        | Best Seller
        |--------------------------------------------------------------------------
        */

        const bestSeller =
            productsBySales.length > 0
                ? {
                    id: productsBySales[0].id,

                    name: productsBySales[0].name,

                    image:
                        productsBySales[0].images?.[0] ||
                        null,

                    sold: productsBySales[0].unitsSold,

                    revenue:
                        productsBySales[0].revenue,

                    views:
                        productsBySales[0].totalViews,

                    rating: Number(
                        productsBySales[0].averageRating.toFixed(
                            1
                        )
                    ),
                }
                : null;

        /*
        |--------------------------------------------------------------------------
        | Most Viewed Product
        |--------------------------------------------------------------------------
        */

        const mostViewedProduct =
            productsByViews.length > 0
                ? {
                    id: productsByViews[0].id,

                    name: productsByViews[0].name,

                    image:
                        productsByViews[0].images?.[0] ||
                        null,

                    sold:
                        productsByViews[0].unitsSold,

                    revenue:
                        productsByViews[0].revenue,

                    views:
                        productsByViews[0].totalViews,

                    rating: Number(
                        productsByViews[0].averageRating.toFixed(
                            1
                        )
                    ),
                }
                : null;

        /*
        |--------------------------------------------------------------------------
        | Top Products Table
        |--------------------------------------------------------------------------
        */

        const topProducts = productsBySales
            .slice(0, 10)
            .map((product, index) => ({
                rank: index + 1,

                id: product.id,

                name: product.name,

                image:
                    product.images?.[0] || null,

                category: product.category,

                sold: product.unitsSold,

                views: product.totalViews,

                stock: product.quantity,

                rating: Number(
                    product.averageRating.toFixed(1)
                ),

                price: Number(product.price),

                mrp: Number(product.mrp),

                featured: product.featured,

                revenue: product.revenue,
            }));

        /*
        |--------------------------------------------------------------------------
        | Views vs Sales Chart
        |--------------------------------------------------------------------------
        */

        const viewsVsSalesChart =
            productsByViews
                .slice(0, 10)
                .map((product) => ({
                    id: product.id,

                    product: product.name,

                    views: product.totalViews,

                    sales: product.unitsSold,
                }));

        /*
        |--------------------------------------------------------------------------
        | Top Product Sales Chart
        |--------------------------------------------------------------------------
        */

        const topProductSalesChart =
            productsBySales
                .filter(
                    (product) =>
                        product.unitsSold > 0
                )
                .slice(0, 10)
                .map((product, index) => ({
                    rank: index + 1,

                    id: product.id,

                    product: product.name,

                    image:
                        product.images?.[0] || null,

                    category: product.category,

                    sales: product.unitsSold,

                    views: product.totalViews,

                    price: product.price,

                    revenue: product.revenue,
                }));

        /*
        |--------------------------------------------------------------------------
        | Sales By Category
        |--------------------------------------------------------------------------
        */

        const salesByCategory =
            Array.from(
                categorySalesMap.values()
            )
                .map((category) => ({
                    category: category.category,

                    sales: category.sales,

                    revenue: Number(
                        category.revenue.toFixed(2)
                    ),

                    products:
                        category.productIds.size,
                }))
                .sort(
                    (a, b) =>
                        b.sales - a.sales
                );

        /*
|--------------------------------------------------------------------------
| Monthly Sales Chart
|--------------------------------------------------------------------------
|
| monthlySalesMap was already populated while processing orders in Part 1.
|--------------------------------------------------------------------------
*/

        const monthlySalesChart = Array.from(
            monthlySalesMap.values()
        )
            .map((item) => ({
                key: item.key,

                month: item.month,

                sales: Number(item.sales || 0),

                revenue: Number(
                    Number(item.revenue || 0).toFixed(2)
                ),

                orders: Number(item.orders || 0),
            }))
            .sort((a, b) =>
                a.key.localeCompare(b.key)
            );

        /*
        |--------------------------------------------------------------------------
        | Low Stock Products
        |--------------------------------------------------------------------------
        */

        const lowStockProducts = enrichedProducts
            .filter(
                (product) =>
                    product.quantity > 0 &&
                    product.quantity <= 10
            )
            .sort(
                (a, b) =>
                    a.quantity - b.quantity
            )
            .map((product) => ({
                id: product.id,

                name: product.name,

                image:
                    product.images?.[0] || null,

                category:
                    product.category || "Others",

                stock: product.quantity,

                views: product.totalViews,

                sales: product.unitsSold,

                revenue: product.revenue,

                rating: Number(
                    product.averageRating.toFixed(1)
                ),
            }));

        /*
        |--------------------------------------------------------------------------
        | Out of Stock Products
        |--------------------------------------------------------------------------
        */

        const outOfStockProducts = enrichedProducts
            .filter(
                (product) =>
                    product.quantity === 0
            )
            .sort(
                (a, b) =>
                    b.unitsSold - a.unitsSold
            )
            .map((product) => ({
                id: product.id,

                name: product.name,

                image:
                    product.images?.[0] || null,

                category:
                    product.category || "Others",

                stock: product.quantity,

                views: product.totalViews,

                sales: product.unitsSold,

                revenue: product.revenue,

                rating: Number(
                    product.averageRating.toFixed(1)
                ),
            }));

        /*
        |--------------------------------------------------------------------------
        | High Views but Low Sales Products
        |--------------------------------------------------------------------------
        |
        | A product qualifies when:
        | - It has at least 100 views
        | - It has sold 5 units or fewer
        |--------------------------------------------------------------------------
        */

        const highViewsLowSalesProducts =
            enrichedProducts
                .filter(
                    (product) =>
                        product.totalViews >= 100 &&
                        product.unitsSold <= 5
                )
                .sort((a, b) => {
                    if (
                        b.totalViews !==
                        a.totalViews
                    ) {
                        return (
                            b.totalViews -
                            a.totalViews
                        );
                    }

                    return (
                        a.unitsSold -
                        b.unitsSold
                    );
                })
                .map((product) => ({
                    id: product.id,

                    name: product.name,

                    image:
                        product.images?.[0] ||
                        null,

                    category:
                        product.category ||
                        "Others",

                    views:
                        product.totalViews,

                    sales:
                        product.unitsSold,

                    stock:
                        product.quantity,

                    revenue:
                        product.revenue,

                    rating: Number(
                        product.averageRating.toFixed(
                            1
                        )
                    ),
                }));

        /*
        |--------------------------------------------------------------------------
        | Low Rated Products
        |--------------------------------------------------------------------------
        |
        | Products without ratings are excluded.
        |--------------------------------------------------------------------------
        */

        const lowRatedProducts =
            enrichedProducts
                .filter(
                    (product) =>
                        product.averageRating > 0 &&
                        product.averageRating < 3.5
                )
                .sort(
                    (a, b) =>
                        a.averageRating -
                        b.averageRating
                )
                .map((product) => ({
                    id: product.id,

                    name: product.name,

                    image:
                        product.images?.[0] ||
                        null,

                    category:
                        product.category ||
                        "Others",

                    rating: Number(
                        product.averageRating.toFixed(
                            1
                        )
                    ),

                    views:
                        product.totalViews,

                    sales:
                        product.unitsSold,

                    stock:
                        product.quantity,

                    revenue:
                        product.revenue,
                }));

        /*
        |--------------------------------------------------------------------------
        | Final API Response
        |--------------------------------------------------------------------------
        */

        return NextResponse.json(
            {
                store: {
                    id: store.id,
                    name: store.name,
                },

                stats: {
                    totalProducts,

                    totalViews,

                    totalSales,

                    totalRevenue: Number(
                        totalRevenue.toFixed(2)
                    ),

                    averageRating,
                },

                highlights: {
                    bestSeller,

                    mostViewedProduct,
                },

                charts: {
                    viewsVsSales:
                        viewsVsSalesChart,

                    salesByCategory,

                    topProductSales:
                        topProductSalesChart,

                    monthlySales:
                        monthlySalesChart,
                },

                topProducts,

                insights: {
                    lowStock:
                        lowStockProducts.length,

                    outOfStock:
                        outOfStockProducts.length,

                    highViewsLowSales:
                        highViewsLowSalesProducts.length,

                    lowRated:
                        lowRatedProducts.length,
                },

                insightProducts: {
                    lowStockProducts,

                    outOfStockProducts,

                    highViewsLowSalesProducts,

                    lowRatedProducts,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "Product analytics API error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error?.message ||
                    "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}