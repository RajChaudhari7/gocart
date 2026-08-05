'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

import "leaflet/dist/leaflet.css";

// Define custom icons
const createIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const icons = {
    driver: createIcon('blue'),
    shop: createIcon('red'),
    customer: createIcon('green')
};

function MapUpdater({ driverPos, destinationPos }) {
    const map = useMap();
    useEffect(() => {
        if (driverPos && destinationPos) {
            const bounds = L.latLngBounds([driverPos, destinationPos]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [driverPos, destinationPos, map]);
    return null;
}

export default function DeliveryMap({ driverPos, destinationPos, isGoingToShop }) {
    if (!driverPos || !destinationPos) return null;

    return (
        <div className="h-64 w-full rounded-xl overflow-hidden mb-4 border-2 border-indigo-100 shadow-inner">
            <MapContainer center={driverPos} zoom={15} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Route Path (The highlighted road) */}
                <Polyline positions={[driverPos, destinationPos]} color="indigo" weight={5} dashArray="10, 10" />

                <Marker position={driverPos} icon={icons.driver}><Popup>You</Popup></Marker>
                <Marker position={destinationPos} icon={isGoingToShop ? icons.shop : icons.customer}>
                    <Popup>{isGoingToShop ? "Store" : "Customer"}</Popup>
                </Marker>

                <MapUpdater driverPos={driverPos} destinationPos={destinationPos} />
            </MapContainer>
        </div>
    );
}