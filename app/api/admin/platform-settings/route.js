import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { redis } from "@/lib/ratelimit";

const PLATFORM_SETTINGS_CACHE_KEY = "nandurbar-bazar:platform-settings";

/* ---------------- GET SETTINGS ---------------- */

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.platformSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          commissionPercent: 10,
          deliveryFee: 50,
          driverFee: 30,
          freeDeliveryAbove: 999999,
        },
      });

      // Remove any old cached fallback settings
      try {
        await redis.del(PLATFORM_SETTINGS_CACHE_KEY);
      } catch (redisError) {
        console.error("PLATFORM SETTINGS CACHE DELETE ERROR:", redisError);
      }
    }

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    console.error("GET PLATFORM SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 400,
      },
    );
  }
}

/* ---------------- UPDATE SETTINGS ---------------- */

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commissionPercent, deliveryFee, driverFee, freeDeliveryAbove } =
      await request.json();

    let settings = await prisma.platformSettings.findFirst();

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          commissionPercent: Number(commissionPercent),

          deliveryFee: Number(deliveryFee),

          driverFee: Number(driverFee),

          freeDeliveryAbove: Number(freeDeliveryAbove),
        },
      });
    } else {
      settings = await prisma.platformSettings.update({
        where: {
          id: settings.id,
        },

        data: {
          commissionPercent: Number(commissionPercent),

          deliveryFee: Number(deliveryFee),

          driverFee: Number(driverFee),

          freeDeliveryAbove: Number(freeDeliveryAbove),
        },
      });
    }

    // ==========================================
    // INVALIDATE PUBLIC SETTINGS CACHE
    // ==========================================

    try {
      await redis.del(PLATFORM_SETTINGS_CACHE_KEY);
    } catch (redisError) {
      console.error("PLATFORM SETTINGS CACHE DELETE ERROR:", redisError);

      /*
       * Do NOT fail the request here.
       *
       * The database update already succeeded.
       * Redis being unavailable should not make
       * the admin think the update failed.
       */
    }

    return NextResponse.json({
      success: true,

      message: "Platform settings updated successfully.",

      settings,
    });
  } catch (error) {
    console.error("UPDATE PLATFORM SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 400,
      },
    );
  }
}
