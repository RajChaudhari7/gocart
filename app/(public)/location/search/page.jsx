"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Crosshair,
  Home,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";

import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function LocationSearchPage() {
  const router = useRouter();

  const {
    customerLocation,
    recentLocations,
    useCurrentLocation,
    locationLoading,
  } = useCustomerLocation();

  const [searchInput, setSearchInput] = useState("");
  const [predictions, setPredictions] = useState([]);

  const [searchLoading, setSearchLoading] = useState(false);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  const [error, setError] = useState("");
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  const inputRef = useRef(null);
  const requestCounterRef = useRef(0);

  // ==================================================
  // AUTO FOCUS SEARCH
  // ==================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  // ==================================================
  // SEARCH LOCATIONS
  // ==================================================

  useEffect(() => {
    const query = searchInput.trim();

    if (query.length < 2) {
      requestCounterRef.current += 1;

      setPredictions([]);
      setSearchLoading(false);
      setError("");

      return;
    }

    const timeout = setTimeout(async () => {
      const requestId = ++requestCounterRef.current;

      try {
        setSearchLoading(true);
        setError("");

        const payload = {
          input: query,
        };

        // Bias results toward the currently selected location
        if (
          customerLocation?.latitude != null &&
          customerLocation?.longitude != null
        ) {
          payload.latitude = Number(customerLocation.latitude);
          payload.longitude = Number(customerLocation.longitude);
        }

        const { data } = await axios.post(
          "/api/location/autocomplete",
          payload,
        );

        // Ignore old requests
        if (requestId !== requestCounterRef.current) {
          return;
        }

        setPredictions(Array.isArray(data.predictions) ? data.predictions : []);
      } catch (error) {
        console.error("LOCATION SEARCH ERROR:", error?.response?.data || error);

        if (requestId !== requestCounterRef.current) {
          return;
        }

        setPredictions([]);

        setError(
          error?.response?.data?.error ||
            error?.message ||
            "Unable to search locations right now.",
        );
      } finally {
        if (requestId === requestCounterRef.current) {
          setSearchLoading(false);
        }
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [searchInput, customerLocation?.latitude, customerLocation?.longitude]);

  // ==================================================
  // SELECT SEARCH RESULT
  // ==================================================

  const handleSelectPrediction = (prediction) => {
    const latitude = Number(prediction.latitude ?? prediction.lat);

    const longitude = Number(
      prediction.longitude ?? prediction.lng ?? prediction.lon,
    );

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("This location does not contain valid coordinates.");

      console.error("INVALID LOCATION RESULT:", prediction);

      return;
    }

    try {
      const predictionId =
        prediction.id || prediction.osmId || `${latitude}-${longitude}`;

      setSelectedPrediction(predictionId);
      setError("");

      const label =
        prediction.mainText ||
        prediction.label ||
        prediction.name ||
        prediction.text ||
        "Selected Location";

      const formattedAddress =
        prediction.formattedAddress ||
        prediction.displayName ||
        prediction.secondaryText ||
        prediction.address ||
        "";

      const params = new URLSearchParams({
        lat: String(latitude),
        lng: String(longitude),
        source: "SEARCH",
        label,
        formattedAddress,
      });

      router.push(`/location/map?${params.toString()}`);
    } catch (error) {
      console.error("SELECT LOCATION ERROR:", error);

      setError("Unable to open this location.");
      setSelectedPrediction(null);
    }
  };

  // ==================================================
  // USE CURRENT GPS LOCATION
  // ==================================================

  const handleUseCurrentLocation = async () => {
    try {
      setCurrentLocationLoading(true);
      setError("");

      const location = await useCurrentLocation();

      const latitude = Number(location?.latitude);
      const longitude = Number(location?.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Unable to determine your current location.");
      }

      const params = new URLSearchParams({
        lat: String(latitude),
        lng: String(longitude),
        source: "CURRENT",
        label: "Current Location",
      });

      router.push(`/location/map?${params.toString()}`);
    } catch (error) {
      console.error("CURRENT LOCATION ERROR:", error);

      setError(error?.message || "Unable to access your current location.");
    } finally {
      setCurrentLocationLoading(false);
    }
  };

  // ==================================================
  // RECENT LOCATIONS
  // ==================================================

  const displayRecentLocations = useMemo(() => {
    if (!Array.isArray(recentLocations)) {
      return [];
    }

    return recentLocations
      .filter((location) => {
        const latitude = Number(location?.latitude);
        const longitude = Number(location?.longitude);

        return Number.isFinite(latitude) && Number.isFinite(longitude);
      })
      .slice(0, 5);
  }, [recentLocations]);

  // ==================================================
  // SELECT RECENT LOCATION
  // ==================================================

  const handleRecentLocation = (location) => {
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("This recent location is invalid.");
      return;
    }

    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
      source: location.source || "RECENT",
      label: location.label || "Recent Location",
      formattedAddress: location.formattedAddress || "",
    });

    router.push(`/location/map?${params.toString()}`);
  };

  // ==================================================
  // CLEAR SEARCH
  // ==================================================

  const clearSearch = () => {
    requestCounterRef.current += 1;

    setSearchInput("");
    setPredictions([]);
    setSearchLoading(false);
    setError("");

    inputRef.current?.focus();
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* ======================================= */}
      {/* HEADER */}
      {/* ======================================= */}

      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-2xl">
        <div className="mx-auto max-w-3xl px-3 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="text-lg font-black sm:text-xl">
                Search delivery location
              </h1>

              <p className="mt-0.5 hidden text-xs text-white/35 sm:block">
                Search by area, street, landmark or building
              </p>
            </div>
          </div>

          {/* SEARCH */}

          <div className="relative mt-4">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search area, street or landmark..."
              autoComplete="off"
              spellCheck={false}
              className="
                w-full
                rounded-2xl
                border
                border-white/10
                bg-white/[0.055]
                py-3.5
                pl-11
                pr-12
                text-sm
                font-medium
                text-white
                outline-none
                transition
                placeholder:text-white/25
                focus:border-cyan-400/40
                focus:bg-white/[0.07]
                focus:ring-2
                focus:ring-cyan-400/5
                sm:py-4
                sm:text-base
              "
            />

            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center">
              {searchLoading ? (
                <Loader2 size={18} className="animate-spin text-cyan-400" />
              ) : searchInput ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* CONTENT */}
      {/* ======================================= */}

      <div className="mx-auto max-w-3xl px-3 pb-28 pt-4 sm:px-6 sm:pt-6">
        {/* CURRENT LOCATION */}

        <motion.button
          type="button"
          whileTap={{
            scale: 0.985,
          }}
          disabled={currentLocationLoading || locationLoading}
          onClick={handleUseCurrentLocation}
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-2xl
            border
            border-emerald-500/20
            bg-emerald-500/[0.07]
            p-4
            text-left
            transition
            hover:border-emerald-400/35
            hover:bg-emerald-500/[0.1]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            {currentLocationLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <LocateFixed size={21} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-emerald-400">Use current location</p>

            <p className="mt-0.5 text-xs text-white/35">
              Use GPS to detect your precise delivery point
            </p>
          </div>

          <Crosshair size={18} className="shrink-0 text-emerald-400/60" />
        </motion.button>

        {/* ======================================= */}
        {/* ERROR */}
        {/* ======================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================= */}
        {/* SEARCH RESULTS */}
        {/* ======================================= */}

        {searchInput.trim().length >= 2 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Search results
              </p>

              {searchLoading && (
                <p className="text-[10px] text-cyan-400/70">Searching...</p>
              )}
            </div>

            {!searchLoading && predictions.length === 0 ? (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-10 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <MapPin size={23} className="text-white/25" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-white">
                  No matching locations
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/30">
                  Try searching for an area, landmark, road, building or
                  locality name.
                </p>
              </motion.div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                <AnimatePresence initial={false}>
                  {predictions.map((prediction, index) => {
                    const latitude = Number(
                      prediction.latitude ?? prediction.lat,
                    );

                    const longitude = Number(
                      prediction.longitude ?? prediction.lng ?? prediction.lon,
                    );

                    const predictionId =
                      prediction.id ||
                      prediction.osmId ||
                      `${latitude}-${longitude}-${index}`;

                    return (
                      <motion.button
                        key={predictionId}
                        type="button"
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: Math.min(index * 0.025, 0.12),
                        }}
                        disabled={selectedPrediction === predictionId}
                        onClick={() => handleSelectPrediction(prediction)}
                        className={`
                            group
                            flex
                            w-full
                            items-start
                            gap-3
                            p-4
                            text-left
                            transition
                            hover:bg-white/[0.05]
                            disabled:cursor-wait
                            disabled:opacity-60
                            sm:p-5

                            ${
                              index !== predictions.length - 1
                                ? "border-b border-white/[0.07]"
                                : ""
                            }
                          `}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                          {selectedPrediction === predictionId ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <MapPin size={18} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-bold text-white sm:text-base">
                            {prediction.mainText ||
                              prediction.label ||
                              prediction.name ||
                              prediction.text ||
                              "Location"}
                          </p>

                          {(prediction.secondaryText ||
                            prediction.formattedAddress ||
                            prediction.displayName) && (
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/35">
                              {prediction.secondaryText ||
                                prediction.formattedAddress ||
                                prediction.displayName}
                            </p>
                          )}

                          {prediction.distanceMeters != null && (
                            <p className="mt-2 text-[10px] font-semibold text-cyan-400/70">
                              {formatDistance(prediction.distanceMeters)}
                            </p>
                          )}
                        </div>

                        <ChevronRight
                          size={18}
                          className="mt-2 shrink-0 text-white/20 transition group-hover:translate-x-1 group-hover:text-cyan-400"
                        />
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>
        )}

        {/* ======================================= */}
        {/* RECENT LOCATIONS */}
        {/* ======================================= */}

        {searchInput.trim().length < 2 && displayRecentLocations.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2 px-1">
              <Clock3 size={14} className="text-indigo-400" />

              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Recent locations
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
              {displayRecentLocations.map((location, index) => (
                <button
                  type="button"
                  key={`${location.latitude}-${location.longitude}-${index}`}
                  onClick={() => handleRecentLocation(location)}
                  className={`
                        group
                        flex
                        w-full
                        items-start
                        gap-3
                        p-4
                        text-left
                        transition
                        hover:bg-white/[0.05]
                        sm:p-5

                        ${
                          index !== displayRecentLocations.length - 1
                            ? "border-b border-white/[0.07]"
                            : ""
                        }
                      `}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    {getRecentIcon(location)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">
                      {location.label || "Recent Location"}
                    </p>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/35">
                      {location.formattedAddress ||
                        "Recently selected delivery location"}
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    className="mt-2 shrink-0 text-white/20 transition group-hover:translate-x-1 group-hover:text-indigo-400"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ======================================= */}
        {/* SEARCH HINT */}
        {/* ======================================= */}

        {searchInput.trim().length < 2 && (
          <section className="mt-8">
            <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Navigation size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    Find your exact delivery point
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-white/35">
                    Search for your building, street, colony, landmark or area.
                    You can adjust the exact pin on the map before confirming.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// ==================================================
// HELPERS
// ==================================================

function formatDistance(distanceMeters) {
  const meters = Number(distanceMeters);

  if (!Number.isFinite(meters)) {
    return "";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m away`;
  }

  return `${(meters / 1000).toFixed(1)} km away`;
}

function getRecentIcon(location) {
  const label = location?.label?.toLowerCase()?.trim() || "";

  if (label === "home") {
    return <Home size={18} />;
  }

  if (location?.source === "CURRENT") {
    return <LocateFixed size={18} />;
  }

  return <MapPin size={18} />;
}
