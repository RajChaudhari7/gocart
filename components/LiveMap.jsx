"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ----------------------------------------------------
// CUSTOM ICONS
// ----------------------------------------------------

const driverIcon = L.divIcon({
    className: "custom-icon",
    html: `
        <div
            style="
                background-color: #10b981;
                border: 2px solid white;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
            "
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M5 18H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h5.5l2-4h5M15 11l-2 4h4.5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2M15 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM7 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"></path>
            </svg>
        </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const customerIcon = L.divIcon({
    className: "custom-icon",
    html: `
        <div
            style="
                background-color: #6366f1;
                border: 2px solid white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
            "
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

// ----------------------------------------------------
// AUTO-ADJUST MAP BOUNDS
// ----------------------------------------------------

const MapBounds = ({
    driverPos,
    customerPos,
    routeCoords,
}) => {
    const map = useMap();
    const hasInitiallyFitted = useRef(false);

    useEffect(() => {
        if (!driverPos || !customerPos) return;

        /*
         * When a route exists, fit the entire route.
         * Otherwise, fit only the two markers.
         */
        const positions =
            routeCoords.length > 0
                ? routeCoords
                : [driverPos, customerPos];

        const bounds = L.latLngBounds(positions);

        /*
         * Avoid repeatedly resetting the user's zoom whenever
         * the animated driver marker changes.
         */
        if (!hasInitiallyFitted.current) {
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 16,
            });

            hasInitiallyFitted.current = true;
        }
    }, [
        driverPos,
        customerPos,
        routeCoords,
        map,
    ]);

    return null;
};

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

