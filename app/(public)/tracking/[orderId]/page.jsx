"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
    Package,
    Archive,
    Truck,
    MapPin,
    CheckCircle,
    ArrowLeft,
    CreditCard,
    Clock3,
    Navigation,
    PackageCheck,
    UserRound,
    Star,
    Phone
} from "lucide-react";
import Loading from "@/components/Loading";

const TRACKING_STEPS = [
    { key: "ORDER_PLACED", label: "Order Placed", icon: Package },
    { key: "ORDER_CONFIRMED", label: "Order Confirmed", icon: CheckCircle },
    { key: "ORDER_PACKING", label: "Order Packing", icon: Archive },
    { key: "ORDER_PACKED", label: "Order Packed", icon: Archive },
    { key: "DRIVER_ASSIGNED", label: "Driver Assigned", icon: Truck },
    { key: "REACHED_SHOP", label: "Driver Reached Shop", icon: MapPin },
    { key: "PICKED_UP", label: "Order Picked Up", icon: Truck },
    { key: "OUT_FOR_DELIVERY", label: "Out For Delivery", icon: Truck },
    { key: "DELIVERY_INITIATED", label: "Delivery Initiated", icon: MapPin },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

const TRACK_INDEX = {
    ORDER_PLACED: 0,
    ORDER_CONFIRMED: 1,
    ORDER_PACKING: 2,
    ORDER_PACKED: 3,
    DRIVER_ASSIGNED: 4,
    REACHED_SHOP: 5,
    PICKED_UP: 6,
    OUT_FOR_DELIVERY: 7,
    DELIVERY_INITIATED: 8,
    DELIVERED: 9,
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

const calculateDistance = (
    driverLatitude,
    driverLongitude,
    customerLatitude,
    customerLongitude
) => {
    const earthRadiusKm = 6371;

    const latitudeDifference = toRadians(
        customerLatitude - driverLatitude
    );

    const longitudeDifference = toRadians(
        customerLongitude - driverLongitude
    );

    const firstLatitude = toRadians(driverLatitude);
    const secondLatitude = toRadians(customerLatitude);

    const value =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(firstLatitude) *
        Math.cos(secondLatitude) *
        Math.sin(longitudeDifference / 2) ** 2;

    const centralAngle =
        2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));

    return earthRadiusKm * centralAngle;
};

const calculateETA = (distanceKm) => {
    // Estimated average delivery speed inside a city
    const averageSpeedKmPerHour = 20;

    // Basic travel time
    const travelMinutes =
        (distanceKm / averageSpeedKmPerHour) * 60;

    // Add a small road/traffic adjustment because Haversine
    // calculates straight-line distance
    const adjustedMinutes = travelMinutes * 1.35;

    // Minimum ETA should not display 0 minutes
    return Math.max(1, Math.ceil(adjustedMinutes));
};

const formatArrivalTime = (minutes) => {
    const arrivalDate = new Date(
        Date.now() + minutes * 60 * 1000
    );

    return arrivalDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-white/50 bg-white/5 animate-pulse">Loading Live Map...</div>
});

const STATUS_MESSAGES = {
    ORDER_PLACED: {
        title: "Order Placed",
        description:
            "We've received your order successfully.",
    },

    ORDER_CONFIRMED: {
        title: "Order Confirmed",
        description:
            "The store has accepted your order.",
    },

    ORDER_PACKING: {
        title: "Preparing Your Order",
        description:
            "The store is packing your items carefully.",
    },

    ORDER_PACKED: {
        title: "Order Packed",
        description:
            "Your package is ready for pickup.",
    },

    DRIVER_ASSIGNED: {
        title: "Driver Assigned",
        description:
            "A delivery partner has been assigned.",
    },

    REACHED_SHOP: {
        title: "Driver Reached Store",
        description:
            "Driver has arrived at the pickup location.",
    },

    PICKED_UP: {
        title: "Order Picked Up",
        description:
            "Your order is now with the driver.",
    },

    OUT_FOR_DELIVERY: {
        title: "Out For Delivery",
        description:
            "Your driver is heading to your location.",
    },

    DELIVERY_INITIATED: {
        title: "Driver Near You",
        description:
            "Please keep your delivery OTP ready.",
    },

    DELIVERED: {
        title: "Delivered",
        description:
            "Enjoy your order!",
    },
};

