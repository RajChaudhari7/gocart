import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        {
          error: "Valid latitude and longitude are required.",
        },
        {
          status: 400,
        },
      );
    }

    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: "jsonv2",
      addressdetails: "1",
      zoom: "18",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          "User-Agent": "NandurbarBazar/1.0",

          Accept: "application/json",
        },

        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Unable to identify this location.");
    }

    const data = await response.json();

    const address = data.address || {};

    const street = [address.house_number, address.road]
      .filter(Boolean)
      .join(" ");

    const area =
      address.neighbourhood ||
      address.suburb ||
      address.quarter ||
      address.residential;

    const city =
      address.city || address.town || address.village || address.county;

    const state = address.state || "";

    const zip = address.postcode || "";

    const country = address.country || "India";

    const label = area || street || city || data.name || "Selected Location";

    return NextResponse.json({
      success: true,

      location: {
        latitude,
        longitude,

        label,

        formattedAddress: data.display_name || "",

        street,
        area,
        city,
        state,
        zip,
        country,

        source: "MAP",

        addressId: null,

        osmType: data.osm_type || null,

        osmId: data.osm_id || null,
      },
    });
  } catch (error) {
    console.error("LOCATION REVERSE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to identify this location.",
      },
      {
        status: 500,
      },
    );
  }
}
