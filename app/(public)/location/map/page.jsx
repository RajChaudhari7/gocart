"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
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

  const placeId = searchParams.get("placeId");
  const sessionToken = searchParams.get("sessionToken");

  const latFromURL = searchParams.get("lat");
  const lngFromURL = searchParams.get("lng");

  const sourceFromURL = searchParams.get("source") || "SEARCH";
  const labelFromURL = searchParams.get("label") || "Selected Location";
  const formattedFromURL = searchParams.get("formattedAddress") || "";

  const { selectDeliveryLocation } = useCustomerLocation();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [error, setError] = useState("");

  const [location, setLocation] = useState(null);

  const [serviceable, setServiceable] = useState(false);
  const [serviceRadius, setServiceRadius] = useState(3);
  const [nearbyStoreCount, setNearbyStoreCount] = useState(0);

  // --------------------------------------------------
  // CHECK SERVICEABILITY
  // --------------------------------------------------

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

  // --------------------------------------------------
  // REVERSE GEOCODE COORDINATES
  // --------------------------------------------------

  const reverseGeocode = useCallback(
    async (latitude, longitude) => {
      if (typeof window === "undefined" || !window.google?.maps) {
        return;
      }

      try {
        setReverseLoading(true);

        const geocoder = new window.google.maps.Geocoder();

        const response = await geocoder.geocode({
          location: {
            lat: latitude,
            lng: longitude,
          },
        });

        const result = response.results?.[0];

        if (!result) {
          setLocation((current) => ({
            ...current,
            latitude,
            longitude,
            formattedAddress: current?.formattedAddress || "",
          }));

          return;
        }

        const getComponent = (type) => {
          const item = result.address_components?.find((component) =>
            component.types?.includes(type),
          );

          return item?.long_name || "";
        };

        const street = [getComponent("street_number"), getComponent("route")]
          .filter(Boolean)
          .join(" ");

        const area =
          getComponent("sublocality_level_1") ||
          getComponent("sublocality") ||
          getComponent("neighborhood");

        const city =
          getComponent("locality") ||
          getComponent("administrative_area_level_2");

        const state = getComponent("administrative_area_level_1");

        const zip = getComponent("postal_code");

        const country = getComponent("country") || "India";

        const displayLabel =
          area || street || city || labelFromURL || "Selected Location";

        setLocation((current) => ({
          ...current,

          latitude,
          longitude,

          label: displayLabel,

          formattedAddress: result.formatted_address || "",

          street,
          area,
          city,
          state,
          zip,
          country,
        }));
      } catch (error) {
        console.error("REVERSE GEOCODING ERROR:", error);

        setError(
          "We found the location, but could not identify the exact address.",
        );
      } finally {
        setReverseLoading(false);
      }
    },
    [labelFromURL],
  );

  // --------------------------------------------------
  // LOAD INITIAL LOCATION
  // --------------------------------------------------

  useEffect(() => {
    const loadInitialLocation = async () => {
      try {
        setInitialLoading(true);
        setError("");

        if (placeId) {
          const { data } = await axios.post("/api/location/place", {
            placeId,
            sessionToken,
          });

          const resolved = data.location;

          setLocation(resolved);

          await checkServiceability(resolved.latitude, resolved.longitude);

          return;
        }

        const latitude = Number(latFromURL);
        const longitude = Number(lngFromURL);

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          setLocation({
            latitude,
            longitude,

            label: labelFromURL,

            formattedAddress: formattedFromURL,

            source: sourceFromURL,

            addressId: null,
          });

          await checkServiceability(latitude, longitude);

          return;
        }

        throw new Error("No valid location was provided.");
      } catch (error) {
        console.error("MAP LOCATION LOAD ERROR:", error);

        setError(
          error?.response?.data?.error ||
            error?.message ||
            "Unable to load this location.",
        );
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialLocation();
  }, [
    placeId,
    sessionToken,
    latFromURL,
    lngFromURL,
    sourceFromURL,
    labelFromURL,
    formattedFromURL,
    checkServiceability,
  ]);

  // --------------------------------------------------
  // BUILD GOOGLE MAP
  // --------------------------------------------------

  useEffect(() => {
    if (
      !mapsLoaded ||
      !location ||
      !mapContainerRef.current ||
      !window.google?.maps
    ) {
      return;
    }

    const position = {
      lat: Number(location.latitude),
      lng: Number(location.longitude),
    };

    if (!mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: position,

        zoom: 17,

        disableDefaultUI: true,

        zoomControl: true,

        gestureHandling: "greedy",

        clickableIcons: false,

        mapTypeControl: false,

        streetViewControl: false,

        fullscreenControl: false,
      });

      markerRef.current = new window.google.maps.Marker({
        position,

        map: mapRef.current,

        draggable: true,

        animation: window.google.maps.Animation.DROP,
      });

      markerRef.current.addListener("dragend", async () => {
        const markerPosition = markerRef.current.getPosition();

        if (!markerPosition) return;

        const latitude = markerPosition.lat();

        const longitude = markerPosition.lng();

        setLocation((current) => ({
          ...current,
          latitude,
          longitude,
          source: "MAP",
          addressId: null,
        }));

        await Promise.all([
          reverseGeocode(latitude, longitude),

          checkServiceability(latitude, longitude),
        ]);
      });

      mapRef.current.addListener("click", async (event) => {
        if (!event.latLng) return;

        const latitude = event.latLng.lat();

        const longitude = event.latLng.lng();

        markerRef.current.setPosition({
          lat: latitude,
          lng: longitude,
        });

        setLocation((current) => ({
          ...current,
          latitude,
          longitude,
          source: "MAP",
          addressId: null,
        }));

        await Promise.all([
          reverseGeocode(latitude, longitude),

          checkServiceability(latitude, longitude),
        ]);
      });
    } else {
      mapRef.current.setCenter(position);

      markerRef.current?.setPosition(position);
    }

    /*
     * If location came from GPS and we don't
     * yet have an address name, reverse geocode it.
     */
    if (!location.formattedAddress) {
      reverseGeocode(position.lat, position.lng);
    }
  }, [
    mapsLoaded,
    location?.latitude,
    location?.longitude,
    location?.formattedAddress,
    reverseGeocode,
    checkServiceability,
  ]);

  // --------------------------------------------------
  // RECENTER TO DEVICE LOCATION
  // --------------------------------------------------

  const recenterToCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported on this device.");

      return;
    }

    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude);

        const longitude = Number(position.coords.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return;
        }

        const nextPosition = {
          lat: latitude,
          lng: longitude,
        };

        mapRef.current?.panTo(nextPosition);

        mapRef.current?.setZoom(17);

        markerRef.current?.setPosition(nextPosition);

        setLocation((current) => ({
          ...current,

          latitude,
          longitude,

          label: "Current Location",

          source: "CURRENT",

          addressId: null,
        }));

        await Promise.all([
          reverseGeocode(latitude, longitude),

          checkServiceability(latitude, longitude),
        ]);
      },

      (error) => {
        console.error("RECENTER LOCATION ERROR:", error);

        let message = "Unable to access your current location.";

        if (error.code === 1) {
          message = "Please allow location permission.";
        } else if (error.code === 2) {
          message = "Your current location could not be determined.";
        } else if (error.code === 3) {
          message = "Location request timed out.";
        }

        setError(message);
      },

      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      },
    );
  };

  // --------------------------------------------------
  // CONFIRM LOCATION
  // --------------------------------------------------

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

      /*
       * Return to main location page.
       *
       * Navbar + home/shop/product pages
       * will automatically read the new
       * CustomerLocationContext value.
       */
      router.push("/location");
    } catch (error) {
      console.error("CONFIRM LOCATION ERROR:", error);

      setError(error?.message || "Unable to select this delivery location.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setMapsLoaded(true)}
      />

      <main className="min-h-screen bg-[#020617] text-white">
        {/* ================= HEADER ================= */}

        <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-3 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-lg font-black">Confirm delivery location</h1>

              <p className="mt-0.5 text-xs text-white/35">
                Move the pin to your exact delivery point
              </p>
            </div>
          </div>
        </div>

        {/* ================= MAP ================= */}

        <section className="relative h-[58vh] min-h-[420px] pt-[65px] sm:h-[62vh] sm:pt-[73px]">
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
              <div ref={mapContainerRef} className="h-full w-full" />

              {/* Fixed center decoration */}

              <div className="pointer-events-none absolute left-1/2 top-[calc(50%+30px)] z-20 -translate-x-1/2 -translate-y-full">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/90 shadow-xl"
                >
                  <Navigation size={19} className="text-cyan-400" />
                </motion.div>
              </div>

              {/* CURRENT LOCATION */}

              <button
                type="button"
                onClick={recenterToCurrentLocation}
                className="absolute bottom-5 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/90 text-cyan-400 shadow-xl backdrop-blur-xl"
              >
                <Crosshair size={21} />
              </button>
            </>
          )}
        </section>

        {/* ================= DETAILS ================= */}

        {location && (
          <section className="relative z-30 -mt-5 rounded-t-[2rem] border-t border-white/10 bg-[#020617] px-4 pb-32 pt-6 shadow-[0_-15px_45px_rgba(0,0,0,0.35)] sm:px-6">
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
                      : location.formattedAddress ||
                        "Exact address unavailable"}
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
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                  {error}
                </div>
              )}

              {/* TIP */}

              <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-3">
                <p className="text-[11px] leading-relaxed text-white/35">
                  Drag the red map pin or tap another point on the map to set
                  your exact entrance or delivery point.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ================= BOTTOM CONFIRM ================= */}

        {location && (
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#020617]/95 p-3 backdrop-blur-2xl sm:p-4">
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
                  You can save this location, but products and stores will
                  remain unavailable until service reaches this area.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </>
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
