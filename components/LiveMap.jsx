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
// CUSTOMER ICON
// ----------------------------------------------------

const customerIcon = L.divIcon({
    className: "custom-customer-icon",
    html: `
        <div class="customer-marker-wrapper">
            <div class="customer-marker-pulse"></div>

            <div class="customer-marker">
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M3 11l9-8 9 8"></path>
                    <path d="M5 10v10h14V10"></path>
                    <path d="M9 20v-6h6v6"></path>
                </svg>
            </div>

            <div class="customer-marker-tip"></div>
        </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 54],
});

// ----------------------------------------------------
// DRIVER ICON WITH ROTATION
// ----------------------------------------------------

const createDriverIcon = (heading = 0) =>
    L.divIcon({
        className: "custom-driver-icon",

        html: `
            <div class="driver-marker-wrapper">

                <div class="driver-marker-pulse"></div>

                <div
                    class="driver-marker-direction"
                    style="transform: rotate(${heading}deg);"
                >
                    <div class="driver-marker">

                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle cx="6" cy="18" r="2.5"></circle>
                            <circle cx="18" cy="18" r="2.5"></circle>

                            <path d="M6 18h6"></path>
                            <path d="M12 18h3"></path>
                            <path d="M8 15l2-5h5l3 5"></path>
                            <path d="M10 10h3"></path>
                            <path d="M15 10l2-2"></path>
                            <path d="M9 15H5"></path>
                        </svg>

                    </div>
                </div>

            </div>
        `,

        iconSize: [52, 52],
        iconAnchor: [26, 26],
    });

// ----------------------------------------------------
// CALCULATE DRIVER DIRECTION
// ----------------------------------------------------

const calculateBearing = (start, end) => {
    if (!start || !end) return 0;

    const startLat = start[0] * (Math.PI / 180);
    const startLng = start[1] * (Math.PI / 180);

    const endLat = end[0] * (Math.PI / 180);
    const endLng = end[1] * (Math.PI / 180);

    const longitudeDifference = endLng - startLng;

    const y =
        Math.sin(longitudeDifference) *
        Math.cos(endLat);

    const x =
        Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) *
        Math.cos(endLat) *
        Math.cos(longitudeDifference);

    const bearing =
        Math.atan2(y, x) * (180 / Math.PI);

    return (bearing + 360) % 360;
};

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

        const positions =
            routeCoords.length > 0
                ? routeCoords
                : [driverPos, customerPos];

        const bounds = L.latLngBounds(positions);

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

    const [routeLoading, setRouteLoading] =
        useState(false);

    const [routeError, setRouteError] =
        useState(false);

    const [driverHeading, setDriverHeading] =
        useState(0);

    const previousDriverPositionRef =
        useRef(null);

    // ------------------------------------------------
    // NORMALIZE DRIVER LOCATION
    // ------------------------------------------------

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

            // Rounded location used only for OSRM requests
            routeLat: Number(lat.toFixed(4)),
            routeLng: Number(lng.toFixed(4)),
        };
    }, [
        driverLocation?.lat,
        driverLocation?.lng,
    ]);

    // ------------------------------------------------
    // NORMALIZE CUSTOMER LOCATION
    // ------------------------------------------------

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
    // CALCULATE DRIVER HEADING
    // ------------------------------------------------

    useEffect(() => {
        if (!driverPos) return;

        const previousPosition =
            previousDriverPositionRef.current;

        if (previousPosition) {
            const latitudeDifference =
                Math.abs(
                    driverPos[0] -
                    previousPosition[0]
                );

            const longitudeDifference =
                Math.abs(
                    driverPos[1] -
                    previousPosition[1]
                );

            /*
             * Ignore extremely tiny position changes.
             * This prevents the icon from rotating randomly
             * because of GPS noise.
             */
            const hasMeaningfulMovement =
                latitudeDifference > 0.000001 ||
                longitudeDifference > 0.000001;

            if (hasMeaningfulMovement) {
                const newHeading =
                    calculateBearing(
                        previousPosition,
                        driverPos
                    );

                setDriverHeading(newHeading);
            }
        }

        previousDriverPositionRef.current =
            driverPos;
    }, [
        driverPos?.[0],
        driverPos?.[1],
    ]);

    // Generate a new icon only when heading changes
    const rotatingDriverIcon = useMemo(
        () => createDriverIcon(driverHeading),
        [driverHeading]
    );

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

        const controller =
            new AbortController();

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
                    "https://router.project-osrm.org/" +
                    "route/v1/driving/" +
                    `${driverLng},${driverLat};` +
                    `${customerLng},${customerLat}` +
                    "?overview=full" +
                    "&geometries=geojson" +
                    "&steps=false";

                const response = await fetch(url, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        `Route request failed: ${response.status}`
                    );
                }

                const data =
                    await response.json();

                if (
                    data.code !== "Ok" ||
                    !data.routes?.length ||
                    !data.routes[0]?.geometry
                        ?.coordinates
                ) {
                    throw new Error(
                        "No road route found"
                    );
                }

                /*
                 * OSRM:
                 * [longitude, latitude]
                 *
                 * Leaflet:
                 * [latitude, longitude]
                 */
                const coordinates =
                    data.routes[0].geometry.coordinates.map(
                        ([lng, lat]) => [
                            lat,
                            lng,
                        ]
                    );

                setRouteCoords(coordinates);
            } catch (error) {
                if (
                    error.name === "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Error fetching road route:",
                    error
                );

                setRouteError(true);

                // Straight-line fallback
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

        const timeout =
            setTimeout(fetchRoute, 400);

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
        <div className="relative h-full w-full overflow-hidden rounded-2xl">

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
                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
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

                {/* Main road route */}
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

                {/* Inner route highlight */}
                {routeCoords.length > 0 &&
                    !routeError && (
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

                {/* Rotating driver marker */}
                <Marker
                    position={driverPos}
                    icon={rotatingDriverIcon}
                    zIndexOffset={1000}
                />

                {/* Customer destination */}
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
                <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/75 px-4 py-2 text-xs font-medium text-white/70 shadow-lg backdrop-blur-md">
                    Updating road route...
                </div>
            )}

            {/* Route fallback warning */}
            {routeError &&
                !routeLoading && (
                    <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-500/20 bg-black/75 px-4 py-2 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-md">
                        Road route unavailable. Showing approximate path.
                    </div>
                )}

        </div>
    );
}