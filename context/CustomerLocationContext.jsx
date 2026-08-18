"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import axios from "axios";

const CustomerLocationContext = createContext(null);

export function CustomerLocationProvider({ children }) {
  const [nearbyStores, setNearbyStores] = useState([]);
  const [customerLocation, setCustomerLocation] = useState(null);

  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  const [serviceable, setServiceable] = useState(false);
  const [serviceRadius, setServiceRadius] = useState(3);

  const loadNearbyStores = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported on this device.");
      setLocationLoading(false);
      setServiceable(false);
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = Number(position.coords.latitude);
          const longitude = Number(position.coords.longitude);

          setCustomerLocation({
            latitude,
            longitude,
          });

          const { data } = await axios.get("/api/store/nearby", {
            params: {
              lat: latitude,
              lng: longitude,
            },
          });

          const stores = Array.isArray(data.stores) ? data.stores : [];

          setNearbyStores(stores);

          setServiceable(Boolean(data.serviceable));

          setServiceRadius(Number(data.serviceRadiusKm || 3));
        } catch (error) {
          console.error("Nearby stores error:", error);

          setNearbyStores([]);
          setServiceable(false);

          setLocationError(
            error?.response?.data?.error ||
              "Unable to find stores near your location.",
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error("Location error:", error);

        if (error.code === 1) {
          setLocationError(
            "Please allow location access to view stores and products near you.",
          );
        } else if (error.code === 2) {
          setLocationError("We could not determine your location.");
        } else if (error.code === 3) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Unable to access your current location.");
        }

        setNearbyStores([]);
        setServiceable(false);
        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  }, []);

  useEffect(() => {
    loadNearbyStores();
  }, [loadNearbyStores]);

  const nearbyStoreIds = useMemo(() => {
    return new Set(nearbyStores.map((store) => store.id));
  }, [nearbyStores]);

  const isStoreNearby = useCallback(
    (storeId) => {
      if (!storeId) return false;

      return nearbyStoreIds.has(storeId);
    },
    [nearbyStoreIds],
  );

  const filterNearbyProducts = useCallback(
    (products = []) => {
      if (!serviceable) return [];

      return products.filter((product) =>
        nearbyStoreIds.has(product.storeId || product.store?.id),
      );
    },
    [nearbyStoreIds, serviceable],
  );

  return (
    <CustomerLocationContext.Provider
      value={{
        nearbyStores,
        nearbyStoreIds,
        customerLocation,

        locationLoading,
        locationError,

        serviceable,
        serviceRadius,

        loadNearbyStores,
        isStoreNearby,
        filterNearbyProducts,
      }}
    >
      {children}
    </CustomerLocationContext.Provider>
  );
}

export function useCustomerLocation() {
  const context = useContext(CustomerLocationContext);

  if (!context) {
    throw new Error(
      "useCustomerLocation must be used inside CustomerLocationProvider",
    );
  }

  return context;
}
