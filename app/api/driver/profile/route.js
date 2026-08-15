import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const ACTIVE_DELIVERY_STATUSES = [
  "DRIVER_ASSIGNED",
  "REACHED_SHOP",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERY_INITIATED",
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const driverId = searchParams.get("driverId");

    if (!driverId) {
      return NextResponse.json(
        {
          error: "Driver ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const driver = await prisma.driver.findUnique({
      where: {
        id: driverId,
      },
    });

    if (!driver) {
      return NextResponse.json(
        {
          error: "Driver not found",
        },
        {
          status: 404,
        },
      );
    }

    const activeOrder = await prisma.order.findFirst({
      where: {
        driverId,
        status: {
          in: ACTIVE_DELIVERY_STATUSES,
        },
      },
      include: {
        store: true,
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      driver,
      activeOrder,
    });
  } catch (error) {
    console.error("Driver profile error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load driver profile",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request) {
  try {
    const { driverId, name, phone, vehicle, vehicleNo, profilePhoto } =
      await request.json();

    if (!driverId) {
      return NextResponse.json(
        {
          error: "Driver ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const existingDriver = await prisma.driver.findUnique({
      where: {
        id: driverId,
      },
    });

    if (!existingDriver) {
      return NextResponse.json(
        {
          error: "Driver not found",
        },
        {
          status: 404,
        },
      );
    }

    if (phone && phone.trim() !== existingDriver.phone) {
      const phoneExists = await prisma.driver.findUnique({
        where: {
          phone: phone.trim(),
        },
      });

      if (phoneExists) {
        return NextResponse.json(
          {
            error: "This phone number is already registered",
          },
          {
            status: 409,
          },
        );
      }
    }

    const updatedDriver = await prisma.driver.update({
      where: {
        id: driverId,
      },

      data: {
        name: name?.trim() || existingDriver.name,

        phone: phone?.trim() || existingDriver.phone,

        vehicle: vehicle?.trim() || null,

        vehicleNo: vehicleNo?.trim() || null,

        profilePhoto: profilePhoto?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    console.error("Driver profile update error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update driver profile",
      },
      {
        status: 500,
      },
    );
  }
}
