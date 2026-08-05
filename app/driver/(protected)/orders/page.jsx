"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import DeliveryMap from "@/components/DeliveryMap";
import Image from "next/image";
import { ArrowRight, ChevronRight, Package, X } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Delivery Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your active assignments
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="p-2 bg-white border shadow-sm rounded-full hover:bg-gray-50 transition"
              title="Refresh Orders"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
          </header>

          {incomingOrder && (
            <div className="fixed top-6 right-6 z-50 bg-white shadow-2xl border border-gray-100 rounded-2xl p-5 w-80 animate-in slide-in-from-top-4 duration-300">
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
                    className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 md:p-6"
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
                        <div className="flex items-center gap-3 mb-3">
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

                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                {totalProducts} products
                              </span>

                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
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
                                    className="flex items-center gap-3 p-4"
                                  >
                                    {/* Product Image */}
                                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
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
                                    <div className="shrink-0 text-right">
                                      <p className="text-sm font-bold text-gray-900">
                                        ₹{itemTotal.toFixed(2)}
                                      </p>

                                      <p className="text-[11px] text-gray-400">
                                        Item total
                                      </p>
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

                        <div className="flex items-start gap-2 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
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
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Verify Delivery
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Ask the customer for the 6-digit OTP sent to their phone.
                </p>

                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full border-2 border-gray-200 focus:border-blue-600 focus:ring-0 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono mb-6 outline-none transition"
                  placeholder="000000"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowOtpModal(false);
                      setOtp("");
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyOtp}
                    disabled={otp.length !== 6}
                    className="flex-1 bg-green-600 disabled:bg-green-400 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
