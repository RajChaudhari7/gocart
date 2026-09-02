
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

// ============================================================
// CUSTOMER ICON
// ============================================================

const customerIcon = L.divIcon({
  className: "custom-customer-icon",
  html: `
    <div style="
      position:relative;
      width:48px;
      height:56px;
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <div style="
        position:absolute;
        width:42px;
        height:42px;
        border-radius:50%;
        background:rgba(16,185,129,0.20);
        animation:pulse 1.8s infinite;
      "></div>

      <div style="
        width:42px;
        height:42px;
        border-radius:50%;
        background:#10b981;
        border:3px solid white;
        box-shadow:0 4px 15px rgba(0,0,0,0.35);
        display:flex;
        align-items:center;
        justify-content:center;
        position:relative;
        z-index:2;
      ">
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

      <div style="
        position:absolute;
        bottom:0;
        left:18px;
        width:0;
        height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:10px solid #10b981;
      "></div>
    </div>
  `,
  iconSize: [48, 56],
  iconAnchor: [24, 54],
});

// ============================================================
// SHOP ICON
// ============================================================

const shopIcon = L.divIcon({
  className: "custom-shop-icon",
  html: `
    <div style="
      width:46px;
      height:46px;
      border-radius:50%;
      background:#6366f1;
      border:3px solid white;
      box-shadow:0 4px 18px rgba(0,0,0,0.4);
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 9l1-5h16l1 5"></path>
        <path d="M5 9v11h14V9"></path>
        <path d="M9 20v-6h6v6"></path>
        <path d="M3 9a3 3 0 0 0 6 0"></path>
        <path d="M9 9a3 3 0 0 0 6 0"></path>
        <path d="M15 9a3 3 0 0 0 6 0"></path>
      </svg>
    </div>
  `,
  iconSize: [46, 46],
  iconAnchor: [23, 23],
});

// ============================================================
// DRIVER ICON
// ============================================================

