import prisma from "@/lib/prisma";
import { redis } from "@/lib/ratelimit";
import { NextResponse } from "next/server";

const CACHE_KEY = "nandurbar-bazar:featured-products";
const CACHE_TTL = 60; // seconds

export async function GET() {
  try {
    // 1. CHECK REDIS CACHE

    try {
      const cachedProducts = await redis.get(CACHE_KEY);

      if (cachedProducts) {
        return NextResponse.json(cachedProducts, {
          headers: {
            "X-Cache": "HIT",
          },
        });
      }
    } catch (redisError) {
      console.error("REDIS GET ERROR:", redisError);

      // Don't fail the API just because Redis failed.
      // Continue and fetch from PostgreSQL.
    }

    // 2. CACHE MISS → QUERY DATABASE

    const products = await prisma.product.findMany({
      where: {
        featured: true,

        isArchived: false,

        quantity: {
          gt: 0,
        },

        store: {
          isActive: true,
        },
      },

      include: {
        store: true,
      },

      orderBy: [
        {
          totalSales: "desc",
        },
        {
          averageRating: "desc",
        },
      ],

      take: 8,
    });

    // 3. SAVE RESULT IN REDIS

    try {
      await redis.set(CACHE_KEY, products, {
        ex: CACHE_TTL,
      });
    } catch (redisError) {
      console.error("REDIS SET ERROR:", redisError);

      // Again, Redis failure should NOT break the API.
    }

    // 4. RETURN DATABASE RESULT

    return NextResponse.json(products, {
      headers: {
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("FEATURED PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
