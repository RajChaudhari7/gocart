"use client";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    Polyline,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useMemo } from "react";

import "leaflet/dist/leaflet.css";

// ----------------------------------------------------
// CUSTOM ICONS
// ----------------------------------------------------

const createIcon = (color) =>
    new L.Icon({
        iconUrl:
            `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,

        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",

        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

const icons = {
    driver: createIcon("blue"),
    shop: createIcon("red"),
    customer: createIcon("green"),
};

// ----------------------------------------------------
// NORMALIZE ARRAY OR OBJECT LOCATION
// ----------------------------------------------------

const normalizePosition = (position) => {
    if (!position) {
        return null;
    }

    let lat;
    let lng;

    // Supports: [latitude, longitude]
    if (Array.isArray(position)) {
        lat = Number(position[0]);
        lng = Number(position[1]);
    } else {
        // Supports: { lat, lng }
        lat = Number(position.lat);
        lng = Number(position.lng);
    }

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {
        return null;
    }

    if (
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
    ) {
        return null;
    }

    return [lat, lng];
};

// ----------------------------------------------------
// AUTO FIT MAP
// ----------------------------------------------------

function MapUpdater({
    driverPos,
    destinationPos,
}) {
    const map = useMap();

    useEffect(() => {
        if (!driverPos || !destinationPos) {
            return;
        }

        const bounds = L.latLngBounds([
            driverPos,
            destinationPos,
        ]);

        if (!bounds.isValid()) {
            return;
        }

        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
        });
    }, [
        driverPos?.[0],
        driverPos?.[1],
        destinationPos?.[0],
        destinationPos?.[1],
        map,
    ]);

    return null;
}

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

export default function DeliveryMap({
    driverPos,
    destinationPos,
    isGoingToShop,
}) {
    const validDriverPos = useMemo(
        () => normalizePosition(driverPos),
        [
            Array.isArray(driverPos)
                ? driverPos?.[0]
                : driverPos?.lat,

            Array.isArray(driverPos)
                ? driverPos?.[1]
                : driverPos?.lng,
        ]
    );

    const validDestinationPos = useMemo(
        () => normalizePosition(destinationPos),
        [
            Array.isArray(destinationPos)
                ? destinationPos?.[0]
                : destinationPos?.lat,

            Array.isArray(destinationPos)
                ? destinationPos?.[1]
                : destinationPos?.lng,
        ]
    );

    if (
        !validDriverPos ||
        !validDestinationPos
    ) {
        return (
            <div className="mb-4 flex h-64 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                <div>
                    <p className="font-medium text-slate-600">
                        Map location unavailable
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Waiting for valid GPS coordinates.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4 h-64 w-full overflow-hidden rounded-xl border-2 border-indigo-100 shadow-inner">

            <MapContainer
                key={`${validDriverPos.join(",")}-${validDestinationPos.join(",")}`}
                center={validDriverPos}
                zoom={15}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {/* Approximate route */}
                <Polyline
                    positions={[
                        validDriverPos,
                        validDestinationPos,
                    ]}
                    pathOptions={{
                        color: "indigo",
                        weight: 5,
                        dashArray: "10, 10",
                    }}
                />

                {/* Driver */}
                <Marker
                    position={validDriverPos}
                    icon={icons.driver}
                >
                    <Popup>
                        Your current location
                    </Popup>
                </Marker>

                {/* Shop or customer */}
                <Marker
                    position={validDestinationPos}
                    icon={
                        isGoingToShop
                            ? icons.shop
                            : icons.customer
                    }
                >
                    <Popup>
                        {isGoingToShop
                            ? "Store"
                            : "Customer"}
                    </Popup>
                </Marker>

                <MapUpdater
                    driverPos={validDriverPos}
                    destinationPos={
                        validDestinationPos
                    }
                />

            </MapContainer>

        </div>
    );
}