const createDriverIcon = (heading = 0) =>
  L.divIcon({
    className: "custom-driver-icon",
    html: `
      <div style="
        width:52px;
        height:52px;
        position:relative;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          position:absolute;
          width:48px;
          height:48px;
          border-radius:50%;
          background:rgba(99,102,241,0.18);
          animation:pulse 1.5s infinite;
        "></div>

        <div style="
          width:46px;
          height:46px;
          border-radius:50%;
          background:#4f46e5;
          border:3px solid white;
          box-shadow:0 5px 18px rgba(0,0,0,0.45);
          display:flex;
          align-items:center;
          justify-content:center;
          position:relative;
          z-index:2;
          transform:rotate(${heading}deg);
          transition:transform 0.4s ease;
        ">
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
            <path d="M6 18h9"></path>
            <path d="M8 15l2-5h5l3 5"></path>
            <path d="M10 10h3"></path>
            <path d="M15 10l2-2"></path>
            <path d="M9 15H5"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });

// ============================================================
// MAP BOUNDS
// ============================================================

function MapBounds({ driverPos, destinationPos, shopPos }) {
  const map = useMap();

  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (!driverPos || !destinationPos) return;

    const positions = shopPos
      ? [driverPos, destinationPos, shopPos]
      : [driverPos, destinationPos];

    const bounds = L.latLngBounds(positions);

    if (!hasFittedRef.current) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
      });

      hasFittedRef.current = true;
    }
  }, [driverPos, destinationPos, shopPos, map]);

  return null;
}

// ============================================================
// MAIN LIVE MAP
// ============================================================

export default function LiveMap({
  driverLocation,
  customerLocation,
  shopLocation,
  orderStatus,
  driverAccepted = false,
}) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);

  const [driverHeading, setDriverHeading] = useState(0);

  const previousDriverPositionRef = useRef(null);

  // ==========================================================
  // DRIVER LOCATION
  // ==========================================================

  const normalizedDriverLocation = useMemo(() => {
    if (driverLocation?.lat == null || driverLocation?.lng == null) {
      return null;
    }

    const lat = Number(driverLocation.lat);
    const lng = Number(driverLocation.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      lat,
      lng,
      routeLat: Number(lat.toFixed(5)),
      routeLng: Number(lng.toFixed(5)),
    };
  }, [driverLocation?.lat, driverLocation?.lng]);

  // ==========================================================
  // CUSTOMER LOCATION
  // ==========================================================

  const normalizedCustomerLocation = useMemo(() => {
    if (customerLocation?.lat == null || customerLocation?.lng == null) {
      return null;
    }

    const lat = Number(customerLocation.lat);
    const lng = Number(customerLocation.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      lat,
      lng,
    };
  }, [customerLocation?.lat, customerLocation?.lng]);

  // ==========================================================
  // SHOP LOCATION
  // ==========================================================

  const normalizedShopLocation = useMemo(() => {
    if (shopLocation?.lat == null || shopLocation?.lng == null) {
      return null;
    }

    const lat = Number(shopLocation.lat);
    const lng = Number(shopLocation.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      lat,
      lng,
    };
  }, [shopLocation?.lat, shopLocation?.lng]);

  // ==========================================================
  // CONVERT TO LEAFLET POSITIONS
  // ==========================================================

  const driverPos = normalizedDriverLocation
    ? [normalizedDriverLocation.lat, normalizedDriverLocation.lng]
    : null;

  const customerPos = normalizedCustomerLocation
    ? [normalizedCustomerLocation.lat, normalizedCustomerLocation.lng]
    : null;

  const shopPos = normalizedShopLocation
    ? [normalizedShopLocation.lat, normalizedShopLocation.lng]
    : null;

  // ==========================================================
  // SELECT DESTINATION BASED ON ORDER STATUS
  // ==========================================================

  const isGoingToShop =
    (orderStatus === "DRIVER_ASSIGNED" || orderStatus === "REACHED_SHOP") &&
    driverAccepted;

  const isGoingToCustomer =
    orderStatus === "PICKED_UP" ||
    orderStatus === "OUT_FOR_DELIVERY" ||
    orderStatus === "DELIVERY_INITIATED";

  const destinationLocation = isGoingToShop
    ? normalizedShopLocation
    : isGoingToCustomer
      ? normalizedCustomerLocation
      : null;

  const destinationPos = destinationLocation
    ? [destinationLocation.lat, destinationLocation.lng]
    : null;

  // ==========================================================
  // DRIVER HEADING
  // ==========================================================

  useEffect(() => {
    if (!driverPos) return;

    const previousPosition = previousDriverPositionRef.current;

    if (previousPosition) {
      const latDifference = Math.abs(driverPos[0] - previousPosition[0]);

      const lngDifference = Math.abs(driverPos[1] - previousPosition[1]);

      if (latDifference > 0.000001 || lngDifference > 0.000001) {
        const heading = calculateBearing(previousPosition, driverPos);

        setDriverHeading(heading);
      }
    }

    previousDriverPositionRef.current = driverPos;
  }, [driverPos?.[0], driverPos?.[1]]);

  const rotatingDriverIcon = useMemo(
    () => createDriverIcon(driverHeading),
    [driverHeading],
  );

  // ==========================================================
  // FETCH ROAD ROUTE
  // ==========================================================

  useEffect(() => {
    if (!normalizedDriverLocation || !destinationLocation) {
      setRouteCoords([]);
      setRouteError(false);
      return;
    }

    const controller = new AbortController();

    const fetchRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError(false);

        const driverLng = normalizedDriverLocation.routeLng;

        const driverLat = normalizedDriverLocation.routeLat;

        const destinationLng = destinationLocation.lng;

        const destinationLat = destinationLocation.lat;

        const url =
          "https://router.project-osrm.org/route/v1/driving/" +
          `${driverLng},${driverLat};` +
          `${destinationLng},${destinationLat}` +
          "?overview=full&geometries=geojson&steps=false";

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`OSRM request failed: ${response.status}`);
        }

        const data = await response.json();

        if (
          data.code !== "Ok" ||
          !data.routes?.length ||
          !data.routes[0]?.geometry?.coordinates
        ) {
          throw new Error("No route found");
        }

        const coordinates = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng],
        );

        setRouteCoords(coordinates);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        console.error("LiveMap route error:", error);

        setRouteError(true);

        setRouteCoords([
          [normalizedDriverLocation.lat, normalizedDriverLocation.lng],
          [destinationLocation.lat, destinationLocation.lng],
        ]);
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    const timeout = setTimeout(fetchRoute, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    normalizedDriverLocation?.routeLat,
    normalizedDriverLocation?.routeLng,
    destinationLocation?.lat,
    destinationLocation?.lng,
    orderStatus,
  ]);

  // ==========================================================
  // NO DRIVER LOCATION
  // ==========================================================

  if (!driverPos) {
    return null;
  }

  // ==========================================================
  // MAP
  // ==========================================================

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={driverPos}
        zoom={14}
        zoomControl={false}
        style={{
          width: "100%",
          height: "100%",
          background: "#020617",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {destinationPos && (
          <MapBounds
            driverPos={driverPos}
            destinationPos={destinationPos}
            shopPos={shopPos}
          />
        )}

        {/* =====================================================
            ROUTE SHADOW
        ===================================================== */}

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

        {/* =====================================================
            MAIN ROUTE
        ===================================================== */}

        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: routeError ? "#64748b" : "#10b981",
              weight: 6,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {/* =====================================================
            ROUTE HIGHLIGHT
        ===================================================== */}

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

        {/* =====================================================
            SHOP
        ===================================================== */}

        {shopPos && (
          <Marker position={shopPos} icon={shopIcon} zIndexOffset={800} />
        )}

        {/* =====================================================
            CUSTOMER
        ===================================================== */}

        {customerPos && (
          <Marker
            position={customerPos}
            icon={customerIcon}
            zIndexOffset={900}
          />
        )}

        {/* =====================================================
            DRIVER
        ===================================================== */}

        <Marker
          position={driverPos}
          icon={rotatingDriverIcon}
          zIndexOffset={1000}
        />
      </MapContainer>

      {/* ========================================================
          DESTINATION LABEL
      ======================================================== */}

      <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2">
        <div className="rounded-full border border-white/10 bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
          {isGoingToShop
            ? "🚚 Heading to store"
            : isGoingToCustomer
              ? "🏠 Heading to you"
              : "📍 Waiting for delivery route"}
        </div>
      </div>

      {/* ========================================================
          ROUTE LOADING
      ======================================================== */}

      {routeLoading && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/80 px-4 py-2 text-xs font-medium text-white/70 shadow-lg backdrop-blur-md">
          Updating road route...
        </div>
      )}

      {/* ========================================================
          ROUTE ERROR
      ======================================================== */}

      {routeError && !routeLoading && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-500/20 bg-black/80 px-4 py-2 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-md">
          Road route unavailable. Showing approximate path.
        </div>
      )}
    </div>
  );
}

// ============================================================
// BEARING CALCULATION
// ============================================================

function calculateBearing(start, end) {
  if (!start || !end) {
    return 0;
  }

  const startLat = start[0] * (Math.PI / 180);

  const startLng = start[1] * (Math.PI / 180);

  const endLat = end[0] * (Math.PI / 180);

  const endLng = end[1] * (Math.PI / 180);

  const longitudeDifference = endLng - startLng;

  const y = Math.sin(longitudeDifference) * Math.cos(endLat);

  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(longitudeDifference);

  const bearing = Math.atan2(y, x) * (180 / Math.PI);

  return (bearing + 360) % 360;
}
