import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { addressId } = body;

    if (!addressId) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 },
      );
    }

    // Make sure this address belongs to the logged-in user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Coordinates are required for delivery filtering
    if (address.latitude == null || address.longitude == null) {
      return NextResponse.json(
        {
          error:
            "This address does not have location coordinates. Please update the address location first.",
        },
        { status: 400 },
      );
    }

    const updatedAddress = await prisma.address.update({
      where: {
        id: address.id,
      },

      data: {
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,

      address: updatedAddress,

      location: {
        latitude: updatedAddress.latitude,
        longitude: updatedAddress.longitude,

        label: updatedAddress.label || "Saved Address",

        formattedAddress: [
          updatedAddress.street,
          updatedAddress.landmark,
          updatedAddress.city,
          updatedAddress.state,
          updatedAddress.zip,
        ]
          .filter(Boolean)
          .join(", "),

        source: "SAVED",

        addressId: updatedAddress.id,
      },

      message: "Delivery address selected",
    });
  } catch (error) {
    console.error("USE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to select address",
      },
      {
        status: 500,
      },
    );
  }
}
