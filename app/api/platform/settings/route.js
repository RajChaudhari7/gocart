import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

import { redis } from "@/lib/ratelimit";

const CACHE_KEY = "nandurbar-bazar:platform-settings";
const CACHE_TTL = 300; // 5 minutes

export async function GET() {
  try {
    // ==================================================
    // CHECK REDIS CACHE
    // ==================================================

    try {
      const cachedSettings = await redis.get(CACHE_KEY);

      if (cachedSettings) {
        return NextResponse.json(cachedSettings, {
          headers: {
            "X-Cache": "HIT",
          },
        });
      }
    } catch (redisError) {
      console.error("PLATFORM SETTINGS REDIS GET ERROR:", redisError);
    }

    // ==================================================
    // DATABASE
    // ==================================================

    const settings = (await prisma.platformSettings.findFirst()) || {
      commissionPercent: 10,
      deliveryFee: 50,
      driverFee: 30,
      freeDeliveryAbove: 999999,
    };

    // ==================================================
    // SAVE CACHE
    // ==================================================

    try {
      await redis.set(CACHE_KEY, settings, {
        ex: CACHE_TTL,
      });
    } catch (redisError) {
      console.error("PLATFORM SETTINGS REDIS SET ERROR:", redisError);
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(settings, {
      headers: {
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("PLATFORM SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load platform settings",
      },
      {
        status: 500,
      },
    );
  }
}
