"use client";

import Link from "next/link";
import {
    Truck,
    Package,
    CheckCircle,
    User,
    IndianRupee,
    Bike,
    CalendarDays,
    Clock3,
    MapPin,
    Navigation,
    Star,
    Activity,
    Wallet,
    ChevronRight,
    Power,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
        return "Good morning";
    }

    if (currentHour < 17) {
        return "Good afternoon";
    }

    return "Good evening";
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
};

export default function DriverDashboard() {
    const router = useRouter();

    /*
     * Authentication and dashboard data
     */
    const [driver, setDriver] = useState(null);
    const [dashboard, setDashboard] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [dashboardLoading, setDashboardLoading] = useState(false);

    /*
     * Driver availability
     *
     * This currently controls the UI.
     * Later, it can be connected to an API that updates:
     * Driver.isOnline and Driver.isAvailable.
     */
    const [isOnline, setIsOnline] = useState(true);
    const [isUpdatingAvailability, setIsUpdatingAvailability] =
        useState(false);

    /*
     * Incoming-order state
     */
    const [incomingOrder, setIncomingOrder] = useState(null);
    const [ignoredOrders, setIgnoredOrders] = useState([]);
    const [countdown, setCountdown] = useState(60);

    /*
     * Earnings filters
     */
    const [month, setMonth] = useState(
        new Date().getMonth() + 1
    );

    const [year, setYear] = useState(
        new Date().getFullYear()
    );

    const [selectedDate, setSelectedDate] = useState("");

    /*
     * Refs prevent stale state inside polling intervals.
     */
    const audioRef = useRef(null);
    const incomingOrderRef = useRef(null);
    const ignoredOrdersRef = useRef([]);
    const countdownTimerRef = useRef(null);
    const pollingInProgressRef = useRef(false);

    /*
     * Keep the incoming-order ref synchronized.
     */
    useEffect(() => {
        incomingOrderRef.current = incomingOrder;
    }, [incomingOrder]);

    /*
     * Keep the ignored-orders ref synchronized.
     */
    useEffect(() => {
        ignoredOrdersRef.current = ignoredOrders;
    }, [ignoredOrders]);

    /*
     * Initialise notification audio.
     */
    useEffect(() => {
        audioRef.current = new Audio(
            "/sounds/delivery.mp3"
        );

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        };
    }, []);

    /*
     * Read the logged-in driver safely from localStorage.
     */
    useEffect(() => {
        const storedDriver =
            localStorage.getItem("driver");

        if (!storedDriver) {
            router.replace("/driver/login");
            return;
        }

        try {
            const parsedDriver =
                JSON.parse(storedDriver);

            if (!parsedDriver?.id) {
                throw new Error(
                    "Invalid driver session"
                );
            }

            setDriver(parsedDriver);

            setIsOnline(
                parsedDriver.isOnline ??
                parsedDriver.isAvailable ??
                true
            );

            setIsLoading(false);
        } catch (error) {
            console.error(
                "Invalid stored driver:",
                error
            );

            localStorage.removeItem("driver");
            router.replace("/driver/login");
        }
    }, [router]);

    /*
     * Play notification audio while an order request is visible.
     */
    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        if (incomingOrder) {
            audio.loop = true;

            audio.play().catch((error) => {
                console.log(
                    "Notification audio was blocked:",
                    error
                );
            });
        } else {
            audio.pause();
            audio.currentTime = 0;
            audio.loop = false;
        }
    }, [incomingOrder]);

    /*
     * Dashboard API
     */
    const fetchDashboard = useCallback(
        async ({
            showLoader = false,
        } = {}) => {
            if (!driver?.id) return;

            try {
                if (showLoader) {
                    setDashboardLoading(true);
                }

                const { data } = await axios.get(
                    "/api/driver/dashboard",
                    {
                        params: {
                            driverId: driver.id,
                            month,
                            year,
                            date:
                                selectedDate ||
                                undefined,
                        },
                    }
                );

                setDashboard(
                    data.dashboardData ||
                    data.dashboard ||
                    data
                );
            } catch (error) {
                console.error(
                    "Failed to fetch driver dashboard:",
                    error
                );

                if (showLoader) {
                    toast.error(
                        error?.response?.data?.error ||
                        "Unable to load dashboard"
                    );
                }
            } finally {
                if (showLoader) {
                    setDashboardLoading(false);
                }
            }
        },
        [
            driver?.id,
            month,
            year,
            selectedDate,
        ]
    );

    /*
     * Ask the backend to assign any waiting orders.
     */
    useEffect(() => {
        if (!driver?.id) return;

        const assignPendingOrders = async () => {
            try {
                await axios.post(
                    "/api/driver/assign-pending-orders"
                );
            } catch (error) {
                console.error(
                    "Failed to assign pending orders:",
                    error
                );
            }
        };

        assignPendingOrders();
    }, [driver?.id]);

    /*
     * Fetch dashboard after login and whenever filters change.
     */
    useEffect(() => {
        if (!driver?.id) return;

        fetchDashboard({
            showLoader: !dashboard,
        });
    }, [
        driver?.id,
        month,
        year,
        selectedDate,
        fetchDashboard,
    ]);

    /*
     * Refresh analytics every 30 seconds.
     */
    useEffect(() => {
        if (!driver?.id) return;

        const dashboardInterval = setInterval(() => {
            fetchDashboard();
        }, 30000);

        return () => {
            clearInterval(dashboardInterval);
        };
    }, [driver?.id, fetchDashboard]);

    /*
     * Add an order to the temporary ignored list.
     *
     * It prevents the same popup from repeatedly opening while
     * the backend is processing acceptance or reassignment.
     */
    const addIgnoredOrder = useCallback(
        (orderId) => {
            if (!orderId) return;

            if (
                ignoredOrdersRef.current.includes(
                    orderId
                )
            ) {
                return;
            }

            const updatedOrders = [
                ...ignoredOrdersRef.current,
                orderId,
            ];

            ignoredOrdersRef.current =
                updatedOrders;

            setIgnoredOrders(updatedOrders);
        },
        []
    );

    /*
     * Remove an order from the temporary ignored list.
     */
    const removeIgnoredOrder = useCallback(
        (orderId) => {
            const updatedOrders =
                ignoredOrdersRef.current.filter(
                    (id) => id !== orderId
                );

            ignoredOrdersRef.current =
                updatedOrders;

            setIgnoredOrders(updatedOrders);
        },
        []
    );

    /*
     * Find nearby pending orders.
     */
    const checkPendingOrder = useCallback(
        async () => {
            if (
                !driver?.id ||
                !isOnline ||
                incomingOrderRef.current ||
                pollingInProgressRef.current
            ) {
                return;
            }

            if (!navigator.geolocation) {
                console.error(
                    "Geolocation is not supported"
                );
                return;
            }

            pollingInProgressRef.current = true;

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const {
                        latitude,
                        longitude,
                    } = position.coords;

                    try {
                        const { data } =
                            await axios.get(
                                "/api/driver/pending-order",
                                {
                                    params: {
                                        driverId:
                                            driver.id,
                                        lat: latitude,
                                        lng: longitude,
                                    },
                                }
                            );

                        const pendingOrder =
                            data.order;

                        if (
                            pendingOrder &&
                            !incomingOrderRef.current &&
                            !ignoredOrdersRef.current.includes(
                                pendingOrder.id
                            )
                        ) {
                            incomingOrderRef.current =
                                pendingOrder;

                            setIncomingOrder(
                                pendingOrder
                            );

                            addIgnoredOrder(
                                pendingOrder.id
                            );

                            setCountdown(60);

                            toast.success(
                                "New delivery request nearby"
                            );
                        }
                    } catch (error) {
                        console.error(
                            "Failed to fetch pending order:",
                            error
                        );
                    } finally {
                        pollingInProgressRef.current =
                            false;
                    }
                },
                (error) => {
                    console.error(
                        "Location access failed:",
                        error
                    );

                    pollingInProgressRef.current =
                        false;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 5000,
                }
            );
        },
        [
            driver?.id,
            isOnline,
            addIgnoredOrder,
        ]
    );

    /*
     * Check for an order immediately and then every five seconds.
     */
    useEffect(() => {
        if (!driver?.id || !isOnline) return;

        checkPendingOrder();

        const orderPollingInterval = setInterval(
            checkPendingOrder,
            5000
        );

        return () => {
            clearInterval(
                orderPollingInterval
            );
        };
    }, [
        driver?.id,
        isOnline,
        checkPendingOrder,
    ]);

    /*
     * Accept the incoming order.
     */
    const handleAccept = async () => {
        const selectedOrder =
            incomingOrderRef.current;

        if (!selectedOrder?.id) return;

        try {
            await axios.post(
                "/api/driver/accept-order",
                {
                    orderId: selectedOrder.id,
                }
            );

            removeIgnoredOrder(
                selectedOrder.id
            );

            incomingOrderRef.current = null;
            setIncomingOrder(null);
            setCountdown(60);

            toast.success("Order accepted");

            await fetchDashboard();

            router.push("/driver/orders");
        } catch (error) {
            console.error(
                "Failed to accept order:",
                error
            );

            toast.error(
                error?.response?.data?.error ||
                "Failed to accept order"
            );
        }
    };

    /*
     * Decline or expire the incoming order.
     */
    const handleDecline = useCallback(
        async ({
            expired = false,
        } = {}) => {
            const selectedOrder =
                incomingOrderRef.current;

            if (!selectedOrder?.id) return;

            const orderId =
                selectedOrder.id;

            const currentDriverId =
                selectedOrder.driverId ||
                driver?.id;

            incomingOrderRef.current = null;
            setIncomingOrder(null);
            setCountdown(60);

            try {
                await axios.post(
                    "/api/driver/reassign-order",
                    {
                        orderId,
                        currentDriverId,
                    }
                );

                toast[
                    expired ? "error" : "success"
                ](
                    expired
                        ? "Order request expired"
                        : "Order reassigned"
                );

                await fetchDashboard();
            } catch (error) {
                console.error(
                    "Failed to reassign order:",
                    error
                );

                /*
                 * Allow the order to appear again if reassignment failed.
                 */
                removeIgnoredOrder(orderId);

                toast.error(
                    error?.response?.data?.error ||
                    "Failed to reassign order"
                );
            }
        },
        [
            driver?.id,
            fetchDashboard,
            removeIgnoredOrder,
        ]
    );

    /*
     * Incoming-order countdown.
     */
    useEffect(() => {
        if (!incomingOrder) {
            if (countdownTimerRef.current) {
                clearInterval(
                    countdownTimerRef.current
                );

                countdownTimerRef.current =
                    null;
            }

            return;
        }

        countdownTimerRef.current =
            setInterval(() => {
                setCountdown((currentValue) => {
                    if (currentValue <= 1) {
                        clearInterval(
                            countdownTimerRef.current
                        );

                        countdownTimerRef.current =
                            null;

                        handleDecline({
                            expired: true,
                        });

                        return 0;
                    }

                    return currentValue - 1;
                });
            }, 1000);

        return () => {
            if (countdownTimerRef.current) {
                clearInterval(
                    countdownTimerRef.current
                );

                countdownTimerRef.current =
                    null;
            }
        };
    }, [
        incomingOrder,
        handleDecline,
    ]);

    /*
     * UI availability toggle.
     *
     * Currently this changes the dashboard state and polling.
     * Replace the commented API call with your availability API
     * when that route is ready.
     */
    const handleAvailabilityToggle =
        async () => {
            if (isUpdatingAvailability) return;

            const nextOnlineState = !isOnline;

            try {
                setIsUpdatingAvailability(true);

                /*
                await axios.patch(
                    "/api/driver/availability",
                    {
                        driverId: driver.id,
                        isOnline: nextOnlineState,
                        isAvailable: nextOnlineState,
                    }
                );
                */

                setIsOnline(nextOnlineState);

                const updatedDriver = {
                    ...driver,
                    isOnline: nextOnlineState,
                    isAvailable:
                        nextOnlineState,
                };

                setDriver(updatedDriver);

                localStorage.setItem(
                    "driver",
                    JSON.stringify(updatedDriver)
                );

                toast.success(
                    nextOnlineState
                        ? "You are now online"
                        : "You are now offline"
                );
            } catch (error) {
                console.error(
                    "Failed to update availability:",
                    error
                );

                toast.error(
                    error?.response?.data?.error ||
                    "Unable to update availability"
                );
            } finally {
                setIsUpdatingAvailability(false);
            }
        };

    /*
     * Derived dashboard values
     */
    const greeting = useMemo(
        () => getGreeting(),
        []
    );

    const activeOrder =
        dashboard?.activeOrder ||
        dashboard?.currentOrder ||
        null;

    const driverName =
        dashboard?.driver?.name ||
        driver?.name ||
        "Delivery Partner";

    const driverVehicle =
        dashboard?.driver?.vehicle ||
        driver?.vehicle ||
        "Delivery vehicle";

    const vehicleNumber =
        dashboard?.driver?.vehicleNo ||
        driver?.vehicleNo ||
        null;

    const averageRating = Number(
        dashboard?.driver?.averageRating ??
        driver?.averageRating ??
        0
    );

    const totalRatings = Number(
        dashboard?.driver?.totalRatings ??
        driver?.totalRatings ??
        0
    );

    const countdownProgress = Math.max(
        0,
        Math.min(100, (countdown / 60) * 100)
    );

    const dashboardStats = [
        {
            title: "Today’s Earnings",
            value: formatCurrency(
                dashboard?.todayRevenue
            ),
            description: "Total earned today",
            icon: IndianRupee,
        },
        {
            title: "Today’s Deliveries",
            value:
                dashboard?.todayDeliveries ||
                0,
            description:
                "Successfully completed",
            icon: CheckCircle,
        },
        {
            title: "Yesterday",
            value: formatCurrency(
                dashboard?.yesterdayRevenue
            ),
            description:
                "Previous day earnings",
            icon: CalendarDays,
        },
        {
            title: "Selected Period",
            value: formatCurrency(
                dashboard?.selectedRevenue
            ),
            description:
                selectedDate ||
                `${MONTHS[month - 1]} ${year}`,
            icon: Wallet,
        },
    ];

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-[#f4f7fb] pb-24 text-slate-900">

            {/* Premium Driver Header */}
            <header className="relative overflow-hidden rounded-b-[2.5rem] bg-slate-950 text-white shadow-2xl">

                {/* Decorative background */}
                <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10">

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                        {/* Driver identity */}
                        <div className="flex items-center gap-4">

                            <div className="relative shrink-0">

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 shadow-xl sm:h-20 sm:w-20">

                                    <User
                                        size={34}
                                        className="text-white"
                                    />

                                </div>

                                <span
                                    className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-slate-950 ${isOnline
                                        ? "bg-emerald-500"
                                        : "bg-slate-500"
                                        }`}
                                />

                            </div>

                            <div className="min-w-0">

                                <p className="text-sm text-slate-400">
                                    {greeting}
                                </p>

                                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                                    {driverName} 👋
                                </h1>

                                <div className="mt-3 flex flex-wrap items-center gap-2">

                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${isOnline
                                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                            : "border-white/10 bg-white/5 text-slate-400"
                                            }`}
                                    >
                                        <span className="relative flex h-2 w-2">

                                            {isOnline && (
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                            )}

                                            <span
                                                className={`relative inline-flex h-2 w-2 rounded-full ${isOnline
                                                    ? "bg-emerald-400"
                                                    : "bg-slate-500"
                                                    }`}
                                            />

                                        </span>

                                        {isOnline
                                            ? "Online and available"
                                            : "Currently offline"}
                                    </span>

                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">

                                        <Bike size={14} />

                                        {driverVehicle}

                                        {vehicleNumber
                                            ? ` • ${vehicleNumber}`
                                            : ""}

                                    </span>

                                    {totalRatings > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200">

                                            <Star
                                                size={13}
                                                className="fill-amber-400 text-amber-400"
                                            />

                                            {averageRating.toFixed(
                                                1
                                            )}

                                            <span className="text-amber-100/50">
                                                ({totalRatings})
                                            </span>

                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* Earnings and availability */}
                        <div className="flex flex-col gap-3 sm:flex-row">

                            <div className="min-w-[220px] rounded-3xl border border-white/10 bg-white/[0.06] px-6 py-5 backdrop-blur-xl">

                                <div className="flex items-center justify-between gap-4">

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Today’s earnings
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-emerald-400">
                                            {formatCurrency(
                                                dashboard?.todayRevenue
                                            )}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {dashboard?.todayDeliveries ||
                                                0}{" "}
                                            deliveries completed
                                        </p>
                                    </div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">

                                        <Wallet size={23} />

                                    </div>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleAvailabilityToggle
                                }
                                disabled={
                                    isUpdatingAvailability
                                }
                                className={`flex min-h-[96px] min-w-[180px] items-center justify-center gap-3 rounded-3xl border px-6 py-5 font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${isOnline
                                    ? "border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/20"
                                    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                                    }`}
                            >
                                <Power size={21} />

                                {isUpdatingAvailability
                                    ? "Updating..."
                                    : isOnline
                                        ? "Go Offline"
                                        : "Go Online"}

                            </button>

                        </div>

                    </div>

                </div>

            </header>

            {/* ---------------- Incoming Order Popup ---------------- */}

            {incomingOrder && (
                <div className="fixed inset-x-4 top-4 z-[999] mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-indigo-100 animate-in slide-in-from-top duration-500">

                    {/* Header */}

                    <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-5 text-white">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs uppercase tracking-widest text-indigo-100">
                                    New Delivery Request
                                </p>

                                <h2 className="mt-1 text-xl font-bold">
                                    {incomingOrder.store?.name}
                                </h2>

                            </div>

                            <div className="rounded-xl bg-white/20 px-3 py-2">

                                <p className="text-lg font-bold">
                                    {countdown}s
                                </p>

                            </div>

                        </div>

                        {/* Countdown */}

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">

                            <div
                                className="h-full rounded-full bg-white transition-all duration-1000"
                                style={{
                                    width: `${countdownProgress}%`,
                                }}
                            />

                        </div>

                    </div>

                    <div className="space-y-5 p-6">

                        <div className="grid grid-cols-3 gap-3">

                            <div className="rounded-2xl bg-slate-50 p-4 text-center">

                                <Navigation
                                    className="mx-auto mb-2 text-indigo-600"
                                    size={20}
                                />

                                <p className="text-[10px] uppercase text-slate-400">
                                    Store
                                </p>

                                <p className="mt-1 font-bold">
                                    {incomingOrder.distanceToStore || "--"} km
                                </p>

                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4 text-center">

                                <MapPin
                                    className="mx-auto mb-2 text-red-500"
                                    size={20}
                                />

                                <p className="text-[10px] uppercase text-slate-400">
                                    Customer
                                </p>

                                <p className="mt-1 font-bold">
                                    {incomingOrder.distanceToCustomer || "--"} km
                                </p>

                            </div>

                            <div className="rounded-2xl bg-emerald-50 p-4 text-center">

                                <IndianRupee
                                    className="mx-auto mb-2 text-emerald-600"
                                    size={20}
                                />

                                <p className="text-[10px] uppercase text-emerald-600">
                                    Earn
                                </p>

                                <p className="mt-1 font-bold text-emerald-700">
                                    ₹{incomingOrder.driverFee || 0}
                                </p>

                            </div>

                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">

                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Delivery Address
                            </p>

                            <p className="mt-2 font-semibold text-slate-700">
                                {incomingOrder.address?.name ||
                                    "Customer Location"}
                            </p>

                        </div>

                        <div className="flex gap-3">

                            <button
                                onClick={handleAccept}
                                className="flex-1 rounded-2xl bg-emerald-600 py-4 font-bold text-white transition hover:bg-emerald-700"
                            >
                                Accept
                            </button>

                            <button
                                onClick={() =>
                                    handleDecline()
                                }
                                className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                                Decline
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* ---------------- Dashboard Body ---------------- */}

            <main className="mx-auto -mt-12 max-w-7xl space-y-8 px-4">

                {/* Current Delivery */}

                <section className="rounded-[30px] bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-8 text-white shadow-2xl">

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <p className="text-xs uppercase tracking-[0.3em] text-indigo-100">

                                CURRENT DELIVERY

                            </p>

                            <h2 className="mt-3 text-3xl font-bold">

                                {activeOrder
                                    ? `Order #${activeOrder.id
                                        .slice(-6)
                                        .toUpperCase()}`
                                    : "No Active Delivery"}

                            </h2>

                            <p className="mt-3 text-indigo-100">

                                {activeOrder
                                    ? activeOrder.store?.name
                                    : "You're online and ready to receive new deliveries."}

                            </p>

                            {activeOrder && (

                                <div className="mt-5 flex flex-wrap gap-3">

                                    <span className="rounded-full bg-white/20 px-4 py-2 text-sm">

                                        {activeOrder.status}

                                    </span>

                                    <span className="rounded-full bg-white/20 px-4 py-2 text-sm">

                                        {activeOrder.address?.city}

                                    </span>

                                </div>

                            )}

                        </div>

                        {activeOrder ? (

                            <Link
                                href="/driver/orders"
                                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-indigo-700 shadow-lg hover:bg-indigo-50"
                            >
                                Continue Delivery

                                <ChevronRight size={18} />

                            </Link>

                        ) : (

                            <div className="rounded-2xl bg-white/10 px-6 py-4">

                                <Clock3 className="mb-2" />

                                Waiting for Orders

                            </div>

                        )}

                    </div>

                </section>

                {/* Statistics */}

                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    {dashboardStats.map(
                        (
                            {
                                title,
                                value,
                                description,
                                icon: Icon,
                            },
                            index
                        ) => (

                            <div
                                key={index}
                                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-xs uppercase tracking-wider text-slate-400">

                                            {title}

                                        </p>

                                        <h3 className="mt-3 text-3xl font-bold text-slate-900">

                                            {value}

                                        </h3>

                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">

                                        <Icon
                                            size={26}
                                            className="text-indigo-600"
                                        />

                                    </div>

                                </div>

                                <p className="mt-5 text-sm text-slate-400">

                                    {description}

                                </p>

                            </div>

                        )
                    )}

                </section>
                {/* ---------------- Weekly Analytics ---------------- */}

                <section className="grid gap-6 xl:grid-cols-3">

                    {/* Weekly Earnings */}

                    <div className="xl:col-span-2 rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                                    Weekly Analytics
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                    Earnings Overview
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Revenue earned during the last 7 days.
                                </p>

                            </div>

                            <div className="rounded-2xl bg-indigo-50 px-5 py-3">

                                <p className="text-xs uppercase text-indigo-500">
                                    Total
                                </p>

                                <h3 className="mt-1 text-2xl font-bold text-indigo-700">
                                    {formatCurrency(dashboard?.selectedRevenue)}
                                </h3>

                            </div>

                        </div>

                        <div className="mt-8 h-72">

                            {dashboard?.weeklyData?.length ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <BarChart
                                        data={dashboard.weeklyData}
                                    >

                                        <XAxis
                                            dataKey="day"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 12,
                                            }}
                                        />

                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{
                                                fill: "#94a3b8",
                                                fontSize: 11,
                                            }}
                                        />

                                        <Tooltip
                                            cursor={{
                                                fill: "#f8fafc",
                                            }}
                                            contentStyle={{
                                                borderRadius: "18px",
                                                border: "none",
                                                boxShadow:
                                                    "0 15px 35px rgba(0,0,0,.08)",
                                            }}
                                        />

                                        <Bar
                                            dataKey="revenue"
                                            radius={[8, 8, 0, 0]}
                                        >

                                            {dashboard.weeklyData.map(
                                                (
                                                    item,
                                                    index
                                                ) => (

                                                    <Cell
                                                        key={index}
                                                        fill={
                                                            item.revenue > 0
                                                                ? "#4f46e5"
                                                                : "#e2e8f0"
                                                        }
                                                    />

                                                )
                                            )}

                                        </Bar>

                                    </BarChart>

                                </ResponsiveContainer>

                            ) : (

                                <div className="flex h-full items-center justify-center text-slate-400">

                                    No earnings available

                                </div>

                            )}

                        </div>

                    </div>

                    {/* Driver Performance */}

                    <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">

                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                            Performance
                        </p>

                        <h2 className="mt-2 text-2xl font-bold">
                            Driver Score
                        </h2>

                        <div className="mt-8 space-y-6">

                            <div className="rounded-2xl bg-amber-50 p-5">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="text-xs uppercase text-amber-500">
                                            Rating
                                        </p>

                                        <h3 className="mt-2 text-3xl font-bold text-amber-600">

                                            {averageRating.toFixed(1)}

                                        </h3>

                                    </div>

                                    <Star
                                        className="fill-amber-400 text-amber-400"
                                        size={34}
                                    />

                                </div>

                            </div>

                            <div className="rounded-2xl bg-emerald-50 p-5">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="text-xs uppercase text-emerald-500">
                                            Deliveries
                                        </p>

                                        <h3 className="mt-2 text-3xl font-bold text-emerald-600">

                                            {dashboard?.todayDeliveries || 0}

                                        </h3>

                                    </div>

                                    <Truck
                                        size={34}
                                        className="text-emerald-600"
                                    />

                                </div>

                            </div>

                            <div className="rounded-2xl bg-indigo-50 p-5">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="text-xs uppercase text-indigo-500">
                                            Revenue
                                        </p>

                                        <h3 className="mt-2 text-3xl font-bold text-indigo-700">

                                            {formatCurrency(
                                                dashboard?.selectedRevenue
                                            )}

                                        </h3>

                                    </div>

                                    <Wallet
                                        size={34}
                                        className="text-indigo-600"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ---------------- Filters ---------------- */}

                <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                                Analytics Filters
                            </p>

                            <h2 className="mt-2 text-2xl font-bold">
                                View Earnings
                            </h2>

                        </div>

                        <div className="grid w-full gap-3 md:grid-cols-3 lg:w-auto">

                            <select
                                value={month}
                                onChange={(e) =>
                                    setMonth(Number(e.target.value))
                                }
                                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
                            >

                                {MONTHS.map((m, index) => (

                                    <option
                                        key={index}
                                        value={index + 1}
                                    >
                                        {m}
                                    </option>

                                ))}

                            </select>

                            <select
                                value={year}
                                onChange={(e) =>
                                    setYear(Number(e.target.value))
                                }
                                className="rounded-xl border border-slate-300 bg-white px-4 py-3"
                            >

                                {[2024, 2025, 2026].map(
                                    (y) => (

                                        <option key={y}>
                                            {y}
                                        </option>

                                    )
                                )}

                            </select>

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className="rounded-xl border border-slate-300 px-4 py-3"
                            />

                        </div>

                    </div>

                </section>
                {/* ---------------- Quick Actions ---------------- */}

                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    <Link
                        href="/driver/orders"
                        className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Package size={28} />
                        </div>

                        <h3 className="mt-5 text-xl font-bold">
                            Active Orders
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Continue your current delivery or view pending deliveries.
                        </p>

                        <div className="mt-6 flex items-center text-indigo-600 font-semibold">
                            Open
                            <ChevronRight
                                size={18}
                                className="ml-1 transition group-hover:translate-x-1"
                            />
                        </div>
                    </Link>

                    <Link
                        href="/driver/profile"
                        className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                            <User size={28} />
                        </div>

                        <h3 className="mt-5 text-xl font-bold">
                            My Profile
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            View your information, vehicle details and ratings.
                        </p>

                        <div className="mt-6 flex items-center text-purple-600 font-semibold">
                            View
                            <ChevronRight
                                size={18}
                                className="ml-1 transition group-hover:translate-x-1"
                            />
                        </div>
                    </Link>

                    <Link
                        href="/driver/earnings"
                        className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <Wallet size={28} />
                        </div>

                        <h3 className="mt-5 text-xl font-bold">
                            Earnings
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Track your daily, weekly and monthly income.
                        </p>

                        <div className="mt-6 flex items-center text-emerald-600 font-semibold">
                            View
                            <ChevronRight
                                size={18}
                                className="ml-1 transition group-hover:translate-x-1"
                            />
                        </div>
                    </Link>

                    <Link
                        href="/driver/history"
                        className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                            <Clock3 size={28} />
                        </div>

                        <h3 className="mt-5 text-xl font-bold">
                            Delivery History
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Review all completed deliveries and earnings.
                        </p>

                        <div className="mt-6 flex items-center text-orange-600 font-semibold">
                            Open
                            <ChevronRight
                                size={18}
                                className="ml-1 transition group-hover:translate-x-1"
                            />
                        </div>
                    </Link>

                </section>

                {/* ---------------- Today's Summary ---------------- */}

                <section className="grid gap-6 lg:grid-cols-2">

                    <div className="rounded-[30px] bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white shadow-xl">

                        <p className="text-xs uppercase tracking-[0.25em] text-emerald-100">
                            Today's Summary
                        </p>

                        <h2 className="mt-3 text-3xl font-bold">
                            Keep Going 🚀
                        </h2>

                        <div className="mt-8 grid grid-cols-2 gap-5">

                            <div>

                                <p className="text-sm text-emerald-100">
                                    Deliveries
                                </p>

                                <h3 className="mt-1 text-4xl font-bold">
                                    {dashboard?.todayDeliveries || 0}
                                </h3>

                            </div>

                            <div>

                                <p className="text-sm text-emerald-100">
                                    Earnings
                                </p>

                                <h3 className="mt-1 text-4xl font-bold">
                                    {formatCurrency(dashboard?.todayRevenue)}
                                </h3>

                            </div>

                        </div>

                    </div>

                    <div className="rounded-[30px] bg-white p-8 shadow-sm border border-slate-200">

                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                            Driver Status
                        </p>

                        <h2 className="mt-3 text-3xl font-bold">
                            You're doing great 👏
                        </h2>

                        <div className="mt-8 space-y-6">

                            <div className="flex justify-between">

                                <span className="text-slate-500">
                                    Current Status
                                </span>

                                <span className="font-semibold text-emerald-600">
                                    {isOnline ? "Online" : "Offline"}
                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-slate-500">
                                    Driver Rating
                                </span>

                                <span className="font-semibold">
                                    ⭐ {averageRating.toFixed(1)}
                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-slate-500">
                                    Total Ratings
                                </span>

                                <span className="font-semibold">
                                    {totalRatings}
                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-slate-500">
                                    Selected Revenue
                                </span>

                                <span className="font-semibold text-indigo-600">
                                    {formatCurrency(dashboard?.selectedRevenue)}
                                </span>

                            </div>

                        </div>

                    </div>

                </section>

                {/* ---------------- Footer ---------------- */}

                <footer className="pb-12 pt-6">

                    <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-6 shadow-sm">

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>

                                <h3 className="text-xl font-bold text-slate-900">
                                    Drive Safe ❤️
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Thank you for delivering orders and making customers happy.
                                </p>

                            </div>

                            <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-600">

                                Dashboard refreshed every 30 seconds

                            </div>

                        </div>

                    </div>

                </footer>

            </main>

        </div>

    );
}