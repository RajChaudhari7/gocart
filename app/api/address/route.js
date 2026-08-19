import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// =========================
// CREATE ADDRESS
// =========================
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      name,
      email,
      phone,

      street,
      city,
      state,
      zip,
      country,

      latitude,
      longitude,

      label = "Home",
      landmark = null,
      isDefault = false,
    } = body.address || body;

    if (
      !name ||
      !email ||
      !phone ||
      !street ||
      !city ||
      !state ||
      !zip ||
      !country
    ) {
      return NextResponse.json(
        {
          error: "Please fill all required address fields.",
        },
        {
          status: 400,
        },
      );
    }

    const lat =
      latitude !== undefined && latitude !== null && latitude !== ""
        ? Number(latitude)
        : null;

    const lng =
      longitude !== undefined && longitude !== null && longitude !== ""
        ? Number(longitude)
        : null;

    if (lat !== null && !Number.isFinite(lat)) {
      return NextResponse.json(
        {
          error: "Invalid latitude.",
        },
        {
          status: 400,
        },
      );
    }

    if (lng !== null && !Number.isFinite(lng)) {
      return NextResponse.json(
        {
          error: "Invalid longitude.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * If this address becomes default,
     * remove default status from other addresses first.
     */
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,

        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),

        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        country: country.trim(),

        latitude: lat,
        longitude: lng,

        label: label?.trim() || "Home",

        landmark: landmark?.trim() || null,

        isDefault: Boolean(isDefault),

        /*
         * Newly created address is considered
         * recently used when it is selected later,
         * so we don't need to set lastUsedAt here.
         */
      },
    });

    return NextResponse.json(
      {
        success: true,
        newAddress,
        message: "Address added successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to add address",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// GET ADDRESSES
// =========================
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },

      orderBy: [
        {
          isDefault: "desc",
        },
        {
          lastUsedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load addresses",
      },
      {
        status: 500,
      },
    );
  }
}
