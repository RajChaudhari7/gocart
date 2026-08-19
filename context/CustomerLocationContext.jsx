"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const CustomerLocationContext = createContext(null);

const LOCATION_STORAGE_KEY = "selectedDeliveryLocation";
const RECENT_LOCATIONS_STORAGE_KEY = "recentDeliveryLocations";

export function CustomerLocationProvider({ children }) {
  const [nearbyStores, setNearbyStores] = useState([]);

  /*
   * This is now the ACTIVE DELIVERY LOCATION,
   * not necessarily the customer's physical GPS location.
   *
   * Example:
   * {
   *   latitude: 21.3700,
   *   longitude: 74.2400,
   *   label: "Home",
   *   formattedAddress: "Shivaji Road, Nandurbar",
   *   source: "SAVED",
   *   addressId: "abc123"
   * }
   */
  const [customerLocation, setCustomerLocation] = useState(null);

  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState("");

  const [serviceable, setServiceable] = useState(false);
  const [serviceRadius, setServiceRadius] = useState(3);

  /*
   * Used later for:
   * Recently used addresses / locations
   */
  const [recentLocations, setRecentLocations] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_LOCATIONS_STORAGE_KEY);

      if (!stored) return;

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setRecentLocations(parsed.slice(0, 5));
      }
    } catch (error) {
      console.error("Unable to restore recent locations:", error);
    }
  }, []);

  // --------------------------------------------------
  // SAVE SELECTED LOCATION LOCALLY
  // --------------------------------------------------

  const persistLocation = useCallback((location) => {
    if (!location) return;

    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    } catch (error) {
      console.error("Unable to save selected location:", error);
    }
  }, []);

  // --------------------------------------------------
  // FETCH NEARBY STORES USING GIVEN COORDINATES
  // --------------------------------------------------

  const fetchNearbyStores = useCallback(async (latitude, longitude) => {
    try {
      setLocationLoading(true);
      setLocationError("");

      const lat = Number(latitude);
      const lng = Number(longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Invalid delivery location coordinates.");
      }

      const { data } = await axios.get("/api/store/nearby", {
        params: {
          lat,
          lng,
        },
      });

      const stores = Array.isArray(data.stores) ? data.stores : [];

      setNearbyStores(stores);

      setServiceable(Boolean(data.serviceable));

      setServiceRadius(Number(data.serviceRadiusKm || 3));

      return {
        stores,
        serviceable: Boolean(data.serviceable),
        serviceRadiusKm: Number(data.serviceRadiusKm || 3),
      };
    } catch (error) {
      console.error("Nearby stores error:", error);

      setNearbyStores([]);
      setServiceable(false);

      setLocationError(
        error?.response?.data?.error ||
          error?.message ||
          "Unable to find stores near your location.",
      );

      throw error;
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // SELECT DELIVERY LOCATION
  // --------------------------------------------------

  const selectDeliveryLocation = useCallback(
    async (location) => {
      if (!location) {
        return;
      }

      const latitude = Number(location.latitude);

      const longitude = Number(location.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Invalid delivery location.");
      }

      const normalizedLocation = {
        latitude,
        longitude,

        label: location.label || "Selected Location",

        formattedAddress: location.formattedAddress || "",

        source: location.source || "SEARCH",

        /*
         * Only present when location comes
         * from user's saved address.
         */
        addressId: location.addressId || null,

        selectedAt: Date.now(),
      };

      setCustomerLocation(normalizedLocation);

      persistLocation(normalizedLocation);

      /*
       * Add to recently used locations.
       *
       * Avoid duplicates using coordinates.
       */
      setRecentLocations((current) => {
        const withoutDuplicate = current.filter(
          (item) =>
            !(
              Number(item.latitude) === latitude &&
              Number(item.longitude) === longitude
            ),
        );

        const updated = [normalizedLocation, ...withoutDuplicate].slice(0, 5);

        try {
          localStorage.setItem(
            RECENT_LOCATIONS_STORAGE_KEY,
            JSON.stringify(updated),
          );
        } catch (error) {
          console.error("Unable to save recent locations:", error);
        }

        return updated;
      });

      await fetchNearbyStores(latitude, longitude);

      return normalizedLocation;
    },
    [fetchNearbyStores, persistLocation],
  );

  // --------------------------------------------------
  // USE DEVICE CURRENT LOCATION
  // --------------------------------------------------

  const useCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error("Location is not supported on this device.");

        setLocationError(error.message);

        setLocationLoading(false);
        setServiceable(false);

        reject(error);

        return;
      }

      setLocationLoading(true);
      setLocationError("");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = Number(position.coords.latitude);

            const longitude = Number(position.coords.longitude);

            /*
             * For now label is Current Location.
             *
             * Later when we create the map page,
             * we will reverse-geocode this and replace
             * formattedAddress with the actual area name.
             */
            const location = await selectDeliveryLocation({
              latitude,
              longitude,

              label: "Current Location",

              formattedAddress: "",

              source: "CURRENT",

              addressId: null,
            });

            resolve(location);
          } catch (error) {
            reject(error);
          }
        },

        (error) => {
          console.error("Location error:", error);

          let message = "Unable to access your current location.";

          if (error.code === 1) {
            message =
              "Please allow location access to view stores and products near you.";
          } else if (error.code === 2) {
            message = "We could not determine your location.";
          } else if (error.code === 3) {
            message = "Location request timed out. Please try again.";
          }

          setLocationError(message);

          setNearbyStores([]);
          setServiceable(false);
          setLocationLoading(false);

          reject(new Error(message));
        },

        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000,
        },
      );
    });
  }, [selectDeliveryLocation]);

  // --------------------------------------------------
  // LOAD INITIAL LOCATION
  // --------------------------------------------------

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        /*
         * First check whether user previously selected
         * a delivery location.
         */
        const stored = localStorage.getItem(LOCATION_STORAGE_KEY);

        if (stored) {
          try {
            const parsed = JSON.parse(stored);

            if (parsed?.latitude != null && parsed?.longitude != null) {
              setCustomerLocation(parsed);

              await fetchNearbyStores(parsed.latitude, parsed.longitude);

              return;
            }
          } catch (error) {
            console.error("Invalid stored location:", error);

            localStorage.removeItem(LOCATION_STORAGE_KEY);
          }
        }

        /*
         * No saved selection.
         *
         * Fall back to physical GPS.
         */
        await useCurrentLocation();
      } catch (error) {
        console.error("Location initialization failed:", error);
      }
    };

    initializeLocation();
  }, [fetchNearbyStores, useCurrentLocation]);

  // --------------------------------------------------
  // REFRESH NEARBY STORES
  // --------------------------------------------------

  const loadNearbyStores = useCallback(async () => {
    /*
     * IMPORTANT:
     * If customer already selected Home/Office/etc.,
     * do NOT replace it with their physical GPS.
     */
    if (
      customerLocation?.latitude != null &&
      customerLocation?.longitude != null
    ) {
      return fetchNearbyStores(
        customerLocation.latitude,
        customerLocation.longitude,
      );
    }

    return useCurrentLocation();
  }, [customerLocation, fetchNearbyStores, useCurrentLocation]);

  // --------------------------------------------------
  // CLEAR SELECTED LOCATION
  // --------------------------------------------------

  const clearDeliveryLocation = useCallback(() => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);

    setCustomerLocation(null);

    setNearbyStores([]);

    setServiceable(false);

    setLocationError("");
  }, []);

  // --------------------------------------------------
  // NEARBY STORE IDS
  // --------------------------------------------------

  const nearbyStoreIds = useMemo(() => {
    return new Set(nearbyStores.map((store) => store.id));
  }, [nearbyStores]);

  // --------------------------------------------------
  // CHECK STORE
  // --------------------------------------------------

  const isStoreNearby = useCallback(
    (storeId) => {
      if (!storeId) {
        return false;
      }

      return nearbyStoreIds.has(storeId);
    },
    [nearbyStoreIds],
  );

  // --------------------------------------------------
  // FILTER PRODUCTS
  // --------------------------------------------------

  const filterNearbyProducts = useCallback(
    (products = []) => {
      if (!serviceable) {
        return [];
      }

      return products.filter((product) =>
        nearbyStoreIds.has(product.storeId || product.store?.id),
      );
    },
    [nearbyStoreIds, serviceable],
  );

  // --------------------------------------------------
  // CONTEXT
  // --------------------------------------------------

  return (
    <CustomerLocationContext.Provider
      value={{
        /*
         * LOCATION
         */
        customerLocation,

        /*
         * RECENTS
         */
        recentLocations,

        /*
         * STORES
         */
        nearbyStores,
        nearbyStoreIds,

        /*
         * SERVICEABILITY
         */
        serviceable,
        serviceRadius,

        /*
         * STATE
         */
        locationLoading,
        locationError,

        /*
         * ACTIONS
         */
        selectDeliveryLocation,
        useCurrentLocation,
        loadNearbyStores,
        clearDeliveryLocation,

        /*
         * HELPERS
         */
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
