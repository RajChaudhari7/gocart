import { NextResponse } from "next/server";

export async function POST(request) {
  try {
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

    const params = new URLSearchParams({
      q: input,
      format: "jsonv2",
      addressdetails: "1",
      countrycodes: "in",
      limit: "8",
    });

    /*
     * If we already know customer's selected/current
     * location, bias the search around that area.
     */
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      /*
       * Approximate viewbox around current location.
       * This does not strictly restrict results because
       * bounded=0, but helps ranking nearby addresses.
       */

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

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          /*
           * Nominatim requires a meaningful User-Agent.
           */
          "User-Agent": "NandurbarBazar/1.0",
          Accept: "application/json",
        },

        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Unable to search locations.");
    }

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
            /*
             * Keep the same shape your search page
             * already expects.
             *
             * We're no longer using Google placeId,
             * so use OSM's type + id combination.
             */
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

    return NextResponse.json({
      predictions,
    });
  } catch (error) {
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
