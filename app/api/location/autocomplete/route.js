import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { input, sessionToken, latitude, longitude } = body;

    // VALIDATION

    const query = input?.trim();

    if (!query) {
      return NextResponse.json(
        {
          error: "Search input is required.",
        },
        {
          status: 400,
        },
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY is missing.");

      return NextResponse.json(
        {
          error: "Google Maps configuration is missing.",
        },
        {
          status: 500,
        },
      );
    }

    // GOOGLE REQUEST BODY

    const googleBody = {
      input: query,

      // Keep results inside India
      includedRegionCodes: ["in"],

      // Format results for India
      regionCode: "in",

      languageCode: "en",
    };

    // SESSION TOKEN

    if (sessionToken) {
      googleBody.sessionToken = sessionToken;
    }

    // LOCATION BIAS

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      googleBody.locationBias = {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },

          // 50 KM search preference
          radius: 50000,
        },
      };
    }

    // GOOGLE PLACES AUTOCOMPLETE

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "X-Goog-Api-Key": apiKey,

          "X-Goog-FieldMask": [
            "suggestions.placePrediction.placeId",
            "suggestions.placePrediction.text.text",
            "suggestions.placePrediction.structuredFormat.mainText.text",
            "suggestions.placePrediction.structuredFormat.secondaryText.text",
            "suggestions.placePrediction.types",
            "suggestions.placePrediction.distanceMeters",
          ].join(","),
        },

        body: JSON.stringify(googleBody),

        cache: "no-store",
      },
    );

    const data = await response.json();

    // GOOGLE ERROR

    if (!response.ok) {
      console.error("GOOGLE AUTOCOMPLETE ERROR:", data);

      return NextResponse.json(
        {
          error: data?.error?.message || "Unable to search locations.",
        },
        {
          status: response.status,
        },
      );
    }

    // CLEAN RESPONSE

    const predictions = (data.suggestions || [])
      .map((suggestion) => {
        const place = suggestion.placePrediction;

        if (!place) {
          return null;
        }

        return {
          placeId: place.placeId,

          text: place.text?.text || "",

          mainText: place.structuredFormat?.mainText?.text || "",

          secondaryText: place.structuredFormat?.secondaryText?.text || "",

          types: place.types || [],

          distanceMeters: place.distanceMeters ?? null,
        };
      })
      .filter(Boolean);

    // RESPONSE

    return NextResponse.json({
      predictions,
    });
  } catch (error) {
    console.error("LOCATION AUTOCOMPLETE ERROR:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while searching locations.",
      },
      {
        status: 500,
      },
    );
  }
}
