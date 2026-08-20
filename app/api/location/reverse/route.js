import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    // -----------------------------------
    // VALIDATION
    // -----------------------------------

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

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Google Maps configuration is missing.",
        },
        {
          status: 500,
        },
      );
    }

    // -----------------------------------
    // GOOGLE GEOCODING API
    // -----------------------------------

    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: apiKey,
      language: "en",
      region: "in",
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GOOGLE REVERSE GEOCODING ERROR:", data);

      return NextResponse.json(
        {
          error: "Unable to identify this location.",
        },
        {
          status: response.status,
        },
      );
    }

    if (data.status !== "OK") {
      console.error("GOOGLE GEOCODING STATUS:", data);

      return NextResponse.json(
        {
          error:
            data.error_message ||
            (data.status === "ZERO_RESULTS"
              ? "No address was found for this location."
              : "Unable to identify this location."),
        },
        {
          status: data.status === "ZERO_RESULTS" ? 404 : 400,
        },
      );
    }

    const result = data.results?.[0];

    if (!result) {
      return NextResponse.json(
        {
          error: "No address was found for this location.",
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------------
    // ADDRESS COMPONENT HELPER
    // -----------------------------------

    const getComponent = (type) => {
      const component = result.address_components?.find((item) =>
        item.types?.includes(type),
      );

      return component?.long_name || component?.short_name || "";
    };

    // -----------------------------------
    // NORMALIZED LOCATION
    // -----------------------------------

    const street = [getComponent("street_number"), getComponent("route")]
      .filter(Boolean)
      .join(" ");

    const area =
      getComponent("sublocality_level_1") ||
      getComponent("sublocality") ||
      getComponent("neighborhood") ||
      getComponent("premise");

    const city =
      getComponent("locality") ||
      getComponent("administrative_area_level_3") ||
      getComponent("administrative_area_level_2");

    const state = getComponent("administrative_area_level_1");

    const zip = getComponent("postal_code");

    const country = getComponent("country") || "India";

    const label =
      area || street || getComponent("premise") || city || "Selected Location";

    const location = {
      latitude,
      longitude,

      placeId: result.place_id || null,

      label,

      formattedAddress: result.formatted_address || "",

      street,
      area,
      city,
      state,
      zip,
      country,

      source: "MAP",

      addressId: null,

      types: result.types || [],
    };

    return NextResponse.json({
      success: true,
      location,
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
