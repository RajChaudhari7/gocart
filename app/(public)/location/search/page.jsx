"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Crosshair,
  Loader2,
  MapPin,
  Navigation,
  Store,
} from "lucide-react";

import { useCustomerLocation } from "@/context/CustomerLocationContext";

function LocationMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const latFromURL = searchParams.get("lat");
  const lngFromURL = searchParams.get("lng");

  const sourceFromURL = searchParams.get("source") || "SEARCH";

  const labelFromURL = searchParams.get("label") || "Selected Location";

  const formattedFromURL = searchParams.get("formattedAddress") || "";

  const { selectDeliveryLocation } = useCustomerLocation();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  const [reverseLoading, setReverseLoading] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  const [error, setError] = useState("");

  const [location, setLocation] = useState(null);

  const [serviceable, setServiceable] = useState(false);

  const [serviceRadius, setServiceRadius] = useState(3);

  const [nearbyStoreCount, setNearbyStoreCount] = useState(0);

  // ==================================================
  // SERVICEABILITY
  // ==================================================

  const checkServiceability = useCallback(async (latitude, longitude) => {
    try {
      const { data } = await axios.get("/api/store/nearby", {
        params: {
          lat: latitude,
          lng: longitude,
        },
      });

      setServiceable(Boolean(data.serviceable));

      setServiceRadius(Number(data.serviceRadiusKm || 3));

      setNearbyStoreCount(Array.isArray(data.stores) ? data.stores.length : 0);
    } catch (error) {
      console.error("SERVICEABILITY ERROR:", error);

      setServiceable(false);
      setNearbyStoreCount(0);
    }
  }, []);

  // ==================================================
  // REVERSE GEOCODING
  // ==================================================

  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      setReverseLoading(true);
      setError("");

      const { data } = await axios.post("/api/location/reverse", {
        latitude,
        longitude,
      });

      const resolved = data.location;

      if (!resolved) {
        throw new Error("Unable to identify this location.");
      }

      setLocation((current) => ({
        ...current,

        latitude,
        longitude,

        label: resolved.label || current?.label || "Selected Location",

        formattedAddress:
          resolved.formattedAddress || current?.formattedAddress || "",

        street: resolved.street || "",

        area: resolved.area || "",

        city: resolved.city || "",

        state: resolved.state || "",

        zip: resolved.zip || "",

        country: resolved.country || "India",

        osmType: resolved.osmType || null,

        osmId: resolved.osmId || null,

        source: "MAP",

        addressId: null,
      }));
    } catch (error) {
      console.error("REVERSE GEOCODING ERROR:", error?.response?.data || error);

      setError(
        error?.response?.data?.error ||
          error?.message ||
          "We found the location, but could not identify the exact address.",
      );
    } finally {
      setReverseLoading(false);
    }
  }, []);

  // ==================================================
  // INITIAL LOCATION
  // ==================================================

  useEffect(() => {
    const loadInitialLocation = async () => {
      try {
        setInitialLoading(true);
        setError("");

        const latitude = Number(latFromURL);

        const longitude = Number(lngFromURL);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          throw new Error("No valid location was provided.");
        }

        setLocation({
          latitude,
          longitude,

          label: labelFromURL,

          formattedAddress: formattedFromURL,

          source: sourceFromURL,

          addressId: null,
        });

        await checkServiceability(latitude, longitude);
      } catch (error) {
        console.error("MAP LOCATION LOAD ERROR:", error);

        setError(error?.message || "Unable to load this location.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialLocation();
  }, [
    latFromURL,
    lngFromURL,
    sourceFromURL,
    labelFromURL,
    formattedFromURL,
    checkServiceability,
  ]);

  // ==================================================
  // LOAD LEAFLET
  // ==================================================

  useEffect(() => {
    let mounted = true;

    const loadLeaflet = async () => {
      try {
        const leafletModule = await import("leaflet");

        const L = leafletModule.default || leafletModule;

        if (!mounted) return;

        /*
         * Leaflet's default marker image URLs
         * don't always work correctly with Next.js.
         *
         * We use divIcon instead, so no PNG marker
         * assets are required.
         */

        leafletRef.current = L;
        setMapReady(true);
      } catch (error) {
        console.error("LEAFLET LOAD ERROR:", error);

        setError("Unable to load the map.");
      }
    };

    loadLeaflet();

    return () => {
      mounted = false;
    };
  }, []);

  // ==================================================
  // HANDLE POSITION CHANGE
  // ==================================================

  const updateLocationFromMap = useCallback(
    async (latitude, longitude, source = "MAP") => {
      setLocation((current) => ({
        ...current,

        latitude,
        longitude,

        source,

        addressId: null,
      }));

      await Promise.allSettled([
        reverseGeocode(latitude, longitude),

        checkServiceability(latitude, longitude),
      ]);
    },
    [reverseGeocode, checkServiceability],
  );

  // ==================================================
  // BUILD LEAFLET MAP
  // ==================================================

  useEffect(() => {
    if (!mapReady) return;
    if (!location) return;
    if (!mapContainerRef.current) return;

    const L = leafletRef.current;

    if (!L) return;

    const latitude = Number(location.latitude);

    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const position = [latitude, longitude];

    // --------------------------------------------
    // CREATE MAP
    // --------------------------------------------

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: position,

        zoom: 17,

        zoomControl: false,

        attributionControl: true,

        doubleClickZoom: false,
      });

      // ------------------------------------------
      // OSM TILES
      // ------------------------------------------

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,

        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current);

      // ------------------------------------------
      // ZOOM CONTROL
      // ------------------------------------------

      L.control
        .zoom({
          position: "bottomleft",
        })
        .addTo(mapRef.current);

      // ------------------------------------------
      // CUSTOM MARKER
      // ------------------------------------------

      const markerIcon = L.divIcon({
        className: "",

        html: `
          <div
            style="
              width:44px;
              height:44px;
              border-radius:50% 50% 50% 0;
              background:#06b6d4;
              border:4px solid white;
              box-shadow:0 8px 25px rgba(0,0,0,.35);
              transform:rotate(-45deg);
              display:flex;
              align-items:center;
              justify-content:center;
            "
          >
            <div
              style="
                width:12px;
                height:12px;
                border-radius:50%;
                background:#020617;
                transform:rotate(45deg);
              "
            ></div>
          </div>
        `,

        iconSize: [44, 44],

        iconAnchor: [22, 44],
      });

      markerRef.current = L.marker(position, {
        draggable: true,
        icon: markerIcon,
      }).addTo(mapRef.current);

      // ------------------------------------------
      // DRAG MARKER
      // ------------------------------------------

      markerRef.current.on("dragend", async (event) => {
        const marker = event.target;

        const next = marker.getLatLng();

        await updateLocationFromMap(next.lat, next.lng, "MAP");
      });

      // ------------------------------------------
      // MAP CLICK
      // ------------------------------------------

      mapRef.current.on("click", async (event) => {
        const latitude = event.latlng.lat;

        const longitude = event.latlng.lng;

        markerRef.current?.setLatLng([latitude, longitude]);

        await updateLocationFromMap(latitude, longitude, "MAP");
      });

      // ------------------------------------------
      // RESIZE FIX
      // ------------------------------------------

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 150);
    } else {
      mapRef.current.setView(position, mapRef.current.getZoom(), {
        animate: true,
      });

      markerRef.current?.setLatLng(position);
    }
  }, [
    mapReady,
    location?.latitude,
    location?.longitude,
    updateLocationFromMap,
  ]);

  // ==================================================
  // INITIAL REVERSE GEOCODING
  // ==================================================

  useEffect(() => {
    if (!location) return;

    if (location.formattedAddress) {
      return;
    }

    const latitude = Number(location.latitude);

    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    reverseGeocode(latitude, longitude);
  }, [
    location?.latitude,
    location?.longitude,
    location?.formattedAddress,
    reverseGeocode,
  ]);

  // ==================================================
  // CURRENT GPS LOCATION
  // ==================================================

  const recenterToCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported on this device.");

      return;
    }

    setCurrentLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = Number(position.coords.latitude);

          const longitude = Number(position.coords.longitude);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error("Invalid current location.");
          }

          const nextPosition = [latitude, longitude];

          mapRef.current?.setView(nextPosition, 17, {
            animate: true,
          });

          markerRef.current?.setLatLng(nextPosition);

          await updateLocationFromMap(latitude, longitude, "CURRENT");
        } catch (error) {
          console.error("RECENTER ERROR:", error);

          setError(error?.message || "Unable to use your current location.");
        } finally {
          setCurrentLocationLoading(false);
        }
      },

      (error) => {
        console.error("CURRENT LOCATION ERROR:", error);

        let message = "Unable to access your current location.";

        if (error.code === 1) {
          message = "Please allow location permission.";
        } else if (error.code === 2) {
          message = "Your current location could not be determined.";
        } else if (error.code === 3) {
          message = "Location request timed out.";
        }

        setError(message);

        setCurrentLocationLoading(false);
      },

      {
        enableHighAccuracy: true,

        timeout: 12000,

        maximumAge: 30000,
      },
    );
  };

  // ==================================================
  // CONFIRM LOCATION
  // ==================================================

  const confirmLocation = async () => {
    if (!location) return;

    try {
      setConfirming(true);
      setError("");

      await selectDeliveryLocation({
        latitude: location.latitude,

        longitude: location.longitude,

        label: location.label || labelFromURL || "Selected Location",

        formattedAddress: location.formattedAddress || "",

        source: location.source || sourceFromURL || "SEARCH",

        addressId: location.addressId || null,
      });

      router.push("/location");
    } catch (error) {
      console.error("CONFIRM LOCATION ERROR:", error);

      setError(error?.message || "Unable to select this delivery location.");
    } finally {
      setConfirming(false);
    }
  };

  // ==================================================
  // CLEANUP MAP
  // ==================================================

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markerRef.current = null;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* ======================================== */}
      {/* HEADER */}
      {/* ======================================== */}

      <div className="fixed inset-x-0 top-0 z-[1000] border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg font-black">Confirm delivery location</h1>

            <p className="mt-0.5 truncate text-xs text-white/35">
              Drag the pin or tap the map to choose your exact location
            </p>
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* MAP */}
      {/* ======================================== */}

      <section className="relative h-[58vh] min-h-[430px] pt-[65px] sm:h-[63vh] sm:pt-[73px]">
        {initialLoading ? (
          <div className="flex h-full flex-col items-center justify-center bg-slate-950">
            <Loader2 size={34} className="animate-spin text-cyan-400" />

            <p className="mt-4 text-sm font-semibold text-white/50">
              Loading your location...
            </p>
          </div>
        ) : error && !location ? (
          <div className="flex h-full items-center justify-center px-5">
            <div className="max-w-sm text-center">
              <MapPin size={36} className="mx-auto text-red-400" />

              <h2 className="mt-4 text-xl font-black">Unable to load map</h2>

              <p className="mt-2 text-sm text-white/40">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div ref={mapContainerRef} className="h-full w-full bg-slate-900" />

            {/* CENTER DECORATION */}

            <div className="pointer-events-none absolute left-1/2 top-[calc(50%+25px)] z-[500] -translate-x-1/2 -translate-y-full">
              <motion.div
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#020617]/90 text-cyan-400 shadow-xl backdrop-blur-xl"
              >
                <Navigation size={19} />
              </motion.div>
            </div>

            {/* CURRENT LOCATION BUTTON */}

            <button
              type="button"
              onClick={recenterToCurrentLocation}
              disabled={currentLocationLoading}
              className="absolute bottom-5 right-4 z-[500] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#020617]/90 text-cyan-400 shadow-xl backdrop-blur-xl transition hover:bg-slate-900 disabled:opacity-60"
            >
              {currentLocationLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Crosshair size={21} />
              )}
            </button>
          </>
        )}
      </section>

      {/* ======================================== */}
      {/* LOCATION DETAILS */}
      {/* ======================================== */}

      {location && (
        <section className="relative z-[600] -mt-5 rounded-t-[2rem] border-t border-white/10 bg-[#020617] px-4 pb-32 pt-6 shadow-[0_-15px_45px_rgba(0,0,0,0.35)] sm:px-6">
          <div className="mx-auto max-w-3xl">
            {/* ADDRESS */}

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                {reverseLoading ? (
                  <Loader2 size={21} className="animate-spin" />
                ) : (
                  <MapPin size={22} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  Delivery location
                </p>

                <h2 className="mt-1 text-lg font-black text-white sm:text-xl">
                  {location.label || "Selected Location"}
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-white/40 sm:text-sm">
                  {reverseLoading
                    ? "Finding exact address..."
                    : location.formattedAddress || "Exact address unavailable"}
                </p>
              </div>
            </div>

            {/* SERVICEABILITY */}

            <div
              className={`mt-5 rounded-2xl border p-4 ${
                serviceable
                  ? "border-emerald-500/20 bg-emerald-500/[0.07]"
                  : "border-amber-500/20 bg-amber-500/[0.07]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    serviceable
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {serviceable ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Store size={19} />
                  )}
                </div>

                <div>
                  <p
                    className={`font-bold ${
                      serviceable ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {serviceable
                      ? "Delivery available here"
                      : "Currently not serviceable"}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-white/35">
                    {serviceable
                      ? `${nearbyStoreCount} ${
                          nearbyStoreCount === 1 ? "store can" : "stores can"
                        } currently deliver within ${serviceRadius} km of this location.`
                      : `We currently don't have a partner store within ${serviceRadius} km of this location.`}
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300">
                {error}
              </div>
            )}

            {/* TIP */}

            <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-3">
              <p className="text-[11px] leading-relaxed text-white/35">
                Drag the marker or tap anywhere on the map to set your exact
                entrance or delivery point.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ======================================== */}
      {/* CONFIRM BUTTON */}
      {/* ======================================== */}

      {location && (
        <div className="fixed inset-x-0 bottom-0 z-[1000] border-t border-white/10 bg-[#020617]/95 p-3 backdrop-blur-2xl sm:p-4">
          <div className="mx-auto max-w-3xl">
            <button
              type="button"
              onClick={confirmLocation}
              disabled={confirming || reverseLoading}
              className={`
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                px-5
                py-4
                text-sm
                font-black
                transition
                active:scale-[0.99]

                ${
                  serviceable
                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    : "bg-amber-500 text-slate-950 hover:bg-amber-400"
                }

                disabled:cursor-not-allowed
                disabled:opacity-60
              `}
            >
              {confirming ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Selecting location...
                </>
              ) : (
                <>
                  <Navigation size={18} />

                  {serviceable
                    ? "Confirm Delivery Location"
                    : "Use This Location Anyway"}
                </>
              )}
            </button>

            {!serviceable && (
              <p className="mt-2 text-center text-[10px] text-amber-400/70">
                You can save this location, but products and stores will remain
                unavailable until service reaches this area.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function LocationMapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
          <Loader2 className="animate-spin text-cyan-400" />
        </div>
      }
    >
      <LocationMapContent />
    </Suspense>
  );
}
