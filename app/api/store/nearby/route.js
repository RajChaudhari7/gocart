import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateDistance } from "@/lib/distance";

const SERVICE_RADIUS_KM = 3;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const latitude = Number(searchParams.get("lat"));

    const longitude = Number(searchParams.get("lng"));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        {
          error: "Valid customer latitude and longitude are required",
        },
        {
          status: 400,
        },
      );
    }

    const stores = await prisma.store.findMany({
      where: {
        status: "approved",
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },

      select: {
        id: true,
        name: true,
        username: true,
        description: true,
        address: true,
        logo: true,
        category: true,
        customCategory: true,
        latitude: true,
        longitude: true,
        isActive: true,
        contact: true,
      },
    });

    const nearbyStores = stores
      .map((store) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          Number(store.latitude),
          Number(store.longitude),
        );

        return {
          ...store,

          distanceKm: Number(distance.toFixed(2)),
        };
      })

      .filter((store) => store.distanceKm <= SERVICE_RADIUS_KM)

      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      success: true,

      serviceable: nearbyStores.length > 0,

      serviceRadiusKm: SERVICE_RADIUS_KM,

      customerLocation: {
        latitude,
        longitude,
      },

      stores: nearbyStores,
    });
  } catch (error) {
    console.error("NEARBY STORE ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to load nearby stores",
      },
      {
        status: 500,
      },
    );
  }
}
