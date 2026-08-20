import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { placeId, sessionToken } = body;

    if (!placeId) {
      return NextResponse.json(
        {
          error: "Place ID is required.",
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

    const params = new URLSearchParams();

    params.set("languageCode", "en");

    params.set("regionCode", "in");

    if (sessionToken) {
      params.set("sessionToken", sessionToken);
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?${params.toString()}`,
      {
        method: "GET",

        headers: {
          "X-Goog-Api-Key": apiKey,

          "X-Goog-FieldMask": [
            "id",
            "displayName",
            "formattedAddress",
            "location",
            "addressComponents",
            "types",
          ].join(","),
        },

        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GOOGLE PLACE DETAILS ERROR:", data);

      return NextResponse.json(
        {
          error: data?.error?.message || "Unable to load place details.",
        },
        {
          status: response.status,
        },
      );
    }

    const latitude = Number(data.location?.latitude);

    const longitude = Number(data.location?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        {
          error: "Selected place does not have valid coordinates.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------
    // ADDRESS COMPONENT HELPER
    // -----------------------------------

    const getComponent = (type) => {
      const component = data.addressComponents?.find((item) =>
        item.types?.includes(type),
      );

      return component?.longText || component?.shortText || "";
    };

    // -----------------------------------
    // NORMALIZED LOCATION
    // -----------------------------------

    const location = {
      placeId: data.id || placeId,

      latitude,
      longitude,

      label: data.displayName?.text || "Selected Location",

      formattedAddress: data.formattedAddress || "",

      source: "SEARCH",

      addressId: null,

      /*
       * These fields will help later
       * when saving the location as
       * an Address for checkout.
       */

      street: [getComponent("street_number"), getComponent("route")]
        .filter(Boolean)
        .join(" "),

      area:
        getComponent("sublocality_level_1") ||
        getComponent("sublocality") ||
        getComponent("neighborhood"),

      city:
        getComponent("locality") || getComponent("administrative_area_level_2"),

      state: getComponent("administrative_area_level_1"),

      zip: getComponent("postal_code"),

      country: getComponent("country") || "India",

      types: data.types || [],
    };

    return NextResponse.json({
      success: true,
      location,
    });
  } catch (error) {
    console.error("LOCATION PLACE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load place details.",
      },
      {
        status: 500,
      },
    );
  }
}
