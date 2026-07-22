"use client";

import { useEffect, useState } from "react";
import {
    Download,
    Loader2,
    LogOut,
    Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDriver } from "@/context/DriverContext";

export default function DriverNavbar() {
    const router = useRouter();

    const [isTWA, setIsTWA] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const {
        driver,
        isOnline,
        activeOrder,
        toggleStatus,
        statusUpdating,
    } = useDriver();

    /*
     * Detect whether the driver app is opened as:
     * 1. Installed PWA
     * 2. Android Trusted Web Activity
     *
     * The APK download button will be hidden in those cases.
     */
    useEffect(() => {
        const standalone =
            window.matchMedia(
                "(display-mode: standalone)"
            ).matches ||
            window.navigator.standalone === true;

        const twa =
            document.referrer.includes(
                "android-app://"
            );

        setIsTWA(standalone || twa);
    }, []);

    /*
     * Send the driver's live location every 30 seconds.
     *
     * Location updates are stopped when:
     * - driver data has not loaded
     * - driver is offline
     *
     * When there is an active order, the driver remains online,
     * so location tracking continues automatically.
     */
    useEffect(() => {
        if (!driver?.id || !isOnline) {
            return;
        }

        if (!navigator.geolocation) {
            console.error(
                "Geolocation is not supported by this device."
            );
            return;
        }

        let locationRequestRunning = false;

        const updateLocation = () => {
            if (locationRequestRunning) {
                return;
            }

            locationRequestRunning = true;

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        await axios.post(
                            "/api/driver/update-location",
                            {
                                driverId: driver.id,
                                latitude:
                                    position.coords
                                        .latitude,
                                longitude:
                                    position.coords
                                        .longitude,
                            }
                        );
                    } catch (error) {
                        console.error(
                            "Failed to update driver location:",
                            error
                        );
                    } finally {
                        locationRequestRunning =
                            false;
                    }
                },
                (error) => {
                    console.error(
                        "Unable to access driver location:",
                        error
                    );

                    locationRequestRunning =
                        false;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 5000,
                }
            );
        };

        updateLocation();

        const interval = setInterval(
            updateLocation,
            30000
        );

        return () => {
            clearInterval(interval);
        };
    }, [driver?.id, isOnline]);

    /*
     * Logout driver and clear the stored session.
     */
    const logout = async () => {
        if (isLoggingOut) {
            return;
        }

        try {
            setIsLoggingOut(true);

            if (driver?.id) {
                await axios.post(
                    "/api/driver/logout",
                    {
                        driverId: driver.id,
                    }
                );
            }

            localStorage.removeItem("driver");
            localStorage.removeItem("driverId");
            localStorage.removeItem(
                "driverSession"
            );

            toast.success(
                "Logged out successfully"
            );

            router.replace("/driver/login");
            router.refresh();
        } catch (error) {
            console.error(
                "Driver logout failed:",
                error
            );

            toast.error(
                error?.response?.data?.error ||
                "Unable to logout"
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const firstName =
        driver?.name?.trim()?.split(/\s+/)?.[0] ||
        "Driver";

    const orderNumber = activeOrder?.id
        ? activeOrder.id
            .slice(-6)
            .toUpperCase()
        : null;

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/95 text-white shadow-lg backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-3 sm:px-6">
                <div className="flex h-16 items-center justify-between gap-3">

                    {/* Logo */}
                    <div className="flex shrink-0 items-center">
                        <Link
                            href="/driver"
                            aria-label="Driver dashboard"
                            className="flex items-center"
                        >
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -180,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    rotate: 0,
                                }}
                                transition={{
                                    duration: 0.8,
                                    type: "spring",
                                    stiffness: 100,
                                }}
                                className="relative h-14 w-14 sm:h-16 sm:w-16"
                            >
                                <Image
                                    src="/driver.png"
                                    alt="Nandurbar Bazar Driver"
                                    fill
                                    sizes="64px"
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>
                        </Link>
                    </div>

                    {/* Right section */}
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">

                        {/* Active Delivery */}
                        {activeOrder && (
                            <Link
                                href="/driver/orders"
                                className="hidden items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-orange-200 transition hover:bg-orange-400/20 md:flex"
                            >
                                <Truck size={15} />

                                <span className="text-xs font-semibold">
                                    Active Delivery
                                    {orderNumber
                                        ? ` #${orderNumber}`
                                        : ""}
                                </span>
                            </Link>
                        )}

                        {/* APK download */}
                        {!isTWA && (
                            <a
                                href="/apk/nandurbar-bazar-driver.apk"
                                download
                                className="hidden items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 lg:flex"
                            >
                                <Download size={16} />

                                <span>
                                    Download App
                                </span>
                            </a>
                        )}

                        {/* Online/offline toggle */}
                        <button
                            type="button"
                            onClick={toggleStatus}
                            disabled={
                                statusUpdating ||
                                !driver?.id
                            }
                            title={
                                isOnline &&
                                    activeOrder
                                    ? "Complete your active delivery before going offline."
                                    : isOnline
                                        ? "Go offline"
                                        : "Go online"
                            }
                            className={`flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 ${isOnline
                                    ? activeOrder
                                        ? "border-orange-300 bg-orange-50 text-orange-700"
                                        : "border-green-200 bg-green-50 text-green-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                        >
                            {statusUpdating ? (
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                />
                            ) : (
                                <span
                                    className={`h-2 w-2 rounded-full ${isOnline
                                            ? activeOrder
                                                ? "bg-orange-500"
                                                : "animate-pulse bg-green-500"
                                            : "bg-red-500"
                                        }`}
                                />
                            )}

                            <span className="text-xs font-semibold sm:text-sm">
                                {statusUpdating
                                    ? "Updating..."
                                    : activeOrder &&
                                        isOnline
                                        ? "On Delivery"
                                        : isOnline
                                            ? "Online"
                                            : "Offline"}
                            </span>
                        </button>

                        {/* Driver profile */}
                        <Link
                            href="/driver/profile"
                            className="flex min-w-0 items-center gap-2 rounded-xl p-1 transition hover:bg-white/5 sm:gap-3"
                        >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/70 shadow-md sm:h-11 sm:w-11">
                                <Image
                                    src={
                                        driver?.profilePhoto ||
                                        "/default-avatar.png"
                                    }
                                    alt={firstName}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="hidden min-w-0 sm:block">
                                <p className="text-xs text-slate-400">
                                    Welcome
                                </p>

                                <p className="max-w-28 truncate text-sm font-semibold text-white">
                                    {firstName}
                                </p>
                            </div>
                        </Link>

                        {/* Logout */}
                        <button
                            type="button"
                            onClick={logout}
                            disabled={isLoggingOut}
                            className="flex items-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                        >
                            {isLoggingOut ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <LogOut size={16} />
                            )}

                            <span className="hidden text-sm font-semibold sm:block">
                                {isLoggingOut
                                    ? "Logging out..."
                                    : "Logout"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile active-delivery strip */}
                {activeOrder && (
                    <Link
                        href="/driver/orders"
                        className="mb-2 flex items-center justify-between rounded-xl border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-orange-100 md:hidden"
                    >
                        <div className="flex items-center gap-2">
                            <Truck size={15} />

                            <span className="text-xs font-semibold">
                                Active delivery
                                {orderNumber
                                    ? ` #${orderNumber}`
                                    : ""}
                            </span>
                        </div>

                        <span className="text-xs font-medium">
                            Open
                        </span>
                    </Link>
                )}
            </div>
        </nav>
    );
}