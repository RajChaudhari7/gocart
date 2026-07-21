import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


function sortProducts(products, sort) {
    const sortedProducts = [...products];

    switch (sort) {
        case "mostViewed":
            return sortedProducts.sort(
                (a, b) =>
                    b.totalViews - a.totalViews
            );

        case "grossRevenue":
            return sortedProducts.sort(
                (a, b) =>
                    b.grossRevenue -
                    a.grossRevenue
            );

        case "sellerEarnings":
            return sortedProducts.sort(
                (a, b) =>
                    b.sellerEarnings -
                    a.sellerEarnings
            );

        case "highestRating":
            return sortedProducts.sort(
                (a, b) =>
                    b.averageRating -
                    a.averageRating
            );

        case "lowestStock":
            return sortedProducts.sort(
                (a, b) =>
                    a.quantity - b.quantity
            );

        case "newest":
            return sortedProducts.sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );

        case "oldest":
            return sortedProducts.sort(
                (a, b) =>
                    new Date(a.createdAt) -
                    new Date(b.createdAt)
            );

        case "bestSelling":
        default:
            return sortedProducts.sort((a, b) => {
                if (b.unitsSold !== a.unitsSold) {
                    return b.unitsSold - a.unitsSold;
                }

                return (
                    b.grossRevenue -
                    a.grossRevenue
                );
            });
    }
}

