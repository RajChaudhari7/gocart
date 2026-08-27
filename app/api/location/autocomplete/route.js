import { NextResponse } from "next/server";

import { searchRateLimit } from "@/lib/ratelimit";
import { getRateLimitIdentifier } from "@/lib/getRateLimitIdentifier";
import { rateLimitResponse } from "@/lib/rateLimitResponse";

export async function POST(request) {
  try {
    // RATE LIMIT

    const identifier = getRateLimitIdentifier(request);

    const rateLimit = await searchRateLimit.limit(
      `location-autocomplete:${identifier}`,
    );

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    // BODY

    const body = await request.json();

    const input = body.input?.trim();

    if (!input) {
      return NextResponse.json(
        {
          error: "Search input is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Don't allow extremely large search strings.
     *
     * This also protects the third-party
     * Nominatim request.
     */
    if (input.length > 120) {
      return NextResponse.json(
        {
          error: "Search input is too long.",
        },
        {
          status: 400,
        },
      );
    }

    // NOMINATIM PARAMS

    const params = new URLSearchParams({
      q: input,
      format: "jsonv2",
      addressdetails: "1",
      countrycodes: "in",
      limit: "8",
    });

    /*
     * Bias results toward current/selected
     * delivery location when available.
     */
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const delta = 0.3;

      params.set(
        "viewbox",
        [
          longitude - delta,
          latitude + delta,
          longitude + delta,
          latitude - delta,
        ].join(","),
      );

      params.set("bounded", "0");
    }

    // REQUEST TIMEOUT

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    let response;

    try {
      response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            "User-Agent": "NandurbarBazar/1.0",

            Accept: "application/json",
          },

          signal: controller.signal,

          cache: "no-store",
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    // THIRD-PARTY ERROR

    if (!response.ok) {
      console.error("NOMINATIM SEARCH ERROR:", response.status);

      return NextResponse.json(
        {
          error: "Location search is temporarily unavailable.",
        },
        {
          status: 502,
        },
      );
    }

    // RESULTS

    const results = await response.json();

    const predictions = Array.isArray(results)
      ? results.map((item) => {
          const address = item.address || {};

          const mainText =
            address.road ||
            address.neighbourhood ||
            address.suburb ||
            address.village ||
            address.town ||
            address.city ||
            item.name ||
            "Location";

          const secondaryParts = [
            address.suburb,

            address.city || address.town || address.village,

            address.state,

            address.postcode,
          ].filter(Boolean);

          return {
            placeId: `${item.osm_type}-${item.osm_id}`,

            osmType: item.osm_type,

            osmId: item.osm_id,

            latitude: Number(item.lat),

            longitude: Number(item.lon),

            text: item.display_name || "",

            mainText,

            secondaryText: secondaryParts.join(", "),

            type: item.type || "",

            class: item.class || "",

            address,
          };
        })
      : [];

    // RESPONSE

    return NextResponse.json(
      {
        predictions,
      },
      {
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),

          "X-RateLimit-Remaining": String(rateLimit.remaining),

          "X-RateLimit-Reset": String(rateLimit.reset),
        },
      },
    );
  } catch (error) {
    // Abort timeout

    if (error?.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Location search timed out. Please try again.",
        },
        {
          status: 504,
        },
      );
    }

    console.error("LOCATION AUTOCOMPLETE ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to search locations.",
      },
      {
        status: 500,
      },
    );
  }
}