export default function LiveMap({
    driverLocation,
    customerLocation,
}) {
    const [routeCoords, setRouteCoords] = useState([]);
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeError, setRouteError] = useState(false);

    /*
     * The animated driver location may update many times per second.
     * We therefore round the coordinates used for OSRM requests.
     *
     * This prevents a new API request on every animation frame.
     */
    const routeDriverLocation = useMemo(() => {
        if (
            driverLocation?.lat == null ||
            driverLocation?.lng == null
        ) {
            return null;
        }

        const lat = Number(driverLocation.lat);
        const lng = Number(driverLocation.lng);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return null;
        }

        return {
            lat,
            lng,
            routeLat: Number(lat.toFixed(4)),
            routeLng: Number(lng.toFixed(4)),
        };
    }, [
        driverLocation?.lat,
        driverLocation?.lng,
    ]);

    const normalizedCustomerLocation = useMemo(() => {
        if (
            customerLocation?.lat == null ||
            customerLocation?.lng == null
        ) {
            return null;
        }

        const lat = Number(customerLocation.lat);
        const lng = Number(customerLocation.lng);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return null;
        }

        return {
            lat,
            lng,
        };
    }, [
        customerLocation?.lat,
        customerLocation?.lng,
    ]);

    const driverPos = routeDriverLocation
        ? [
            routeDriverLocation.lat,
            routeDriverLocation.lng,
        ]
        : null;

    const customerPos = normalizedCustomerLocation
        ? [
            normalizedCustomerLocation.lat,
            normalizedCustomerLocation.lng,
        ]
        : null;

    // ------------------------------------------------
    // FETCH ACTUAL ROAD ROUTE FROM OSRM
    // ------------------------------------------------

    useEffect(() => {
        if (
            !routeDriverLocation ||
            !normalizedCustomerLocation
        ) {
            setRouteCoords([]);
            return;
        }

        const controller = new AbortController();

        const fetchRoute = async () => {
            try {
                setRouteLoading(true);
                setRouteError(false);

                const driverLng =
                    routeDriverLocation.routeLng;

                const driverLat =
                    routeDriverLocation.routeLat;

                const customerLng =
                    normalizedCustomerLocation.lng;

                const customerLat =
                    normalizedCustomerLocation.lat;

                const url =
                    `https://router.project-osrm.org/route/v1/driving/` +
                    `${driverLng},${driverLat};` +
                    `${customerLng},${customerLat}` +
                    `?overview=full&geometries=geojson&steps=false`;

                const response = await fetch(url, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        `Route request failed: ${response.status}`
                    );
                }

                const data = await response.json();

                if (
                    data.code !== "Ok" ||
                    !data.routes?.length ||
                    !data.routes[0]?.geometry?.coordinates
                ) {
                    throw new Error("No road route found");
                }

                /*
                 * OSRM returns:
                 * [longitude, latitude]
                 *
                 * Leaflet requires:
                 * [latitude, longitude]
                 */
                const coordinates =
                    data.routes[0].geometry.coordinates.map(
                        ([lng, lat]) => [lat, lng]
                    );

                setRouteCoords(coordinates);
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }

                console.error(
                    "Error fetching road route:",
                    error
                );

                setRouteError(true);

                /*
                 * Fallback straight line so the map
                 * does not become empty.
                 */
                setRouteCoords([
                    [
                        routeDriverLocation.lat,
                        routeDriverLocation.lng,
                    ],
                    [
                        normalizedCustomerLocation.lat,
                        normalizedCustomerLocation.lng,
                    ],
                ]);
            } finally {
                if (!controller.signal.aborted) {
                    setRouteLoading(false);
                }
            }
        };

        /*
         * Small delay prevents rapid OSRM requests
         * while location data is changing.
         */
        const timeout = setTimeout(fetchRoute, 400);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [
        routeDriverLocation?.routeLat,
        routeDriverLocation?.routeLng,
        normalizedCustomerLocation?.lat,
        normalizedCustomerLocation?.lng,
    ]);

    if (!driverPos) {
        return null;
    }

    return (
        <div
            className="relative h-full w-full overflow-hidden rounded-2xl"
        >
            <MapContainer
                center={driverPos}
                zoom={14}
                style={{
                    height: "100%",
                    width: "100%",
                    background: "#020617",
                }}
                zoomControl={false}
            >
                {/* Dark map tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                />

                {driverPos && customerPos && (
                    <MapBounds
                        driverPos={driverPos}
                        customerPos={customerPos}
                        routeCoords={routeCoords}
                    />
                )}

                {/* Route outer shadow */}
                {routeCoords.length > 0 && (
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{
                            color: "#020617",
                            weight: 11,
                            opacity: 0.75,
                            lineCap: "round",
                            lineJoin: "round",
                        }}
                    />
                )}

                {/* Main highlighted road route */}
                {routeCoords.length > 0 && (
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{
                            color: routeError
                                ? "#64748b"
                                : "#10b981",
                            weight: 6,
                            opacity: 0.95,
                            lineCap: "round",
                            lineJoin: "round",
                        }}
                    />
                )}

                {/* Optional inner route highlight */}
                {routeCoords.length > 0 && !routeError && (
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{
                            color: "#6ee7b7",
                            weight: 2,
                            opacity: 0.7,
                            lineCap: "round",
                            lineJoin: "round",
                        }}
                    />
                )}

                {/* Driver marker */}
                <Marker
                    position={driverPos}
                    icon={driverIcon}
                    zIndexOffset={1000}
                />

                {/* Customer destination marker */}
                {customerPos && (
                    <Marker
                        position={customerPos}
                        icon={customerIcon}
                        zIndexOffset={900}
                    />
                )}
            </MapContainer>

            {/* Route loading indicator */}
            {routeLoading && (
                <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full border border-white/10 bg-black/75 px-4 py-2 text-xs font-medium text-white/70 shadow-lg backdrop-blur-md">
                    Updating road route...
                </div>
            )}

            {/* Fallback warning */}
            {routeError && !routeLoading && (
                <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-500/20 bg-black/75 px-4 py-2 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-md">
                    Road route unavailable. Showing approximate path.
                </div>
            )}
        </div>
    );
}