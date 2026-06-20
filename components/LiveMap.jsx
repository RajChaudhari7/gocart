"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- CUSTOM SVG ICONS ---
const createDriverIcon = () =>
    L.divIcon({
        className: "custom-icon",
        html: `
      <div style="background-color: #10b981; border: 2px solid white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 18H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h5.5l2-4h5M15 11l-2 4h4.5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2M15 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM7 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"></path>
        </svg>
      </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });

const createCustomerIcon = () =>
    L.divIcon({
        className: "custom-icon",
        html: `
      <div style="background-color: #6366f1; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

// --- COMPONENT TO AUTO-ADJUST MAP BOUNDS ---
const MapBounds = ({ driverPos, customerPos }) => {
    const map = useMap();
    useEffect(() => {
        if (driverPos && customerPos) {
            const bounds = L.latLngBounds([driverPos, customerPos]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [driverPos, customerPos, map]);
    return null;
};

// --- MAIN COMPONENT ---
export default function LiveMap({ driverLocation, customerLocation }) {
    const [routeCoords, setRouteCoords] = useState([]);

    const driverPos = driverLocation ? [driverLocation.lat, driverLocation.lng] : null;
    const customerPos = customerLocation ? [customerLocation.lat, customerLocation.lng] : null;

    useEffect(() => {
        // Fetch the actual road route from OSRM
        const fetchRoute = async () => {
            if (!driverPos || !customerPos) return;
            try {
                // OSRM expects Longitude, Latitude format
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${customerLocation.lng},${customerLocation.lat}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (data.routes && data.routes[0]) {
                    // OSRM returns [Lng, Lat], Leaflet Polyline needs [Lat, Lng]
                    const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
                    setRouteCoords(coords);
                }
            } catch (error) {
                console.error("Error fetching route", error);
            }
        };

        fetchRoute();
    }, [driverLocation, customerLocation]); // Refetches when driver moves!

    if (!driverPos) return null;

    return (
        <div style={{ height: "100%", width: "100%", borderRadius: "1rem", overflow: "hidden" }}>
            <MapContainer
                center={driverPos}
                zoom={14}
                style={{ height: "100%", width: "100%", background: "#020617" }}
                zoomControl={false}
            >
                {/* Sleek Dark Mode Map Tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />

                {driverPos && customerPos && <MapBounds driverPos={driverPos} customerPos={customerPos} />}

                {/* The Highlighted Road Route */}
                {routeCoords.length > 0 && (
                    <Polyline positions={routeCoords} color="#10b981" weight={5} opacity={0.7} />
                )}

                {/* Driver Bike Icon */}
                <Marker position={driverPos} icon={createDriverIcon()} />

                {/* Customer Destination Icon */}
                {customerPos && <Marker position={customerPos} icon={createCustomerIcon()} />}
            </MapContainer>
        </div>
    );
}