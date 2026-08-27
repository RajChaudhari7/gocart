import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

import { generalRateLimit, redis } from "@/lib/ratelimit";
import { getRateLimitIdentifier } from "@/lib/getRateLimitIdentifier";
import { rateLimitResponse } from "@/lib/rateLimitResponse";

const CACHE_KEY = "nandurbar-bazar:trending-products";
const CACHE_TTL = 45; // seconds

export async function GET(request) {
  try {
    // ==================================================
    // RATE LIMIT
    // ==================================================

    const identifier = getRateLimitIdentifier(request);

    const rateLimit = await generalRateLimit.limit(`trending:${identifier}`);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // ==================================================
    // CHECK REDIS CACHE
    // ==================================================

    try {
      const cachedProducts = await redis.get(CACHE_KEY);

      if (cachedProducts) {
        return NextResponse.json(cachedProducts, {
          headers: {
            "X-Cache": "HIT",

            "X-RateLimit-Limit": String(rateLimit.limit),

            "X-RateLimit-Remaining": String(rateLimit.remaining),

            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        });
      }
    } catch (redisError) {
      console.error("TRENDING REDIS GET ERROR:", redisError);

      // Redis failure should not break the API.
    }

    // ==================================================
    // DATABASE QUERY
    // ==================================================

    const products = await prisma.product.findMany({
      where: {
        isArchived: false,

        quantity: {
          gt: 0,
        },

        store: {
          isActive: true,
        },
      },

      include: {
        store: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },

        rating: {
          select: {
            rating: true,
          },
        },
      },
    });

    // ==================================================
    // TRENDING SCORE
    // ==================================================

    const trendingProducts = products
      .map((product) => {
        const reviewCount = product.rating.length;

        const averageRating =
          reviewCount > 0
            ? product.rating.reduce((sum, item) => sum + item.rating, 0) /
              reviewCount
            : 0;

        const trendingScore =
          product.totalSales * 5 +
          product.totalViews * 0.15 +
          averageRating * 30 +
          reviewCount * 3;

        return {
          ...product,

          averageRating,

          reviewCount,

          trendingScore,
        };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 12);

    // ==================================================
    // SAVE TO REDIS
    // ==================================================

    try {
      await redis.set(CACHE_KEY, trendingProducts, {
        ex: CACHE_TTL,
      });
    } catch (redisError) {
      console.error("TRENDING REDIS SET ERROR:", redisError);
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(trendingProducts, {
      headers: {
        "X-Cache": "MISS",

        "X-RateLimit-Limit": String(rateLimit.limit),

        "X-RateLimit-Remaining": String(rateLimit.remaining),

        "X-RateLimit-Reset": String(rateLimit.reset),
      },
    });
  } catch (error) {
    console.error("TRENDING PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
