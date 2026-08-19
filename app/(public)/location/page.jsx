"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Crosshair,
  Home,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  Star,
  BriefcaseBusiness,
  MapPinned,
} from "lucide-react";

import { useCustomerLocation } from "@/context/CustomerLocationContext";

export default function LocationPage() {
  const router = useRouter();

  const { user, isLoaded } = useUser();

  const {
    customerLocation,
    selectDeliveryLocation,
    useCurrentLocation,
    locationLoading,
    serviceable,
    serviceRadius,
  } = useCustomerLocation();

  const [addresses, setAddresses] = useState([]);

  const [addressesLoading, setAddressesLoading] = useState(true);

  const [selectedAddressLoading, setSelectedAddressLoading] = useState(null);

  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD SAVED ADDRESSES
  // ==========================================

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setAddressesLoading(false);
      return;
    }

    loadAddresses();
  }, [isLoaded, user]);

  const loadAddresses = async () => {
    try {
      setAddressesLoading(true);

      setError("");

      const { data } = await axios.get("/api/address");

      setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
    } catch (error) {
      console.error("LOAD ADDRESSES ERROR:", error);

      setError(
        error?.response?.data?.error || "Unable to load your saved addresses.",
      );
    } finally {
      setAddressesLoading(false);
    }
  };

  // ==========================================
  // FORMAT ADDRESS
  // ==========================================

  const formatAddress = (address) => {
    return [
      address.street,
      address.landmark,
      address.city,
      address.state,
      address.zip,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // ==========================================
  // ADDRESS ICON
  // ==========================================

  const getAddressIcon = (label = "") => {
    const value = label.toLowerCase();

    if (value === "home") {
      return <Home size={20} />;
    }

    if (value === "work" || value === "office") {
      return <BriefcaseBusiness size={20} />;
    }

    return <MapPin size={20} />;
  };

  // ==========================================
  // CHECK SELECTED ADDRESS
  // ==========================================

  const isAddressSelected = (address) => {
    if (!customerLocation) return false;

    if (
      customerLocation.addressId &&
      customerLocation.addressId === address.id
    ) {
      return true;
    }

    return false;
  };

  // ==========================================
  // SELECT SAVED ADDRESS
  // ==========================================

  const handleSelectAddress = async (address) => {
    try {
      if (address.latitude == null || address.longitude == null) {
        setError(
          "This saved address does not have a map location yet. Please update its location.",
        );

        return;
      }

      setSelectedAddressLoading(address.id);

      setError("");

      /*
       * This updates lastUsedAt and gives us
       * the normalized location object.
       */
      const { data } = await axios.patch("/api/address/use", {
        addressId: address.id,
      });

      /*
       * This updates the global location context,
       * localStorage and nearby stores.
       */
      await selectDeliveryLocation(data.location);

      /*
       * Refresh addresses so lastUsedAt ordering
       * is reflected immediately.
       */
      await loadAddresses();

      /*
       * Return user to previous page.
       */
      router.back();
    } catch (error) {
      console.error("SELECT ADDRESS ERROR:", error);

      setError(
        error?.response?.data?.error ||
          error?.message ||
          "Unable to select this address.",
      );
    } finally {
      setSelectedAddressLoading(null);
    }
  };

  // ==========================================
  // USE CURRENT LOCATION
  // ==========================================

  const handleCurrentLocation = async () => {
    try {
      setCurrentLocationLoading(true);

      setError("");

      await useCurrentLocation();

      /*
       * Later we will replace this with:
       *
       * /location/map
       *
       * so the customer can confirm the exact
       * pin and area before selecting.
       *
       * For now the current GPS coordinates
       * become the active delivery location.
       */

      router.back();
    } catch (error) {
      console.error("CURRENT LOCATION ERROR:", error);

      setError(error?.message || "Unable to use your current location.");
    } finally {
      setCurrentLocationLoading(false);
    }
  };

  // ==========================================
  // RECENT SAVED ADDRESSES
  // ==========================================

  const recentAddresses = useMemo(() => {
    return addresses
      .filter((address) => address.lastUsedAt)
      .slice()
      .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))
      .slice(0, 3);
  }, [addresses]);

  // ==========================================
  // OTHER SAVED ADDRESSES
  // ==========================================

  const otherAddresses = useMemo(() => {
    const recentIds = new Set(recentAddresses.map((address) => address.id));

    return addresses.filter((address) => !recentIds.has(address.id));
  }, [addresses, recentAddresses]);

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black sm:text-xl">
              Select delivery location
            </h1>

            <p className="mt-0.5 text-xs text-white/40">
              Choose where you want your order delivered
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:px-6">
        {/* ================================= */}
        {/* CURRENT ACTIVE LOCATION */}
        {/* ================================= */}

        {customerLocation && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07]"
          >
            <div className="flex gap-3 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <MapPinned size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-white">
                    {customerLocation.label || "Selected Location"}
                  </p>

                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                    Active
                  </span>
                </div>

                {customerLocation.formattedAddress ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/45 sm:text-sm">
                    {customerLocation.formattedAddress}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-white/40">
                    Current delivery location
                  </p>
                )}

                {!locationLoading && (
                  <p
                    className={`mt-2 text-[10px] font-semibold ${
                      serviceable ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {serviceable
                      ? `Delivery available within ${serviceRadius} km`
                      : `No partner stores within ${serviceRadius} km`}
                  </p>
                )}
              </div>

              <Check size={18} className="mt-1 shrink-0 text-emerald-400" />
            </div>
          </motion.div>
        )}

        {/* ================================= */}
        {/* SEARCH ADDRESS */}
        {/* ================================= */}

        <button
          type="button"
          onClick={() => router.push("/location/search")}
          className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.07]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Search size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-white">Search for an address</p>

            <p className="mt-0.5 text-xs text-white/35">
              Search area, street or landmark
            </p>
          </div>

          <ChevronRight
            size={19}
            className="text-white/25 transition group-hover:translate-x-1 group-hover:text-cyan-400"
          />
        </button>

        {/* ================================= */}
        {/* CURRENT LOCATION */}
        {/* ================================= */}

        <button
          type="button"
          disabled={currentLocationLoading}
          onClick={handleCurrentLocation}
          className="group mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-emerald-400/30 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            {currentLocationLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <LocateFixed size={20} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-emerald-400">Use current location</p>

            <p className="mt-0.5 text-xs text-white/35">
              Use your device&apos;s precise location
            </p>
          </div>

          <Crosshair size={18} className="text-emerald-400/60" />
        </button>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

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
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================= */}
        {/* NOT LOGGED IN */}
        {/* ================================= */}

        {isLoaded && !user && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center">
            <MapPin size={28} className="mx-auto text-white/30" />

            <h2 className="mt-3 font-bold text-white">
              Login to view saved addresses
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-white/35">
              You can still use your current location or search for another
              delivery location.
            </p>
          </div>
        )}

        {/* ================================= */}
        {/* ADDRESS LOADING */}
        {/* ================================= */}

        {user && addressesLoading && (
          <div className="mt-10">
            <div className="mb-4 h-3 w-32 animate-pulse rounded bg-white/10" />

            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]"
                />
              ))}
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* RECENT ADDRESSES */}
        {/* ================================= */}

        {user && !addressesLoading && recentAddresses.length > 0 && (
          <section className="mt-9">
            <div className="mb-4 flex items-center gap-2">
              <Navigation size={14} className="text-cyan-400" />

              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                Recently used
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
              {recentAddresses.map((address, index) => (
                <AddressRow
                  key={address.id}
                  address={address}
                  selected={isAddressSelected(address)}
                  loading={selectedAddressLoading === address.id}
                  formatAddress={formatAddress}
                  getAddressIcon={getAddressIcon}
                  onSelect={handleSelectAddress}
                  showDivider={index !== recentAddresses.length - 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* ================================= */}
        {/* SAVED ADDRESSES */}
        {/* ================================= */}

        {user && !addressesLoading && otherAddresses.length > 0 && (
          <section className="mt-9">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-indigo-400" />

              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                Saved addresses
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
              {otherAddresses.map((address, index) => (
                <AddressRow
                  key={address.id}
                  address={address}
                  selected={isAddressSelected(address)}
                  loading={selectedAddressLoading === address.id}
                  formatAddress={formatAddress}
                  getAddressIcon={getAddressIcon}
                  onSelect={handleSelectAddress}
                  showDivider={index !== otherAddresses.length - 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* ================================= */}
        {/* NO SAVED ADDRESS */}
        {/* ================================= */}

        {user && !addressesLoading && addresses.length === 0 && (
          <div className="mt-9 rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <MapPin size={24} className="text-white/30" />
            </div>

            <h3 className="mt-4 font-bold text-white">
              No saved addresses yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/35">
              Search for an address or use your current location to start.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// ==================================================
// ADDRESS ROW
// ==================================================

function AddressRow({
  address,
  selected,
  loading,
  formatAddress,
  getAddressIcon,
  onSelect,
  showDivider,
}) {
  const hasCoordinates = address.latitude != null && address.longitude != null;

  return (
    <div
      className={`relative ${
        showDivider ? "border-b border-white/[0.07]" : ""
      }`}
    >
      <button
        type="button"
        disabled={loading}
        onClick={() => onSelect(address)}
        className="group flex w-full items-start gap-3 p-4 text-left transition hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-60 sm:p-5"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            selected
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-white/[0.06] text-white/50"
          }`}
        >
          {loading ? (
            <Loader2 size={19} className="animate-spin" />
          ) : (
            getAddressIcon(address.label)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-white">{address.label || "Address"}</p>

            {address.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
                <Star size={9} />
                Default
              </span>
            )}

            {selected && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                Selected
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40 sm:text-sm">
            {formatAddress(address)}
          </p>

          {!hasCoordinates && (
            <p className="mt-2 text-[10px] font-semibold text-amber-400">
              Location pin required
            </p>
          )}
        </div>

        {selected ? (
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
            <Check size={14} strokeWidth={3} />
          </div>
        ) : (
          <ChevronRight
            size={18}
            className="mt-2 shrink-0 text-white/20 transition group-hover:translate-x-1 group-hover:text-white/50"
          />
        )}
      </button>
    </div>
  );
}