export default function TrackingPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { getToken } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lineHeight, setLineHeight] = useState(0);

    const [nearbyMessage, setNearbyMessage] = useState("");
    const [hasShownNearby, setHasShownNearby] = useState(false);
    const [hasShownArrived, setHasShownArrived] = useState(false);

    const [animatedDriverLocation, setAnimatedDriverLocation] = useState(null);

    const animationRef = useRef(null);

    // Real-time driver location state
    const [driverLocation, setDriverLocation] = useState(null);
    const [deliveryInfo, setDeliveryInfo] = useState({
        distanceKm: null,
        etaMinutes: null,
        arrivalTime: null,
    });



    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

    // Fetch Order Data
    useEffect(() => {

        if (!orderId) return;



        let interval;

        const fetchOrderDetails = async (showLoader = false) => {

            try {

                if (showLoader) {
                    setLoading(true);
                }

                const token = await getToken();

                const { data } = await axios.get(
                    `/api/orders/${orderId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setOrder(data.order || data);

            } catch (error) {

                console.log(error);

            } finally {

                if (showLoader) {
                    setLoading(false);
                }

            }

        };

        // Initial Load
        fetchOrderDetails(true);

        // Refresh every 5 seconds
        interval = setInterval(() => {

            fetchOrderDetails(false);

        }, 5000);

        return () => clearInterval(interval);

    }, [orderId, getToken]);

    const animateDriverMarker = (
        startLocation,
        endLocation,
        duration = 4000
    ) => {

        if (!startLocation || !endLocation) {
            setAnimatedDriverLocation(endLocation);
            return;
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const startTime = performance.now();

        const startLat = Number(startLocation.lat);
        const startLng = Number(startLocation.lng);

        const endLat = Number(endLocation.lat);
        const endLng = Number(endLocation.lng);

        const animate = (currentTime) => {

            const elapsed = currentTime - startTime;

            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing instead of linear movement
            const easedProgress =
                progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const currentLat =
                startLat + (endLat - startLat) * easedProgress;

            const currentLng =
                startLng + (endLng - startLng) * easedProgress;

            setAnimatedDriverLocation({
                lat: currentLat,
                lng: currentLng
            });

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {

        if (
            driverLocation?.lat == null ||
            driverLocation?.lng == null
        ) {
            return;
        }

        const nextLocation = {
            lat: Number(driverLocation.lat),
            lng: Number(driverLocation.lng)
        };

        if (!animatedLocationRef.current) {
            animatedLocationRef.current = nextLocation;
            setAnimatedDriverLocation(nextLocation);
            return;
        }

        animateDriverMarker(
            animatedLocationRef.current,
            nextLocation,
            4000
        );

    }, [driverLocation?.lat, driverLocation?.lng]);

    useEffect(() => {

        if (!order?.driver?.id) return;

        if (!order.driver.latitude) return;

        setDriverLocation({
            lat: order.driver.latitude,
            lng: order.driver.longitude
        });

    }, [order]);


    const currentStep = order ? (TRACK_INDEX[order.status] ?? 0) : 0;

    const progressPercentage =
        (currentStep / (TRACKING_STEPS.length - 1)) * 100;

    const currentStatus =
        STATUS_MESSAGES[order?.status] || {
            title: "Loading...",
            description: "Fetching latest order status...",
        };

    const statusHistory = order?.statusHistory || {};

    const customerLocation =
        order?.address?.latitude != null &&
            order?.address?.longitude != null
            ? {
                lat: Number(order.address.latitude),
                lng: Number(order.address.longitude),
            }
            : null;

    useEffect(() => {
        if (!driverLocation || !customerLocation) {
            setDeliveryInfo({
                distanceKm: null,
                etaMinutes: null,
                arrivalTime: null,
            });

            return;
        }

        const driverLatitude = Number(driverLocation.lat);
        const driverLongitude = Number(driverLocation.lng);

        const customerLatitude = Number(customerLocation.lat);
        const customerLongitude = Number(customerLocation.lng);

        const coordinates = [
            driverLatitude,
            driverLongitude,
            customerLatitude,
            customerLongitude,
        ];

        const hasInvalidCoordinates = coordinates.some(
            (coordinate) => !Number.isFinite(coordinate)
        );

        if (hasInvalidCoordinates) {
            setDeliveryInfo({
                distanceKm: null,
                etaMinutes: null,
                arrivalTime: null,
            });

            return;
        }

        const distanceKm = calculateDistance(
            driverLatitude,
            driverLongitude,
            customerLatitude,
            customerLongitude
        );

        const etaMinutes = calculateETA(distanceKm);
        const arrivalTime = formatArrivalTime(etaMinutes);

        setDeliveryInfo({
            distanceKm,
            etaMinutes,
            arrivalTime,
        });
    }, [
        driverLocation?.lat,
        driverLocation?.lng,
        customerLocation?.lat,
        customerLocation?.lng,
    ]);

    useEffect(() => {

        if (!deliveryInfo?.distanceKm) return;

        const distanceMeters = deliveryInfo.distanceKm * 1000;

        if (
            distanceMeters <= 100 &&
            !hasShownArrived
        ) {
            toast.success("Your delivery partner has arrived.");
            setNearbyMessage("🚪 Your delivery partner has arrived.");
            setHasShownArrived(true);

        }

        else if (
            distanceMeters <= 500 &&
            !hasShownNearby
        ) {

            toast.success("Your delivery partner is nearby.");
            setNearbyMessage("🚚 Your delivery partner is nearby.");
            setHasShownNearby(true);

        }

    }, [
        deliveryInfo.distanceKm,
        hasShownNearby,
        hasShownArrived
    ]);

    useEffect(() => {
        if (!order) return;
        const timer = setTimeout(() => {
            setLineHeight(currentStep);
        }, 300);
        return () => clearTimeout(timer);
    }, [currentStep, order]);

    const getLineHeight = () => {
        const stepHeight = 100 / (TRACKING_STEPS.length - 1);
        return lineHeight * stepHeight;
    };

    if (loading) return <Loading />;
    if (!order) return <div className="min-h-screen flex items-center justify-center text-white">Order not found.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6 py-24">
            <div className="max-w-6xl mx-auto">

                {/* Header & Back Button */}
                <div className="mb-10">
                    <button
                        onClick={() => router.push('/orders')}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition mb-6 w-fit"
                    >
                        <ArrowLeft size={18} />
                        Back to Orders
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-wide">Track Your Order</h1>
                    <p className="text-white/50 mt-2">Order ID: {order.id}</p>
                </div>

                {/* Two Column Layout for Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Order Details & Driver */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* OTP Block - Visible ONLY when Delivery is Initiated */}
                        {order.status === "DELIVERY_INITIATED" && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse"></div>
                                <p className="text-xs text-emerald-300/70 mb-2 uppercase tracking-wider font-semibold">Delivery Verification Code</p>

                                <div className="text-3xl md:text-4xl font-bold tracking-[0.25em] text-white bg-black/40 py-4 rounded-xl border border-emerald-500/30">
                                    {order.deliveryOtp?.length === 6 ? order.deliveryOtp : "CHECK EMAIL"}
                                </div>

                                <p className="text-xs text-white/50 mt-3">Share this code with the driver to receive your package.</p>
                            </div>
                        )}

                        {/* Products Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                            <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-4">Items</h2>
                            <div className="space-y-4">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                width={40}
                                                height={40}
                                                className="object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm sm:text-base leading-tight">{item.product.name}</p>
                                            <p className="text-xs text-white/60 mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-emerald-400">
                                            {currency}{item.price * item.quantity}
                                        </p>
                                    </div>
                                ))}

                                {/* Order Summary */}
                                <div className="mt-6 border-t border-white/10 pt-4 space-y-3">

                                    <div className="flex justify-between text-white/60">
                                        <span>Products Total</span>
                                        <span>
                                            {currency}
                                            {(order.total - (order.deliveryFee || 0)).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-white/60">
                                        <span>Delivery Fee</span>
                                        <span>
                                            {currency}
                                            {(order.deliveryFee || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-lg font-bold text-emerald-400 border-t border-white/10 pt-3">
                                        <span>Total Paid</span>
                                        <span>
                                            {currency}
                                            {order.total.toFixed(2)}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                                <span className="text-white/60 flex items-center gap-2">
                                    <CreditCard size={16} /> Payment
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
                                    {order.paymentMethod}
                                </span>
                            </div>
                        </div>

                        {/* Premium Driver Card */}
                        {order.driver && order.driverAccepted && (
                            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white/5 to-emerald-500/10 p-6 shadow-2xl backdrop-blur-xl">

                                {/* Decorative glow */}
                                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
                                <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

                                <div className="relative">

                                    {/* Card Heading */}
                                    <div className="mb-6 flex items-center justify-between">

                                        <div className="flex items-center gap-2">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15">
                                                <Truck
                                                    size={18}
                                                    className="text-indigo-300"
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Delivery Partner
                                                </p>

                                                <p className="text-xs text-white/40">
                                                    Assigned to your order
                                                </p>
                                            </div>

                                        </div>

                                        {/* Online Badge */}
                                        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">

                                            <span className="relative flex h-2 w-2">

                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />

                                            </span>

                                            <span className="text-xs font-medium text-emerald-300">
                                                Online
                                            </span>

                                        </div>

                                    </div>

                                    {nearbyMessage && order.status !== "DELIVERED" && (

                                        <div className="mb-5 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 to-green-500/10 p-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">

                                                    🚚

                                                </div>

                                                <div>

                                                    <p className="font-semibold text-emerald-300">
                                                        {nearbyMessage}
                                                    </p>

                                                    <p className="text-sm text-white/60">
                                                        Please be ready to receive your order.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                    {/* Driver Profile */}
                                    <div className="flex items-center gap-4">

                                        {/* Avatar */}
                                        <div className="relative">

                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/30 to-emerald-500/20 shadow-lg">
                                                <UserRound
                                                    size={30}
                                                    className="text-white"
                                                />
                                            </div>

                                            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0f172a] bg-emerald-500" />

                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-xl font-bold text-white">
                                                {order.driver.name}
                                            </p>

                                            <p className="mt-1 text-sm text-white/45">
                                                Your delivery partner
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-2">

                                                {/* Rating */}
                                                <div className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">

                                                    <Star
                                                        size={13}
                                                        className="fill-amber-400 text-amber-400"
                                                    />

                                                    <span className="text-xs font-semibold text-amber-200">
                                                        {order.driver.totalRatings > 0
                                                            ? `${Number(order.driver.averageRating).toFixed(1)} (${order.driver.totalRatings})`
                                                            : "New"}
                                                    </span>

                                                </div>

                                                {/* Total deliveries */}
                                                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">

                                                    <PackageCheck
                                                        size={13}
                                                        className="text-indigo-300"
                                                    />

                                                    <span className="text-xs text-white/60">
                                                        {order.driver.totalDeliveries ?? 0} deliveries
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Current Delivery Information */}
                                    <div className="mt-6 grid grid-cols-2 gap-3">

                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                                            <div className="flex items-center gap-2 text-white/45">

                                                <Navigation size={14} />

                                                <span className="text-xs">
                                                    Current Status
                                                </span>

                                            </div>

                                            <p className="mt-2 text-sm font-semibold text-white">
                                                {currentStatus?.title || "Delivery in progress"}
                                            </p>

                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                                            <div className="flex items-center gap-2 text-white/45">

                                                <Clock3 size={14} />

                                                <span className="text-xs">
                                                    {order.status === "DELIVERED"
                                                        ? "Delivered At"
                                                        : "Arriving In"}
                                                </span>

                                            </div>

                                            <p className="mt-2 text-sm font-semibold text-emerald-400">

                                                {order.status === "DELIVERED"
                                                    ? new Date(order.updatedAt).toLocaleString()
                                                    : deliveryInfo.etaMinutes != null
                                                        ? `${deliveryInfo.etaMinutes} min`
                                                        : "Calculating..."}

                                            </p>

                                        </div>

                                    </div>

                                    {/* Call Button */}
                                    {order.driver.phone && (
                                        <a
                                            href={`tel:${order.driver.phone}`}
                                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-500/15 px-4 py-3.5 text-sm font-semibold text-indigo-200 transition duration-300 hover:border-indigo-400/50 hover:bg-indigo-500/25 hover:text-white"
                                        >

                                            <Phone size={17} />

                                            Call Delivery Partner

                                        </a>
                                    )}

                                    {/* Phone Number */}
                                    {order.driver.phone && (
                                        <p className="mt-3 text-center text-xs text-white/35">
                                            {order.driver.phone}
                                        </p>
                                    )}

                                </div>

                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Map & Timeline */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ETA CARD */}
                        {deliveryInfo.etaMinutes !== null &&
                            order.status !== "DELIVERED" && (
                                <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-white/5 to-indigo-500/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">

                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                        <div>
                                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-400">
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                                </span>

                                                Live delivery estimate
                                            </div>

                                            <h2 className="text-xl font-semibold text-white sm:text-2xl">
                                                Your order is on the way
                                            </h2>

                                            <p className="mt-2 text-sm text-white/50">
                                                ETA updates automatically as the driver moves.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">

                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                                                <p className="text-xs text-white/45">
                                                    Arriving in
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-emerald-400">
                                                    {deliveryInfo.etaMinutes} min
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                                                <p className="text-xs text-white/45">
                                                    Expected by
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-white">
                                                    {deliveryInfo.arrivalTime}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                                                <p className="text-xs text-white/45">
                                                    Distance
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-indigo-300">
                                                    {deliveryInfo.distanceKm < 1
                                                        ? `${Math.round(
                                                            deliveryInfo.distanceKm * 1000
                                                        )} m`
                                                        : `${deliveryInfo.distanceKm.toFixed(
                                                            1
                                                        )} km`}
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )}
                        {order.status !== "DELIVERED" && (
                            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-slate-900/60 to-indigo-500/10 p-7 backdrop-blur-xl shadow-2xl">

                                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                                    <div>

                                        <div className="mb-3 flex items-center gap-2">

                                            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>

                                            <span className="text-sm text-emerald-400 font-medium">
                                                Live Delivery Status
                                            </span>

                                        </div>

                                        <h2 className="text-3xl font-bold text-white">
                                            {currentStatus.title}
                                        </h2>

                                        <p className="mt-2 text-white/60">
                                            {currentStatus.description}
                                        </p>

                                    </div>



                                    <div className="grid grid-cols-3 gap-4">

                                        <div className="rounded-2xl bg-black/20 border border-white/10 p-4 text-center">

                                            <p className="text-xs text-white/50">
                                                Arriving In
                                            </p>

                                            <h3 className="mt-2 text-2xl font-bold text-emerald-400">

                                                {deliveryInfo.etaMinutes} min

                                            </h3>

                                        </div>

                                        <div className="rounded-2xl bg-black/20 border border-white/10 p-4 text-center">

                                            <p className="text-xs text-white/50">
                                                Distance
                                            </p>

                                            <h3 className="mt-2 text-2xl font-bold text-indigo-300">

                                                {deliveryInfo.distanceKm?.toFixed(1)} km

                                            </h3>

                                        </div>

                                        <div className="rounded-2xl bg-black/20 border border-white/10 p-4 text-center">

                                            <p className="text-xs text-white/50">
                                                Expected By
                                            </p>

                                            <h3 className="mt-2 text-xl font-bold text-white">

                                                {deliveryInfo.arrivalTime}

                                            </h3>

                                        </div>

                                    </div>

                                </div>


                                <div className="mt-7">

                                    <div className="flex justify-between text-xs text-white/50 mb-2">

                                        <span>Order Progress</span>

                                        <span>{Math.round(progressPercentage)}%</span>

                                    </div>

                                    <div className="h-3 overflow-hidden rounded-full bg-white/10">

                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${progressPercentage}%`,
                                            }}
                                            transition={{
                                                duration: 1.2,
                                                ease: "easeOut"
                                            }}
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500"
                                        />

                                    </div>

                                    <div className="mt-4 flex justify-between text-xs">

                                        <span
                                            className={
                                                currentStep >= 0
                                                    ? "text-emerald-400"
                                                    : "text-white/40"
                                            }
                                        >
                                            Placed
                                        </span>

                                        <span
                                            className={
                                                currentStep >= 3
                                                    ? "text-emerald-400"
                                                    : "text-white/40"
                                            }
                                        >
                                            Packed
                                        </span>

                                        <span
                                            className={
                                                currentStep >= 7
                                                    ? "text-emerald-400"
                                                    : "text-white/40"
                                            }
                                        >
                                            Out
                                        </span>

                                        <span
                                            className={
                                                currentStep >= 9
                                                    ? "text-emerald-400"
                                                    : "text-white/40"
                                            }
                                        >
                                            Delivered
                                        </span>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* LIVE MAP WIDGET */}
                        {driverLocation &&
                            customerLocation &&
                            order.status !== "DELIVERED" && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden backdrop-blur-xl shadow-2xl h-[350px] relative z-0">

                                    {customerLocation && (
                                        <LiveMap
                                            driverLocation={animatedDriverLocation || driverLocation}
                                            customerLocation={customerLocation}
                                        />
                                    )}

                                    {/* Floating Status Badge */}
                                    <div className="absolute top-5 left-5 bg-black/80 text-emerald-400 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg z-[1000]">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Live Navigation
                                    </div>
                                </div>
                            )}
                        {/* TIMELINE */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative">
                            <h2 className="text-lg font-semibold mb-8 border-b border-white/10 pb-4">Tracking Timeline</h2>

                            <div className="relative pl-6">
                                {/* Static Base Line */}
                                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-white/10"></div>

                                {/* Animated Progress Line */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${getLineHeight()}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute left-4 top-0 w-[2px] bg-emerald-500"
                                />

                                {/* Timeline Steps */}
                                {TRACKING_STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const isCompleted = index < currentStep;
                                    const isActive = index === currentStep;
                                    const updatedAt = statusHistory[step.key];
                                    const formattedDate = formatDateTime(updatedAt);

                                    return (
                                        <div key={step.key} className="flex gap-6 mb-8 last:mb-0 relative">
                                            {/* Icon */}
                                            <div
                                                className={`
                          w-10 h-10 flex items-center justify-center rounded-full border-2 relative z-10 -ml-5 shadow-lg bg-[#020617]
                          ${isCompleted ? "border-emerald-400 text-emerald-400" : ""}
                          ${isActive ? "border-indigo-400 text-indigo-400 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]" : ""}
                          ${!isCompleted && !isActive ? "border-white/20 text-white/40" : ""}
                        `}
                                            >
                                                <Icon size={18} />
                                            </div>

                                            {/* Text Context */}
                                            <div className="pt-2">
                                                <p className={`text-base font-semibold tracking-wide
                                                    ${isCompleted || isActive ? "text-white" : "text-white/40"}`}>
                                                    {step.label}
                                                </p>
                                                <p className={`text-sm mt-1 ${isCompleted || isActive ? "text-white/60" : "text-white/30"}`}>
                                                    {formattedDate || (isCompleted ? "Completed" : isActive ? "In Progress..." : "Pending update...")}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}