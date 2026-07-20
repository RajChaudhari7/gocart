import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
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

        const { searchParams } = new URL(request.url);

        const range = searchParams.get("range") || "30d";

        const search = searchParams.get("search")?.trim() || "";

        const category =
            searchParams.get("category") || "all";

        const sort =
            searchParams.get("sort") || "bestSelling";

        const featured =
            searchParams.get("featured") === "true";

        const stock =
            searchParams.get("stock") || "all";

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

        let startDate = null;

        const now = new Date();

        switch (range) {
            case "today":
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                break;

            case "yesterday":
                startDate = new Date();
                startDate.setDate(
                    startDate.getDate() - 1
                );
                startDate.setHours(0, 0, 0, 0);
                break;

            case "7d":
                startDate = new Date();
                startDate.setDate(
                    startDate.getDate() - 7
                );
                break;

            case "30d":
                startDate = new Date();
                startDate.setDate(
                    startDate.getDate() - 30
                );
                break;

            case "90d":
                startDate = new Date();
                startDate.setDate(
                    startDate.getDate() - 90
                );
                break;

            case "thisMonth":
                startDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                );
                break;

            case "lastMonth":
                startDate = new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1
                );
                break;

            case "12m":
                startDate = new Date();
                startDate.setMonth(
                    startDate.getMonth() - 12
                );
                break;

            default:
                startDate = null;
        }

        const products = await prisma.product.findMany({
            where: {
                storeId: store.id,
                isArchived: false,

                ...(category !== "all" && {
                    category,
                }),

                ...(search && {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                }),
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


        const orders = await prisma.order.findMany({
            where: {
                storeId: store.id,

                ...(startDate && {
                    createdAt: {
                        gte: startDate,
                    },
                }),
            },

            select: {
                id: true,
                total: true,
                status: true,
                isPaid: true,
                paymentMethod: true,
                commissionPercent: true,
                deliveryFee: true,
                driverFee: true,
                createdAt: true,

                orderItems: {
                    select: {
                        orderId: true,
                        productId: true,
                        quantity: true,
                        price: true,
                    },
                },
            },

            orderBy: {
                createdAt: "asc",
            },
        });

        const productMap = new Map(
            products.map((product) => [
                product.id,
                product,
            ])
        );

        const productSalesMap = new Map();

        products.forEach((product) => {
            productSalesMap.set(product.id, {
                unitsSold: 0,
                grossRevenue: 0,
                commissionAmount: 0,
                sellerEarnings: 0,
                orderIds: new Set(),
            });
        });

        const monthlySalesMap = new Map();

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

            order.orderItems.forEach((item) => {
                if (
                    !filteredProductIds.has(
                        item.productId
                    )
                ) {
                    return;
                }
                const product = productMap.get(
                    item.productId
                );


                // The historical order item price should be preferred.

                const itemPrice = Number(
                    item.price ??
                    item.product?.price ??
                    product?.price ??
                    0
                );

                const quantity = Number(
                    item.quantity || 0
                );

                const grossRevenue = itemPrice * quantity;

                const commissionPercent = Number(
                    order.commissionPercent || 0
                );

                const commissionAmount =
                    grossRevenue *
                    (commissionPercent / 100);

                const sellerEarnings =
                    grossRevenue - commissionAmount;

                const productSales =
                    productSalesMap.get(item.productId);

                productSales.unitsSold += quantity;

                productSales.grossRevenue += grossRevenue;

                productSales.commissionAmount += commissionAmount;

                productSales.sellerEarnings += sellerEarnings;

                productSales.orderIds.add(order.id);

                productSales.orderIds.add(
                    order.id
                );

                monthlyRecord.sales += quantity;

                monthlyRecord.revenue += sellerEarnings;


                // Category aggregation


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

                categorySales.revenue += sellerEarnings;

                categorySales.productIds.add(
                    item.productId
                );
            });
        });

        const normalizedProductSalesMap =
            new Map();

        productSalesMap.forEach(
            (salesData, productId) => {
                normalizedProductSalesMap.set(productId, {

                    unitsSold: salesData.unitsSold,

                    grossRevenue: Number(
                        salesData.grossRevenue.toFixed(2)
                    ),

                    commissionAmount: Number(
                        salesData.commissionAmount.toFixed(2)
                    ),

                    sellerEarnings: Number(
                        salesData.sellerEarnings.toFixed(2)
                    ),

                    orderCount:
                        salesData.orderIds.size,
                });
            }
        );


        let enrichedProducts = products.map(
            (product) => {
                const salesData =
                    normalizedProductSalesMap.get(product.id) || {
                        unitsSold: 0,
                        grossRevenue: 0,
                        commissionAmount: 0,
                        sellerEarnings: 0,
                        orderCount: 0,
                    };

                return {
                    ...product,

                    price: Number(product.price || 0),

                    mrp: Number(product.mrp || 0),

                    averageRating: Number(
                        product.averageRating || 0
                    ),

                    totalViews: Number(
                        product.totalViews || 0
                    ),

                    quantity: Number(
                        product.quantity || 0
                    ),

                    unitsSold: Number(
                        salesData.unitsSold || 0
                    ),

                    grossRevenue: Number(
                        salesData.grossRevenue || 0
                    ),

                    commissionAmount: Number(
                        salesData.commissionAmount || 0
                    ),

                    sellerEarnings: Number(
                        salesData.sellerEarnings || 0
                    ),

                    orderCount: Number(
                        salesData.orderCount || 0
                    ),

                    featured: Boolean(product.featured),
                };
            }
        );



        if (featured) {
            enrichedProducts =
                enrichedProducts.filter(
                    (product) => product.featured
                );
        }

        if (stock !== "all") {
            enrichedProducts = enrichedProducts.filter((product) => {
                switch (stock) {
                    case "inStock":
                        return product.quantity > 10;

                    case "lowStock":
                        return (
                            product.quantity > 0 &&
                            product.quantity <= 10
                        );

                    case "outOfStock":
                        return product.quantity === 0;

                    default:
                        return true;
                }
            });
        }

        const filteredProductIds = new Set(
            enrichedProducts.map(
                (product) => product.id
            )
        );



        switch (sort) {
            case "bestSelling":
                enrichedProducts.sort(
                    (a, b) =>
                        b.unitsSold - a.unitsSold
                );
                break;

            case "mostViewed":
                enrichedProducts.sort(
                    (a, b) =>
                        b.totalViews - a.totalViews
                );
                break;

            case "grossRevenue":
                enrichedProducts.sort(
                    (a, b) =>
                        b.grossRevenue -
                        a.grossRevenue
                );
                break;

            case "sellerEarnings":
                enrichedProducts.sort(
                    (a, b) =>
                        b.sellerEarnings -
                        a.sellerEarnings
                );
                break;

            case "highestRating":
                enrichedProducts.sort(
                    (a, b) =>
                        b.averageRating -
                        a.averageRating
                );
                break;

            case "lowestStock":
                enrichedProducts.sort(
                    (a, b) =>
                        a.quantity - b.quantity
                );
                break;

            case "newest":
                enrichedProducts.sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                );
                break;

            case "oldest":
                enrichedProducts.sort(
                    (a, b) =>
                        new Date(a.createdAt) -
                        new Date(b.createdAt)
                );
                break;

            default:
                enrichedProducts.sort(
                    (a, b) =>
                        b.unitsSold - a.unitsSold
                );
        }

        const categorySalesMap = new Map();

        enrichedProducts.forEach((product) => {
            const key =
                product.category || "Others";

            if (!categorySalesMap.has(key)) {
                categorySalesMap.set(key, {
                    category: key,
                    sales: 0,
                    revenue: 0,
                    productIds: new Set(),
                });
            }

            const category =
                categorySalesMap.get(key);

            category.sales +=
                product.unitsSold;

            category.revenue +=
                product.grossRevenue;

            category.productIds.add(product.id);
        });
        const productsBySales = [
            ...enrichedProducts,
        ].sort((a, b) => {
            if (b.unitsSold !== a.unitsSold) {
                return (
                    b.unitsSold - a.unitsSold
                );
            }

            return b.grossRevenue - a.grossRevenue;
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

        const totalGrossRevenue =
            enrichedProducts.reduce(
                (sum, product) =>
                    sum + product.grossRevenue,
                0
            );

        const totalCommission =
            enrichedProducts.reduce(
                (sum, product) =>
                    sum + product.commissionAmount,
                0
            );

        const totalSellerEarnings =
            enrichedProducts.reduce(
                (sum, product) =>
                    sum + product.sellerEarnings,
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

        const bestSeller =
            productsBySales.length > 0
                ? {
                    id: productsBySales[0].id,

                    name: productsBySales[0].name,

                    image:
                        productsBySales[0].images?.[0] ||
                        null,

                    sold: productsBySales[0].unitsSold,

                    grossRevenue:
                        productsBySales[0].grossRevenue,

                    commission:
                        productsBySales[0].commissionAmount,

                    sellerEarnings:
                        productsBySales[0].sellerEarnings,

                    views:
                        productsBySales[0].totalViews,

                    rating: Number(
                        productsBySales[0].averageRating.toFixed(
                            1
                        )
                    ),
                }
                : null;
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

                    grossRevenue:
                        productsByViews[0].grossRevenue,

                    commission:
                        productsByViews[0].commissionAmount,

                    sellerEarnings:
                        productsByViews[0].sellerEarnings,

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

        const topProducts = enrichedProducts
            .slice(0, 10)
            .map((product, index) => ({
                rank: index + 1,

                id: product.id,

                name: product.name,

                image:
                    product.images?.[0] || null,

                category:
                    product.category || "Others",

                sold: product.unitsSold,

                views: product.totalViews,

                stock: product.quantity,

                rating: Number(
                    product.averageRating.toFixed(1)
                ),

                price: product.price,

                mrp: product.mrp,

                featured: product.featured,

                grossRevenue:
                    product.grossRevenue,

                commission:
                    product.commissionAmount,

                sellerEarnings:
                    product.sellerEarnings,
            }));

        const viewsVsSalesChart = [
            ...enrichedProducts,
        ]
            .sort(
                (a, b) =>
                    b.totalViews - a.totalViews
            )
            .slice(0, 10)
            .map((product) => ({
                id: product.id,

                name: product.name,

                views: product.totalViews,

                sales: product.unitsSold,
            }));

        const topProductSalesChart = [
            ...enrichedProducts,
        ]
            .filter(
                (product) =>
                    product.unitsSold > 0
            )
            .sort(
                (a, b) =>
                    b.unitsSold - a.unitsSold
            )
            .slice(0, 10)
            .map((product, index) => ({
                rank: index + 1,

                id: product.id,

                name: product.name,

                image:
                    product.images?.[0] || null,

                category:
                    product.category || "Others",

                sales: product.unitsSold,

                views: product.totalViews,

                price: product.price,

                grossRevenue:
                    product.grossRevenue,

                commission:
                    product.commissionAmount,

                sellerEarnings:
                    product.sellerEarnings,
            }));

        const salesByCategory =
            Array.from(
                categorySalesMap.values()
            )
                .map((category) => ({
                    category: category.category,

                    sales: category.sales,

                    grossRevenue: Number(category.revenue.toFixed(2)),

                    products:
                        category.productIds.size,
                }))
                .sort(
                    (a, b) =>
                        b.sales - a.sales
                );

        // Monthly Sales Chart

        const monthlySalesChart = Array.from(
            monthlySalesMap.values()
        )
            .map((item) => ({
                key: item.key,

                month: item.month,

                sales: Number(item.sales || 0),

                grossRevenue: Number(item.revenue.toFixed(2)),

                orders: Number(item.orders || 0),
            }))
            .sort((a, b) =>
                a.key.localeCompare(b.key)
            );

        const lowStockProducts =
            enrichedProducts
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

                    grossRevenue:
                        product.grossRevenue,

                    commission:
                        product.commissionAmount,

                    sellerEarnings:
                        product.sellerEarnings,

                    rating: Number(
                        Number(
                            product.averageRating || 0
                        ).toFixed(1)
                    ),
                }));

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

                grossRevenue:
                    product.grossRevenue,

                commission:
                    product.commissionAmount,

                sellerEarnings:
                    product.sellerEarnings,

                rating: Number(
                    product.averageRating.toFixed(1)
                ),
            }));


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

                    grossRevenue:
                        product.grossRevenue,

                    commission:
                        product.commissionAmount,

                    sellerEarnings:
                        product.sellerEarnings,

                    rating: Number(
                        product.averageRating.toFixed(
                            1
                        )
                    ),
                }));

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

                    grossRevenue:
                        product.grossRevenue,

                    commission:
                        product.commissionAmount,

                    sellerEarnings:
                        product.sellerEarnings,
                }));


        return NextResponse.json(
            {
                store: {
                    id: store.id,
                    name: store.name,
                },

                filters: {
                    range,
                    search,
                    category,
                },

                stats: {
                    totalProducts,

                    totalViews,

                    totalSales,

                    grossRevenue: Number(
                        totalGrossRevenue.toFixed(2)
                    ),

                    commission: Number(
                        totalCommission.toFixed(2)
                    ),

                    sellerEarnings: Number(
                        totalSellerEarnings.toFixed(2)
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