export async function GET(request) {

    try {

        const { userId } = await auth();

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

        const { searchParams } = new URL(request.url);

        const filters = {

            range:
                searchParams.get("range") || "30d",

            search:
                searchParams.get("search")?.trim() || "",

            category:
                searchParams.get("category") || "all",

            sort:
                searchParams.get("sort") || "bestSelling",

            featured:
                searchParams.get("featured") === "true",

            stock:
                searchParams.get("stock") || "all"

        };
        const store =
            await prisma.store.findUnique({

                where: {
                    userId
                },

                select: {

                    id: true,

                    name: true

                }

            });

        if (!store) {

            return NextResponse.json(
                {
                    error: "Store not found"
                },
                {
                    status: 404
                }
            );

        }
        let startDate = null;

        const now = new Date();

        switch (filters.range) {

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
        const productWhere = {

            storeId: store.id,

            isArchived: false

        };
        if (filters.search) {

            productWhere.name = {

                contains: filters.search,

                mode: "insensitive"

            };

        }
        if (filters.category !== "all") {

            productWhere.category =
                filters.category;

        }
        if (filters.featured) {

            productWhere.featured = true;

        }
        switch (filters.stock) {

            case "inStock":

                productWhere.quantity = {

                    gt: 10

                };

                break;

            case "lowStock":

                productWhere.quantity = {

                    gt: 0,

                    lte: 10

                };

                break;

            case "outOfStock":

                productWhere.quantity = 0;

                break;

        }
        const products = await prisma.product.findMany({

            where: productWhere,

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
                createdAt: true

            },

            orderBy: {
                createdAt: "desc"
            }

        });
        if (products.length === 0) {

            return NextResponse.json({

                store,

                filters,

                stats: {

                    totalProducts: 0,

                    totalViews: 0,

                    totalSales: 0,

                    grossRevenue: 0,

                    commission: 0,

                    sellerEarnings: 0,

                    averageRating: 0

                },

                highlights: {

                    bestSeller: null,

                    mostViewedProduct: null

                },

                charts: {

                    viewsVsSales: [],

                    salesByCategory: [],

                    topProductSales: [],

                    monthlySales: []

                },

                topProducts: [],

                insights: {

                    lowStock: 0,

                    outOfStock: 0,

                    highViewsLowSales: 0,

                    lowRated: 0

                },

                insightProducts: {

                    lowStockProducts: [],

                    outOfStockProducts: [],

                    highViewsLowSalesProducts: [],

                    lowRatedProducts: []

                }

            });

        }
        const productIds = products.map(
            (product) => product.id
        );

        const orders =
            await prisma.order.findMany({
                where: {
                    storeId: store.id,

                    ...(startDate && {
                        createdAt: {
                            gte: startDate,
                        },
                    }),

                    orderItems: {
                        some: {
                            productId: {
                                in: productIds,
                            },
                        },
                    },
                },

                select: {
                    id: true,
                    createdAt: true,
                    commissionPercent: true,

                    orderItems: {
                        where: {
                            productId: {
                                in: productIds,
                            },
                        },

                        select: {
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
            const orderDate =
                new Date(order.createdAt);

            const monthKey =
                `${orderDate.getFullYear()}-${String(
                    orderDate.getMonth() + 1
                ).padStart(2, "0")}`;

            const monthLabel =
                orderDate.toLocaleString("en-IN", {
                    month: "short",
                    year: "2-digit",
                });

            if (!monthlySalesMap.has(monthKey)) {
                monthlySalesMap.set(monthKey, {
                    key: monthKey,
                    month: monthLabel,
                    sales: 0,
                    grossRevenue: 0,
                    commission: 0,
                    sellerEarnings: 0,
                    orderIds: new Set(),
                });
            }

            const monthlyRecord =
                monthlySalesMap.get(monthKey);

            order.orderItems.forEach((item) => {
                const productSales =
                    productSalesMap.get(
                        item.productId
                    );

                if (!productSales) {
                    return;
                }

                const quantity = Number(
                    item.quantity || 0
                );

                const itemPrice = Number(
                    item.price || 0
                );

                const grossRevenue =
                    itemPrice * quantity;

                const commissionPercent =
                    Number(
                        order.commissionPercent || 0
                    );

                const commissionAmount =
                    grossRevenue *
                    (commissionPercent / 100);

                const sellerEarnings =
                    grossRevenue -
                    commissionAmount;

                productSales.unitsSold +=
                    quantity;

                productSales.grossRevenue +=
                    grossRevenue;

                productSales.commissionAmount +=
                    commissionAmount;

                productSales.sellerEarnings +=
                    sellerEarnings;

                productSales.orderIds.add(
                    order.id
                );

                monthlyRecord.sales += quantity;

                monthlyRecord.grossRevenue +=
                    grossRevenue;

                monthlyRecord.commission +=
                    commissionAmount;

                monthlyRecord.sellerEarnings +=
                    sellerEarnings;

                monthlyRecord.orderIds.add(
                    order.id
                );
            });
        });
        const enrichedProducts =
            products.map((product) => {
                const salesData =
                    productSalesMap.get(
                        product.id
                    ) || {
                        unitsSold: 0,
                        grossRevenue: 0,
                        commissionAmount: 0,
                        sellerEarnings: 0,
                        orderIds: new Set(),
                    };

                return {
                    ...product,

                    price: Number(
                        product.price || 0
                    ),

                    mrp: Number(
                        product.mrp || 0
                    ),

                    quantity: Number(
                        product.quantity || 0
                    ),

                    totalViews: Number(
                        product.totalViews || 0
                    ),

                    averageRating: Number(
                        product.averageRating || 0
                    ),

                    featured: Boolean(
                        product.featured
                    ),

                    unitsSold: Number(
                        salesData.unitsSold || 0
                    ),

                    grossRevenue: Number(
                        salesData.grossRevenue.toFixed(2)
                    ),

                    commissionAmount: Number(
                        salesData.commissionAmount.toFixed(
                            2
                        )
                    ),

                    sellerEarnings: Number(
                        salesData.sellerEarnings.toFixed(
                            2
                        )
                    ),

                    orderCount:
                        salesData.orderIds.size,
                };
            });
        const sortedProducts = sortProducts(
            enrichedProducts,
            filters.sort
        );

        const productsBySales = [
            ...enrichedProducts,
        ].sort((a, b) => {
            if (b.unitsSold !== a.unitsSold) {
                return (
                    b.unitsSold - a.unitsSold
                );
            }

            return (
                b.grossRevenue -
                a.grossRevenue
            );
        });

        const productsByViews = [
            ...enrichedProducts,
        ].sort(
            (a, b) =>
                b.totalViews - a.totalViews
        );
        const totalProducts =
            enrichedProducts.length;

        const totalViews =
            enrichedProducts.reduce(
                (sum, product) =>
                    sum + product.totalViews,
                0
            );

        const totalSales =
            enrichedProducts.reduce(
                (sum, product) =>
                    sum + product.unitsSold,
                0
            );

        const totalGrossRevenue =
            enrichedProducts.reduce(
                (sum, product) =>
                    sum +
                    product.grossRevenue,
                0
            );

        const totalCommission =
            enrichedProducts.reduce(
                (sum, product) =>
                    sum +
                    product.commissionAmount,
                0
            );

        const totalSellerEarnings =
            enrichedProducts.reduce(
                (sum, product) =>
                    sum +
                    product.sellerEarnings,
                0
            );

        const ratedProducts =
            enrichedProducts.filter(
                (product) =>
                    product.averageRating > 0
            );

        const averageRating =
            ratedProducts.length === 0
                ? 0
                : Number(
                    (
                        ratedProducts.reduce(
                            (sum, product) =>
                                sum +
                                product.averageRating,
                            0
                        ) /
                        ratedProducts.length
                    ).toFixed(1)
                );
        const bestSeller =
            productsBySales.length > 0
                ? {
                    id:
                        productsBySales[0].id,

                    name:
                        productsBySales[0].name,

                    image:
                        productsBySales[0]
                            .images?.[0] ||
                        null,

                    sold:
                        productsBySales[0]
                            .unitsSold,

                    views:
                        productsBySales[0]
                            .totalViews,

                    rating: Number(
                        productsBySales[0].averageRating.toFixed(
                            1
                        )
                    ),

                    grossRevenue:
                        productsBySales[0]
                            .grossRevenue,

                    commission:
                        productsBySales[0]
                            .commissionAmount,

                    sellerEarnings:
                        productsBySales[0]
                            .sellerEarnings,
                }
                : null;

        const mostViewedProduct =
            productsByViews.length > 0
                ? {
                    id:
                        productsByViews[0].id,

                    name:
                        productsByViews[0].name,

                    image:
                        productsByViews[0]
                            .images?.[0] ||
                        null,

                    sold:
                        productsByViews[0]
                            .unitsSold,

                    views:
                        productsByViews[0]
                            .totalViews,

                    rating: Number(
                        productsByViews[0].averageRating.toFixed(
                            1
                        )
                    ),

                    grossRevenue:
                        productsByViews[0]
                            .grossRevenue,

                    commission:
                        productsByViews[0]
                            .commissionAmount,

                    sellerEarnings:
                        productsByViews[0]
                            .sellerEarnings,
                }
                : null;
        const topProducts =
            sortedProducts
                .slice(0, 10)
                .map(
                    (product, index) => ({
                        rank: index + 1,

                        id: product.id,

                        name: product.name,

                        image:
                            product.images?.[0] ||
                            null,

                        category:
                            product.category ||
                            "Others",

                        sold:
                            product.unitsSold,

                        views:
                            product.totalViews,

                        stock:
                            product.quantity,

                        rating: Number(
                            product.averageRating.toFixed(
                                1
                            )
                        ),

                        price:
                            product.price,

                        mrp:
                            product.mrp,

                        featured:
                            product.featured,

                        grossRevenue:
                            product.grossRevenue,

                        commission:
                            product.commissionAmount,

                        sellerEarnings:
                            product.sellerEarnings,
                    })
                );
        const viewsVsSalesChart =
            productsByViews
                .slice(0, 10)
                .map((product) => ({
                    id: product.id,

                    name: product.name,

                    views:
                        product.totalViews,

                    sales:
                        product.unitsSold,
                }));
        const topProductSalesChart =
            productsBySales
                .filter(
                    (product) =>
                        product.unitsSold > 0
                )
                .slice(0, 10)
                .map(
                    (product, index) => ({
                        rank: index + 1,

                        id: product.id,

                        name: product.name,

                        image:
                            product.images?.[0] ||
                            null,

                        category:
                            product.category ||
                            "Others",

                        sales:
                            product.unitsSold,

                        views:
                            product.totalViews,

                        price:
                            product.price,

                        grossRevenue:
                            product.grossRevenue,

                        commission:
                            product.commissionAmount,

                        sellerEarnings:
                            product.sellerEarnings,
                    })
                );
        const categorySalesMap =
            new Map();

        enrichedProducts.forEach(
            (product) => {
                const category =
                    product.category ||
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
                            grossRevenue: 0,
                            commission: 0,
                            sellerEarnings: 0,
                            productIds:
                                new Set(),
                        }
                    );
                }

                const categoryData =
                    categorySalesMap.get(
                        category
                    );

                categoryData.sales +=
                    product.unitsSold;

                categoryData.grossRevenue +=
                    product.grossRevenue;

                categoryData.commission +=
                    product.commissionAmount;

                categoryData.sellerEarnings +=
                    product.sellerEarnings;

                categoryData.productIds.add(
                    product.id
                );
            }
        );

        const salesByCategory =
            Array.from(
                categorySalesMap.values()
            )
                .map((category) => ({
                    category:
                        category.category,

                    sales:
                        category.sales,

                    grossRevenue: Number(
                        category.grossRevenue.toFixed(
                            2
                        )
                    ),

                    commission: Number(
                        category.commission.toFixed(
                            2
                        )
                    ),

                    sellerEarnings: Number(
                        category.sellerEarnings.toFixed(
                            2
                        )
                    ),

                    products:
                        category.productIds.size,
                }))
                .sort(
                    (a, b) =>
                        b.sales - a.sales
                );
        const monthlySalesChart =
            Array.from(
                monthlySalesMap.values()
            )
                .map((item) => ({
                    key: item.key,

                    month: item.month,

                    sales: Number(
                        item.sales || 0
                    ),

                    grossRevenue: Number(
                        item.grossRevenue.toFixed(
                            2
                        )
                    ),

                    commission: Number(
                        item.commission.toFixed(
                            2
                        )
                    ),

                    sellerEarnings: Number(
                        item.sellerEarnings.toFixed(
                            2
                        )
                    ),

                    orders:
                        item.orderIds.size,
                }))
                .sort((a, b) =>
                    a.key.localeCompare(b.key)
                );
        const mapInsightProduct = (
            product
        ) => ({
            id: product.id,

            name: product.name,

            image:
                product.images?.[0] || null,

            category:
                product.category || "Others",

            stock:
                product.quantity,

            views:
                product.totalViews,

            sales:
                product.unitsSold,

            rating: Number(
                product.averageRating.toFixed(1)
            ),

            grossRevenue:
                product.grossRevenue,

            commission:
                product.commissionAmount,

            sellerEarnings:
                product.sellerEarnings,
        });

        const lowStockProducts =
            enrichedProducts
                .filter(
                    (product) =>
                        product.quantity > 0 &&
                        product.quantity <= 10
                )
                .sort(
                    (a, b) =>
                        a.quantity -
                        b.quantity
                )
                .map(mapInsightProduct);

        const outOfStockProducts =
            enrichedProducts
                .filter(
                    (product) =>
                        product.quantity === 0
                )
                .sort(
                    (a, b) =>
                        b.unitsSold -
                        a.unitsSold
                )
                .map(mapInsightProduct);

        const highViewsLowSalesProducts =
            enrichedProducts
                .filter(
                    (product) =>
                        product.totalViews >=
                        100 &&
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
                .map(mapInsightProduct);

        const lowRatedProducts =
            enrichedProducts
                .filter(
                    (product) =>
                        product.averageRating >
                        0 &&
                        product.averageRating <
                        3.5
                )
                .sort(
                    (a, b) =>
                        a.averageRating -
                        b.averageRating
                )
                .map(mapInsightProduct);
        return NextResponse.json(
            {
                store: {
                    id: store.id,
                    name: store.name,
                },

                filters,

                stats: {
                    totalProducts,

                    totalViews,

                    totalSales,

                    grossRevenue: Number(
                        totalGrossRevenue.toFixed(
                            2
                        )
                    ),

                    commission: Number(
                        totalCommission.toFixed(
                            2
                        )
                    ),

                    sellerEarnings: Number(
                        totalSellerEarnings.toFixed(
                            2
                        )
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
            "Filtered product analytics API error:",
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