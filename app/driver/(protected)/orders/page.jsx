"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import DeliveryMap from "@/components/DeliveryMap";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Package,
  X,
  ShieldCheck,
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useDriver } from "@/context/DriverContext";

const SWIPE_THRESHOLD = 110;

const NEXT_STATUS = {
  DRIVER_ASSIGNED: {
    next: "REACHED_SHOP",
    label: "Swipe after reaching the store",
    releaseLabel: "Release to mark reached",
    tone: "indigo",
  },

  REACHED_SHOP: {
    next: "PICKED_UP",
    label: "Swipe after collecting all items",
    releaseLabel: "Release to confirm pickup",
    tone: "emerald",
  },

  PICKED_UP: {
    next: "OUT_FOR_DELIVERY",
    label: "Swipe to start customer journey",
    releaseLabel: "Release to start journey",
    tone: "orange",
  },

  OUT_FOR_DELIVERY: {
    next: "DELIVERY_INITIATED",
    label: "Swipe after reaching customer",
    releaseLabel: "Release to confirm arrival",
    tone: "green",
  },
};

const SWIPE_STYLES = {
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",

  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",

  orange: "border-orange-200 bg-orange-50 text-orange-700",

  green: "border-green-200 bg-green-50 text-green-700",
};

function SwipeAction({
  label,
  releaseLabel,
  tone = "indigo",
  disabled = false,
  loading = false,
  onComplete,
}) {
  const x = useMotionValue(0);

  const progressOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

  const handleDragEnd = async (_, info) => {
    if (disabled || loading) {
      x.set(0);
      return;
    }

    if (info.offset.x >= SWIPE_THRESHOLD) {
      try {
        await onComplete?.();
      } finally {
        x.set(0);
      }

      return;
    }

    x.set(0);
  };

  return (
    <div
      className={`relative h-16 overflow-hidden rounded-2xl border ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70"
          : SWIPE_STYLES[tone] || SWIPE_STYLES.indigo
      }`}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1 px-16 text-center text-sm font-semibold">
        <span>{loading ? "Updating status..." : label}</span>

        {!loading && <ChevronRight size={17} />}
      </div>

      <motion.div
        style={{
          opacity: progressOpacity,
        }}
        className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold text-emerald-700"
      >
        {releaseLabel}
      </motion.div>

      <motion.button
        type="button"
        drag={disabled || loading ? false : "x"}
        dragConstraints={{
          left: 0,
          right: 220,
        }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={handleDragEnd}
        disabled={disabled || loading}
        className="absolute left-1.5 top-1.5 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-white text-emerald-600 shadow-lg disabled:cursor-not-allowed"
      >
        <ArrowRight size={22} />
      </motion.button>
    </div>
  );
}

export default function DriverOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpOrder, setOtpOrder] = useState(null);
  const [otp, setOtp] = useState("");

  const [incomingOrder, setIncomingOrder] = useState(null);
  const [ignoredOrders, setIgnoredOrders] = useState([]);
  const [countdown, setCountdown] = useState(60);
  const [driverLocation, setDriverLocation] = useState(null);

  const ignoredOrdersRef = useRef([]);
  const audioRef = useRef(null);
  const router = useRouter();
  const { driver, isOnline, activeOrder, refreshDriver, setActiveOrder } =
    useDriver();
  const incomingOrderRef = useRef(null);
  const pollingRef = useRef(false);
  const notificationShownRef = useRef(new Set());

  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const getDriverId = () => {
    const driver = JSON.parse(localStorage.getItem("driver"));
    return driver?.id || null;
  };

  useEffect(() => {
    // Initialize audio object once
    audioRef.current = new Audio("/sounds/delivery.mp3");

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (incomingOrder) {
      // Start looping sound when order arrives
      audioRef.current.loop = true;
      audioRef.current
        .play()
        .catch((e) => console.log("Audio playback failed:", e));
    } else {
      // Stop and reset sound when order is gone
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.loop = false;
    }
  }, [incomingOrder]);

  const handleAccept = async () => {
    const selectedOrder = incomingOrderRef.current || incomingOrder;

    if (!selectedOrder?.id) return;

    try {
      await axios.post("/api/driver/accept-order", {
        orderId: selectedOrder.id,
      });

      incomingOrderRef.current = null;
      setIncomingOrder(null);
      setCountdown(60);

      const nextIgnoredOrders = ignoredOrdersRef.current.filter(
        (id) => id !== selectedOrder.id,
      );

      ignoredOrdersRef.current = nextIgnoredOrders;

      setIgnoredOrders(nextIgnoredOrders);

      toast.success("Order accepted");

      await refreshDriver();
      await fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to accept order");
    }
  };

  const handleDecline = async () => {
    const selectedOrder = incomingOrderRef.current || incomingOrder;

    if (!selectedOrder?.id) return;

    incomingOrderRef.current = null;
    setIncomingOrder(null);
    setCountdown(60);

    try {
      await axios.post("/api/driver/reassign-order", {
        orderId: selectedOrder.id,
        currentDriverId: selectedOrder.driverId || driver?.id,
      });

      toast.success("Order declined and reassigned");

      await refreshDriver();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to reassign");
    }
  };

  useEffect(() => {
    if (!driver?.id || !isOnline || !navigator.geolocation) {
      setDriverLocation(null);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude);

        const longitude = Number(position.coords.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return;
        }

        setDriverLocation([latitude, longitude]);

        try {
          await axios.post("/api/driver/update-location", {
            driverId: driver.id,
            latitude,
            longitude,
          });
        } catch (error) {
          console.error("Location update failed:", error);
        }
      },
      (error) => {
        console.error("Location access failed:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [driver?.id, isOnline]);

  const fetchOrders = async () => {
    try {
      const driverId = getDriverId();
      if (!driverId) {
        toast.error("Driver not logged in");
        setIsLoading(false);
        return;
      }

      const { data } = await axios.get(
        `/api/driver/orders?driverId=${driverId}`,
      );
      setOrders(data.orders);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!driver?.id || !isOnline || activeOrder) {
      return;
    }

    const checkPendingOrder = async () => {
      if (pollingRef.current || incomingOrderRef.current) {
        return;
      }

      pollingRef.current = true;

      try {
        let latitude = driverLocation?.[0];

        let longitude = driverLocation?.[1];

        if (latitude == null || longitude == null) {
          if (!navigator.geolocation) {
            return;
          }

          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000,
            });
          });

          latitude = Number(position.coords.latitude);

          longitude = Number(position.coords.longitude);
        }

        const { data } = await axios.get("/api/driver/pending-order", {
          params: {
            driverId: driver.id,
            lat: latitude,
            lng: longitude,
          },
        });

        const pendingOrder = data.order;

        if (
          pendingOrder &&
          !incomingOrderRef.current &&
          !ignoredOrdersRef.current.includes(pendingOrder.id)
        ) {
          incomingOrderRef.current = pendingOrder;

          setIncomingOrder(pendingOrder);

          const nextIgnoredOrders = [
            ...ignoredOrdersRef.current,
            pendingOrder.id,
          ];

          ignoredOrdersRef.current = nextIgnoredOrders;

          setIgnoredOrders(nextIgnoredOrders);

          setCountdown(60);

          showNewOrderNotification(pendingOrder);

          toast.success("New Delivery Request");
        }
      } catch (error) {
        console.error("Pending order check failed:", error);
      } finally {
        pollingRef.current = false;
      }
    };

    checkPendingOrder();

    const interval = setInterval(checkPendingOrder, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    driver?.id,
    isOnline,
    activeOrder,
    driverLocation?.[0],
    driverLocation?.[1],
  ]);

  useEffect(() => {
    if (!incomingOrder) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Order request expired");
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingOrder]);

  const showNewOrderNotification = (order) => {
    if (!order?.id) return;

    if (notificationShownRef.current.has(order.id)) {
      return;
    }

    notificationShownRef.current.add(order.id);

    if ("Notification" in window && Notification.permission === "granted") {
      const distance = Number(order.distanceToStore);

      new Notification("New Delivery Request", {
        body: `${order.store?.name || "Nearby store"}${
          Number.isFinite(distance) ? ` • ${distance.toFixed(1)} km away` : ""
        }`,
        icon: "/driver.png",
        tag: order.id,
      });
    }
  };

  useEffect(() => {
    incomingOrderRef.current = incomingOrder;
  }, [incomingOrder]);

  useEffect(() => {
    ignoredOrdersRef.current = ignoredOrders;
  }, [ignoredOrders]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    try {
      await axios.post("/api/driver/verify-otp", {
        orderId: otpOrder.id,
        otp,
        driverId: getDriverId(),
      });

      toast.success("Order Delivered Successfully! 🎉");
      setShowOtpModal(false);
      setOtp("");
      setOtpOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Verification failed");
    }
  };

  const updateStatus = async (orderId, status) => {
    if (statusUpdatingId) return;

    try {
      setStatusUpdatingId(orderId);

      const driverId = getDriverId();

      await axios.post("/api/driver/update-order-status", {
        orderId,
        status,
        driverId,
      });

      if (status === "DELIVERY_INITIATED") {
        await axios.post("/api/order/send-otp", {
          orderId,
        });

        toast.success("OTP sent to customer");
      } else {
        toast.success("Status updated");
      }

      await fetchOrders();
      await refreshDriver();
    } catch (error) {
      console.error(error?.response?.data);

      toast.error(error?.response?.data?.error || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      DRIVER_ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
      REACHED_SHOP: "bg-indigo-100 text-indigo-700 border-indigo-200",
      PICKED_UP: "bg-orange-100 text-orange-700 border-orange-200",
      OUT_FOR_DELIVERY: "bg-yellow-100 text-yellow-700 border-yellow-200",
      DELIVERY_INITIATED: "bg-green-100 text-green-700 border-green-200",
    };
    const formatStatus = (s) => s.replace(/_/g, " ");
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}
      >
        {formatStatus(status)}
      </span>
    );
  };

  // NEW: Helper to highlight the last 4 digits of the order ID
  const HighlightOrderId = ({ id }) => {
    if (!id) return null;
    const start = id.slice(0, -4);
    const end = id.slice(-4);
    return (
      <div className="flex items-center text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200 mb-4 shadow-sm">
        <span>#{start}</span>
        <span className="text-indigo-700 font-bold text-base tracking-widest bg-indigo-100 px-1 rounded ml-[1px]">
          {end}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-4xl">
          <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Delivery Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your active assignments
              </p>
            </div>

            <button
              type="button"
              onClick={fetchOrders}
              className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 sm:w-auto sm:rounded-full sm:p-3"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>

              <span className="sm:hidden">Refresh Orders</span>
            </button>
          </header>

          {incomingOrder && (
            <div className="fixed inset-x-3 top-3 z-[100] mx-auto max-h-[calc(100vh-1.5rem)] w-auto max-w-md overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:top-6 sm:w-96 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                </div>
                <h2 className="font-bold text-lg text-gray-900">
                  New Delivery Request
                </h2>
              </div>

              {/* Inserted Highlighted Order ID here */}
              <HighlightOrderId id={incomingOrder.id} />

              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Store</span>
                  <span
                    className="font-medium text-gray-900 text-right truncate max-w-[150px]"
                    title={incomingOrder.store?.name}
                  >
                    {incomingOrder.store?.name}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Distance to Store</span>
                  <span className="font-semibold text-blue-600">
                    {incomingOrder.distanceToStore &&
                    !isNaN(parseFloat(incomingOrder.distanceToStore))
                      ? `${parseFloat(incomingOrder.distanceToStore).toFixed(2)} km`
                      : "Calculating..."}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Store to Customer</span>
                  <span className="font-semibold text-blue-600">
                    {incomingOrder.distanceToCustomer &&
                    !isNaN(parseFloat(incomingOrder.distanceToCustomer))
                      ? `${parseFloat(incomingOrder.distanceToCustomer).toFixed(2)} km`
                      : "Calculating..."}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Time to Accept
                  </span>
                  <span
                    className={`font-bold ${countdown <= 10 ? "text-red-600 animate-pulse" : "text-gray-900"}`}
                  >
                    {countdown}s
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <SwipeAction
                  label="Swipe right to accept"
                  releaseLabel="Release to accept"
                  tone="emerald"
                  onComplete={handleAccept}
                />

                <motion.div
                  drag="x"
                  dragConstraints={{
                    left: -180,
                    right: 0,
                  }}
                  dragElastic={0.05}
                  onDragEnd={(_, info) => {
                    if (info.offset.x <= -100) {
                      handleDecline();
                    }
                  }}
                  className="flex h-14 cursor-grab items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-sm font-semibold text-red-700 active:cursor-grabbing"
                >
                  <X size={18} />
                  Swipe left to decline
                </motion.div>

                <p className="text-center text-[11px] text-slate-400">
                  Swipe carefully to accept or decline.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium">
                  Loading orders...
                </p>
              </div>
            )}

            {!isLoading && orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="relative flex justify-center items-center w-20 h-20 mb-6">
                  <div className="absolute animate-ping inline-flex h-full w-full rounded-full bg-blue-200 opacity-60"></div>
                  <div className="relative inline-flex rounded-full h-10 w-10 bg-blue-600 items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Searching for new orders...
                </h2>
                <p className="text-gray-500 max-w-sm">
                  Stay on this screen. New delivery assignments will appear here
                  automatically once you are matched.
                </p>
              </div>
            )}
            {!isLoading &&
              orders.map((order) => {
                const totalProducts = order.orderItems?.length || 0;

                const totalQuantity =
                  order.orderItems?.reduce(
                    (sum, item) => sum + Number(item.quantity || 0),
                    0,
                  ) || 0;

                const statusAction = NEXT_STATUS[order.status];

                const reachedStore =
                  order.distanceToStore != null &&
                  Number(order.distanceToStore) <= 0.1;

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-5 md:p-6"
                  >
                    {driverLocation && (
                      <DeliveryMap
                        driverPos={driverLocation}
                        destinationPos={
                          ["DRIVER_ASSIGNED", "REACHED_SHOP"].includes(
                            order.status,
                          )
                            ? [order.store?.latitude, order.store?.longitude]
                            : [
                                order.address?.latitude,
                                order.address?.longitude,
                              ]
                        }
                        // Logic to switch icon color
                        isGoingToShop={[
                          "DRIVER_ASSIGNED",
                          "REACHED_SHOP",
                        ].includes(order.status)}
                      />
                    )}

                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                      <div>
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="text-lg font-bold text-gray-900">
                            {order.user?.name}
                          </h2>
                          <StatusBadge status={order.status} />
                        </div>

                        {/* Inserted Highlighted Order ID here */}
                        <HighlightOrderId id={order.id} />

                        <p className="text-xl font-bold text-gray-900 mb-4">
                          ₹{order.total}
                        </p>
                        {/* Order Items Summary */}
                        <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200">
                          <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                Order Items
                              </h3>

                              <p className="text-xs text-gray-500">
                                Verify all products before pickup
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 sm:px-3 sm:text-xs">
                                {totalProducts} products
                              </span>

                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:px-3 sm:text-xs">
                                {totalQuantity} units
                              </span>
                            </div>
                          </div>

                          <div className="divide-y divide-gray-100">
                            {order.orderItems?.length > 0 ? (
                              order.orderItems.map((item) => {
                                const itemTotal =
                                  Number(item.price || 0) *
                                  Number(item.quantity || 0);

                                return (
                                  <div
                                    key={`${order.id}-${item.productId}`}
                                    className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center sm:p-4"
                                  >
                                    {/* Product Image */}
                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:h-14 sm:w-14">
                                      {item.product?.images?.[0] ? (
                                        <Image
                                          src={item.product.images[0]}
                                          alt={item.product?.name || "Product"}
                                          fill
                                          sizes="56px"
                                          className="object-contain p-1"
                                        />
                                      ) : (
                                        <Package
                                          size={22}
                                          className="text-gray-400"
                                        />
                                      )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate font-semibold text-gray-900">
                                        {item.product?.name ||
                                          "Product unavailable"}
                                      </p>

                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                        <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                                          Qty: {item.quantity}
                                        </span>

                                        <span className="text-gray-500">
                                          ₹{Number(item.price || 0).toFixed(2)}{" "}
                                          each
                                        </span>
                                      </div>

                                      {item.product?.category && (
                                        <p className="mt-1 text-xs text-gray-400">
                                          {item.product.category}
                                        </p>
                                      )}
                                    </div>

                                    {/* Item Total */}
                                    <div className="col-span-2 flex items-center justify-between border-t border-gray-100 pt-2 text-right sm:col-span-1 sm:block sm:border-0 sm:pt-0">
                                      <p className="text-xs text-gray-400 sm:hidden">
                                        Item total
                                      </p>

                                      <div>
                                        <p className="text-sm font-bold text-gray-900">
                                          ₹{itemTotal.toFixed(2)}
                                        </p>

                                        <p className="hidden text-[11px] text-gray-400 sm:block">
                                          Item total
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-5 text-center text-sm text-gray-500">
                                Product details are unavailable.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600 sm:p-4">
                          <svg
                            className="w-5 h-5 text-gray-400 mt-0.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                          </svg>
                          <div>
                            {["DRIVER_ASSIGNED", "REACHED_SHOP"].includes(
                              order.status,
                            ) ? (
                              <>
                                <p className="font-medium text-gray-900">
                                  Store: {order.store?.name}
                                </p>
                                <p>{order.store?.address}</p>
                                <p className="text-blue-600 font-semibold">
                                  {order.distanceToStore
                                    ? `${order.distanceToStore.toFixed(2)} km away`
                                    : "Calculating distance..."}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium text-gray-900">
                                  {order.address?.street}
                                </p>
                                <p>
                                  {order.address?.city},{order.address?.state}
                                </p>
                                <p className="text-blue-600 font-semibold">
                                  {order.distanceToCustomer
                                    ? `${order.distanceToCustomer.toFixed(2)} km away`
                                    : "Calculating distance..."}
                                </p>
                                <p className="mt-1 font-medium text-blue-600">
                                  {order.address?.phone}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      {/* Navigation to store */}
                      {["DRIVER_ASSIGNED", "REACHED_SHOP"].includes(
                        order.status,
                      ) && (
                        <a
                          href={`https://maps.google.com/?q=${order.store?.latitude},${order.store?.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 font-semibold text-purple-700 transition hover:bg-purple-100"
                        >
                          Navigate to Store
                        </a>
                      )}

                      {/* Navigation to customer */}
                      {[
                        "PICKED_UP",
                        "OUT_FOR_DELIVERY",
                        "DELIVERY_INITIATED",
                      ].includes(order.status) && (
                        <a
                          href={`https://maps.google.com/?q=${order.address?.latitude},${order.address?.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 font-semibold text-purple-700 transition hover:bg-purple-100"
                        >
                          Navigate to Customer
                        </a>
                      )}

                      {/* Swipe to next delivery state */}
                      {statusAction && (
                        <SwipeAction
                          label={statusAction.label}
                          releaseLabel={statusAction.releaseLabel}
                          tone={statusAction.tone}
                          loading={statusUpdatingId === order.id}
                          disabled={
                            order.status === "DRIVER_ASSIGNED" && !reachedStore
                          }
                          onComplete={() =>
                            updateStatus(order.id, statusAction.next)
                          }
                        />
                      )}

                      {order.status === "DRIVER_ASSIGNED" && !reachedStore && (
                        <p className="text-center text-xs font-medium text-amber-600">
                          Reach within 100 metres of the store to unlock the
                          swipe.
                        </p>
                      )}

                      {/* OTP actions */}
                      {order.status === "DELIVERY_INITIATED" && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOtpOrder(order);
                              setShowOtpModal(true);
                            }}
                            className="rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
                          >
                            Verify Delivery OTP
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await axios.post("/api/order/resend-otp", {
                                  orderId: order.id,
                                });

                                toast.success("OTP resent successfully");
                              } catch (error) {
                                toast.error(
                                  error?.response?.data?.error ||
                                    "Failed to resend OTP",
                                );
                              }
                            }}
                            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Resend OTP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {showOtpModal && otpOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-4"
            >
              {/* Background glow */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="pointer-events-none absolute h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
              />

              <motion.div
                initial={{
                  opacity: 0,
                  y: 40,
                  scale: 0.92,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                }}
                className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl"
              >
                {/* Top accent */}
                <div className="relative overflow-hidden bg-slate-950 px-5 pb-6 pt-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.15,
                      type: "spring",
                      stiffness: 300,
                    }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                  >
                    <ShieldCheck size={30} className="text-emerald-400" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-2xl font-black text-white"
                  >
                    Verify Delivery
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-400 sm:text-sm"
                  >
                    Ask the customer for the 6-digit OTP sent to their
                    registered contact.
                  </motion.p>

                  {/* Decorative moving line */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute bottom-0 left-0 h-[2px] w-1/3 bg-emerald-400"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  {/* Order reference */}
                  <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Order
                      </p>

                      <p className="mt-1 font-mono text-sm font-bold text-white">
                        #{otpOrder.id?.slice(-6)}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Package size={19} className="text-emerald-400" />
                    </div>
                  </div>

                  {/* OTP boxes */}
                  <div className="mb-3 flex justify-center gap-2">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const value = otp[index] || "";

                      return (
                        <motion.div
                          key={index}
                          animate={{
                            scale: value ? 1.05 : 1,
                            borderColor: value
                              ? "rgb(52 211 153)"
                              : "rgb(51 65 85)",
                          }}
                          className={`flex h-14 w-11 items-center justify-center rounded-xl border-2 bg-slate-950 text-xl font-black text-white transition-all sm:h-16 sm:w-12
                  ${value ? "shadow-md shadow-emerald-500/10" : ""}`}
                        >
                          {value || "•"}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Hidden real input */}
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    autoFocus
                    className="absolute h-0 w-0 opacity-0"
                  />

                  <p className="mb-5 text-center text-[11px] text-slate-500">
                    Enter the verification code given by the customer
                  </p>

                  {/* Progress */}
                  <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      animate={{
                        width: `${(otp.length / 6) * 100}%`,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpModal(false);
                        setOtp("");
                      }}
                      className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-slate-700 active:scale-[0.98]"
                    >
                      Cancel
                    </button>

                    <motion.button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otp.length !== 6}
                      whileTap={otp.length === 6 ? { scale: 0.97 } : {}}
                      className={`relative overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-black transition
              ${
                otp.length === 6
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                  : "cursor-not-allowed bg-slate-800 text-slate-600"
              }`}
                    >
                      {otp.length === 6 ? (
                        <span className="flex items-center justify-center gap-2">
                          <ShieldCheck size={17} />
                          Verify
                        </span>
                      ) : (
                        "Enter OTP"
                      )}
                    </motion.button>
                  </div>

                  {/* Security message */}
                  <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-950/60 px-3 py-3">
                    <ShieldCheck
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p className="text-[10px] leading-relaxed text-slate-500">
                      Only complete the delivery after confirming the OTP with
                      the customer.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
