import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const driverId =
      searchParams.get("driverId");

    const month = Number(
      searchParams.get("month")
    );

    const year = Number(
      searchParams.get("year")
    );

    if (!driverId) {
      return NextResponse.json(
        {
          error: "Driver ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const startDate =
      month && year
        ? new Date(
            year,
            month - 1,
            1
          )
        : undefined;

    const endDate =
      month && year
        ? new Date(
            year,
            month,
            1
          )
        : undefined;

    const earnings =
      await prisma.order.findMany({
        where: {
          driverId,

          status: "DELIVERED",

          ...(startDate &&
            endDate && {
              deliveredAt: {
                gte: startDate,
                lt: endDate,
              },
            }),
        },

        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },

          address: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
        },

        orderBy: {
          deliveredAt: "desc",
        },
      });

    const totalRevenue =
      earnings.reduce(
        (sum, order) =>
          sum +
          Number(order.driverFee || 0),
        0
      );

    const totalDeliveries =
      earnings.length;

    const averagePerDelivery =
      totalDeliveries > 0
        ? totalRevenue /
          totalDeliveries
        : 0;

    return NextResponse.json({
      earnings,

      summary: {
        totalRevenue,
        totalDeliveries,
        averagePerDelivery,
      },
    });
  } catch (error) {
    console.error(
      "Driver earnings error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to load earnings",
      },
      {
        status: 500,
      }
    );
  }
}