import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MAX_LIMIT = 24;
const DEFAULT_LIMIT = 12;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get("cursor");

    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const priceRange = searchParams.get("priceRange");
    const sort = searchParams.get("sort");

    const storeIdsParam = searchParams.get("storeIds");

    const storeIds = storeIdsParam
      ? storeIdsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    const requestedLimit = Number(searchParams.get("limit"));

    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

    // ==================================================
    // WHERE
    // ==================================================

    const where = {
      isArchived: false,

      quantity: {
        gt: 0,
      },

      store: {
        isActive: true,
      },
    };

    // Nearby stores
    if (storeIds.length > 0) {
      where.storeId = {
        in: storeIds,
      };
    }

    // Category
    if (category && category !== "all") {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    // Subcategory
    if (subCategory && subCategory !== "all") {
      where.subCategory = {
        equals: subCategory,
        mode: "insensitive",
      };
    }

    // ==================================================
    // PRICE RANGE
    // ==================================================

    switch (priceRange) {
      case "UNDER_500":
        where.price = {
          lt: 500,
        };
        break;

      case "500_5K":
        where.price = {
          gte: 500,
          lte: 5000,
        };
        break;

      case "5K_10K":
        where.price = {
          gt: 5000,
          lte: 10000,
        };
        break;

      case "ABOVE_10K":
        where.price = {
          gt: 10000,
        };
        break;
    }

    // ==================================================
    // SORTING
    // ==================================================

    let orderBy;

    switch (sort) {
      case "low-high":
        orderBy = [
          {
            price: "asc",
          },
          {
            id: "asc",
          },
        ];
        break;

      case "high-low":
        orderBy = [
          {
            price: "desc",
          },
          {
            id: "desc",
          },
        ];
        break;

      default:
        /*
         * Similar to your current client ranking:
         *
         * featured first
         * then sales
         * rating
         * views
         */
        orderBy = [
          {
            featured: "desc",
          },
          {
            featuredPriority: "desc",
          },
          {
            totalSales: "desc",
          },
          {
            averageRating: "desc",
          },
          {
            totalViews: "desc",
          },
          {
            createdAt: "desc",
          },
          {
            id: "desc",
          },
        ];
        break;
    }

    // ==================================================
    // QUERY
    // ==================================================

    const products = await prisma.product.findMany({
      where,

      select: {
        id: true,

        name: true,

        description: true,

        keywords: true,

        mrp: true,

        price: true,

        quantity: true,

        images: true,

        category: true,

        subCategory: true,

        size: true,

        weight: true,

        warranty: true,

        attributes: true,

        featured: true,

        featuredPriority: true,

        averageRating: true,

        totalSales: true,

        totalViews: true,

        storeId: true,

        createdAt: true,

        store: {
          select: {
            id: true,

            name: true,

            username: true,

            logo: true,

            isActive: true,
          },
        },

        _count: {
          select: {
            rating: true,
          },
        },
      },

      orderBy,

      take: limit + 1,

      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },

            skip: 1,
          }
        : {}),
    });

    // ==================================================
    // PAGINATION
    // ==================================================

    const hasMore = products.length > limit;

    const visibleProducts = hasMore ? products.slice(0, limit) : products;

    const nextCursor =
      hasMore && visibleProducts.length > 0
        ? visibleProducts[visibleProducts.length - 1].id
        : null;

    const normalizedProducts = visibleProducts.map((product) => ({
      ...product,

      reviewCount: product._count.rating,

      _count: undefined,
    }));

    return NextResponse.json({
      products: normalizedProducts,

      pagination: {
        hasMore,

        nextCursor,

        limit,
      },
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load products",
      },
      {
        status: 500,
      },
    );
  }
}
