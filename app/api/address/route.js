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
      landmark,
      city,
      state,
      zip,
      country,

      latitude,
      longitude,

      label = "Home",
      isDefault = false,
    } = body.address || body;

    // -----------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------

    if (!name?.trim()) {
      return NextResponse.json(
        {
          error: "Recipient name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          error: "Phone number is required.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------
    // COORDINATES
    // -----------------------------------------

    const lat =
      latitude !== undefined && latitude !== null && latitude !== ""
        ? Number(latitude)
        : null;

    const lng =
      longitude !== undefined && longitude !== null && longitude !== ""
        ? Number(longitude)
        : null;

    if (
      lat === null ||
      lng === null ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return NextResponse.json(
        {
          error: "Please select a valid location on the map.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------
    // DEFAULT ADDRESS
    // -----------------------------------------

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

    // -----------------------------------------
    // CREATE ADDRESS
    // -----------------------------------------

    const newAddress = await prisma.address.create({
      data: {
        userId,

        name: name.trim(),

        email: email?.trim() || "",

        phone: phone.trim(),

        street: street?.trim() || "",

        landmark: landmark?.trim() || null,

        city: city?.trim() || "",

        state: state?.trim() || "",

        zip: zip?.trim() || "",

        country: country?.trim() || "India",

        latitude: lat,
        longitude: lng,

        label: label?.trim() || "Home",

        isDefault: Boolean(isDefault),

        /*
         * Since this address is being created
         * from the active delivery-location flow,
         * it makes sense to mark it as recently used.
         */
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,

        newAddress,

        message: "Address saved successfully",
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
