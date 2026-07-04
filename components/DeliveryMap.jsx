'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Import Leaflet styles
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

// Fix for default Leaflet marker icons in React
const DefaultIcon = L.icon({
    iconUrl: icon.src,
    iconRetinaUrl: iconRetina.src,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to keep the map centered on the driver
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 15);
    }, [center, map]);
    return null;
}

export default function DeliveryMap({ driverPos, destinationPos }) {
    if (!driverPos || !destinationPos) return null;

    return (
        <div className="h-48 w-full rounded-xl overflow-hidden mb-4 border border-gray-200">
            <MapContainer center={driverPos} zoom={15} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Driver Marker */}
                <Marker position={driverPos}>
                    <Popup>You are here</Popup>
                </Marker>

                {/* Destination Marker */}
                <Marker position={destinationPos}>
                    <Popup>Destination</Popup>
                </Marker>

                <MapUpdater center={driverPos} />
            </MapContainer>
        </div>
    );
}