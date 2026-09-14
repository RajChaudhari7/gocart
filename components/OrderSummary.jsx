"use client";

import {
  PlusIcon,
  MapPinIcon,
  CheckCircle2Icon,
  TagIcon,
  XIcon,
  CreditCardIcon,
  BanknoteIcon,
  TruckIcon,
  PackageIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  StoreIcon,
  SparklesIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Protect, useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

const OrderSummary = ({ totalPrice, items }) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    deliveryFee: 50,
    freeDeliveryAbove: 999999,
  });

  const currency =
    process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

  const addressList = useSelector(
    (state) => state.address.list
  );

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [selectedAddress, setSelectedAddress] =
    useState(null);

  const [couponCodeInput, setCouponCodeInput] =
    useState("");

  const [coupon, setCoupon] = useState(null);

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [checkoutAnimating, setCheckoutAnimating] =
    useState(false);

  const checkoutKeyRef = useRef(null);

  const {
    customerLocation,
    selectDeliveryLocation,
  } = useCustomerLocation();

  // ================= STORES =================

  const stores = items.reduce((acc, item) => {
    const storeId = item.storeId;

    const storeName =
      item.store?.name ||
      item.storeName ||
      "Local Store";

    if (!acc[storeId]) {
      acc[storeId] = {
        name: storeName,
        subtotal: 0,
      };
    }

    acc[storeId].subtotal +=
      Number(item.price) * item.quantity;

    return acc;
  }, {});

  // ================= SHIPPING =================

  const shippingCost = Object.values(stores).reduce(
    (sum) => {
      if (
        totalPrice >=
        settings.freeDeliveryAbove
      ) {
        return sum;
      }

      return sum + settings.deliveryFee;
    },
    0
  );

  // ================= DISCOUNT =================

  const discount = coupon
    ? (coupon.discount / 100) * totalPrice
    : 0;

  const finalTotal =
    totalPrice + shippingCost - discount;

  // ================= ADDRESS =================

  useEffect(() => {
    if (
      !Array.isArray(addressList) ||
      addressList.length === 0
    ) {
      return;
    }

    // Prefer active delivery address
    if (customerLocation?.addressId) {
      const matchedAddress =
        addressList.find(
          (address) =>
            address.id ===
            customerLocation.addressId
        );

      if (matchedAddress) {
        setSelectedAddress(matchedAddress);
        return;
      }
    }

    // Otherwise default address
    const defaultAddress =
      addressList.find(
        (address) => address.isDefault
      );

    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [
    addressList,
    customerLocation?.addressId,
  ]);

  // ================= CHECKOUT KEY =================

  const generateCheckoutKey = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID ===
      "function"
    ) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
  };

  // ================= COUPON =================

  const handleCouponCode = async (e) => {
    e.preventDefault();

    if (!couponCodeInput.trim()) return;

    try {
      if (!user) {
        return toast.error(
          "Please login to apply coupon"
        );
      }

      const token = await getToken();

      const { data } = await axios.post(
        "/api/coupon",
        {
          code: couponCodeInput.toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCoupon(data.coupon);

      toast.success(
        "Coupon applied successfully!"
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
        "Invalid coupon code"
      );
    }
  };

  // ================= WAIT =================

  const wait = (ms) =>
    new Promise((resolve) =>
      setTimeout(resolve, ms)
    );

  // ================= ADDRESS CHANGE =================

  const handleCheckoutAddressChange = async (
    addressId
  ) => {
    const address = addressList.find(
      (item) => item.id === addressId
    );

    if (!address) return;

    setSelectedAddress(address);

    if (
      address.latitude != null &&
      address.longitude != null
    ) {
      try {
        await selectDeliveryLocation({
          latitude: address.latitude,
          longitude: address.longitude,

          label:
            address.label ||
            "Delivery Address",

          formattedAddress: [
            address.street,
            address.landmark,
            address.city,
            address.state,
            address.zip,
          ]
            .filter(Boolean)
            .join(", "),

          source: "SAVED",

          addressId: address.id,

          street: address.street || "",
          landmark: address.landmark || "",
          city: address.city || "",
          state: address.state || "",
          zip: address.zip || "",
          country:
            address.country || "India",
        });
      } catch (error) {
        console.error(
          "CHECKOUT ADDRESS LOCATION ERROR:",
          error
        );
      }
    }
  };

  // ================= PLACE ORDER =================

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    try {
      if (!user) {
        return toast.error(
          "Please login to place order"
        );
      }

      if (!selectedAddress) {
        return toast.error(
          "Please select a delivery address"
        );
      }

      if (!items?.length) {
        return toast.error(
          "Your cart is empty"
        );
      }

      if (!checkoutKeyRef.current) {
        checkoutKeyRef.current =
          generateCheckoutKey();
      }

      const checkoutKey =
        checkoutKeyRef.current;

      setIsProcessing(true);
      setCheckoutAnimating(true);

      const token = await getToken();

      const orderData = {
        addressId: selectedAddress.id,
        items,
        paymentMethod,
        couponCode: coupon?.code,
      };

      const [response] =
        await Promise.all([
          axios.post(
            "/api/orders",
            orderData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Idempotency-Key":
                  checkoutKey,
              },
            }
          ),

          wait(3400),
        ]);

      const data = response.data;

      // ================= STRIPE =================

      if (paymentMethod === "STRIPE") {
        window.location.href =
          data.session.url;

        return;
      }

      // ================= SUCCESS =================

      if (data?.duplicate) {
        toast.success(
          "Order was already placed successfully."
        );
      } else {
        toast.success(
          data.message ||
          "Order placed successfully! 🎉"
        );
      }

      checkoutKeyRef.current = null;

      await axios.delete("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(clearCart());

      await wait(300);

      router.push("/orders");
    } catch (err) {
      console.error(
        "PLACE ORDER ERROR:",
        err?.response?.data || err
      );

      const status =
        err?.response?.status;

      const code =
        err?.response?.data?.code;

      if (
        status === 409 &&
        code === "CHECKOUT_PROCESSING"
      ) {
        toast.info(
          "Your checkout is already being processed. Please wait a moment."
        );

        setCheckoutAnimating(false);
        setIsProcessing(false);

        return;
      }

      if (
        status === 409 &&
        code === "CHECKOUT_FAILED"
      ) {
        checkoutKeyRef.current = null;

        toast.error(
          "The previous checkout attempt failed. Please try again."
        );

        setCheckoutAnimating(false);
        setIsProcessing(false);

        return;
      }

      checkoutKeyRef.current = null;

      toast.error(
        err?.response?.data?.error ||
        err.message ||
        "Unable to place order"
      );

      setCheckoutAnimating(false);
      setIsProcessing(false);
    }
  };

  // ================= SETTINGS =================

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } =
          await axios.get(
            "/api/platform/settings"
          );

        setSettings(data);
      } catch {
        console.log(
          "Using default settings"
        );
      }
    }

    loadSettings();
  }, []);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">

      {/* =====================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-indigo-100/50 blur-3xl" />
      </div>

      <div className="relative">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 px-5 py-5 sm:px-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">

                <motion.div
                  animate={{
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  <PackageIcon
                    size={21}
                    strokeWidth={2}
                  />
                </motion.div>

              </div>

              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900">
                  Order Summary
                </h2>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Almost ready to deliver
                </p>
              </div>

            </div>

            {/* ITEM COUNT */}

            <div className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-bold text-emerald-700 shadow-sm">
              {items.length}{" "}
              {items.length === 1
                ? "ITEM"
                : "ITEMS"}
            </div>

          </div>

          {/* PROGRESS */}

          <div className="mt-5">

            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-emerald-600">
                Cart
              </span>

              <span className="text-emerald-600">
                Address
              </span>

              <span className="text-slate-400">
                Payment
              </span>

            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "66%" }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              />
            </div>

          </div>

        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="space-y-6 p-4 sm:p-5">

          {/* ===================================================
              PAYMENT METHOD
          ==================================================== */}

          <section>

            <div className="mb-3 flex items-center justify-between">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Step 1
                </p>

                <h3 className="mt-1 text-sm font-black text-slate-900">
                  Payment Method
                </h3>
              </div>

              <ShieldCheckIcon
                size={18}
                className="text-emerald-500"
              />

            </div>

            <div className="grid grid-cols-2 gap-3">

              {/* COD */}

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod("COD")
                }
                className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${paymentMethod === "COD"
                    ? "border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-100"
                    : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
              >

                {paymentMethod === "COD" && (
                  <div className="absolute right-2 top-2">
                    <CheckCircle2Icon
                      size={16}
                      className="text-emerald-500"
                    />
                  </div>
                )}

                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${paymentMethod === "COD"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-white text-slate-500"
                    }`}
                >
                  <BanknoteIcon size={19} />
                </div>

                <p className="text-xs font-black text-slate-900">
                  Cash on Delivery
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Pay when your order arrives
                </p>

              </button>

              {/* CARD */}

              <button
                type="button"
                onClick={() =>
                  toast.error(
                    "Stripe service is currently unavailable"
                  )
                }
                className="group relative cursor-not-allowed overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left opacity-60 transition-all"
              >

                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400">
                  <CreditCardIcon size={19} />
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-slate-700">
                    Card Payment
                  </p>

                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-500">
                    Soon
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-slate-400">
                  Secure online payment
                </p>

              </button>

            </div>

          </section>

          {/* ===================================================
              ADDRESS
          ==================================================== */}

          <section className="border-t border-slate-100 pt-6">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Step 2
                </p>

                <h3 className="mt-1 text-sm font-black text-slate-900">
                  Delivery Address
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/location/search?from=checkout"
                  )
                }
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-50"
              >
                <PlusIcon size={14} />
                Add New
              </button>

            </div>

            {selectedAddress ? (

              <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-4">

                <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-emerald-100/50 blur-2xl" />

                <div className="relative flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <MapPinIcon size={17} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-sm font-black text-slate-900">
                            {selectedAddress.label ||
                              selectedAddress.name ||
                              "Delivery Address"}
                          </p>

                          {selectedAddress.isDefault && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-emerald-700">
                              Default
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {selectedAddress.name}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAddress(null)
                        }
                        className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600"
                      >
                        Change
                      </button>

                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {[
                        selectedAddress.street,
                        selectedAddress.landmark,
                        selectedAddress.city,
                        selectedAddress.state,
                        selectedAddress.zip,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    {selectedAddress.phone && (
                      <p className="mt-2 text-[11px] font-medium text-slate-400">
                        +91{" "}
                        {selectedAddress.phone}
                      </p>
                    )}

                  </div>

                </div>

              </div>

            ) : (

              <div className="relative">

                <select
                  value={
                    selectedAddress?.id || ""
                  }
                  onChange={(e) =>
                    handleCheckoutAddressChange(
                      e.target.value
                    )
                  }
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="" disabled>
                    Choose a delivery address...
                  </option>

                  {addressList.map((addr) => (
                    <option
                      key={addr.id}
                      value={addr.id}
                    >
                      {addr.label ||
                        addr.name}{" "}
                      — {addr.city}
                    </option>
                  ))}

                </select>

                <ChevronRightIcon
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                />

              </div>

            )}

          </section>

          {/* ===================================================
              COUPON
          ==================================================== */}

          <section className="border-t border-slate-100 pt-6">

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <TagIcon size={14} />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Have a coupon?
                </p>

                <p className="text-[10px] text-slate-400">
                  Save more on your order
                </p>
              </div>

            </div>

            {!coupon ? (

              <form
                onSubmit={handleCouponCode}
                className="relative flex items-center"
              >

                <TagIcon
                  size={16}
                  className="absolute left-3.5 text-slate-400"
                />

                <input
                  value={couponCodeInput}
                  onChange={(e) =>
                    setCouponCodeInput(
                      e.target.value
                    )
                  }
                  placeholder="Enter promo code"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-24 text-sm font-semibold uppercase text-slate-900 outline-none placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  type="submit"
                  disabled={
                    !couponCodeInput.trim()
                  }
                  className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Apply
                </button>

              </form>

            ) : (

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
                    <CheckCircle2Icon size={18} />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                      Coupon Applied
                    </p>

                    <p className="text-sm font-black uppercase text-emerald-700">
                      {coupon.code}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponCodeInput("");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm transition hover:bg-red-50 hover:text-red-500"
                >
                  <XIcon size={14} />
                </button>

              </motion.div>

            )}

          </section>

          {/* ===================================================
              STORE BREAKDOWN
          ==================================================== */}

          <section className="border-t border-slate-100 pt-6">

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <StoreIcon size={14} />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Your Order
                </p>

                <p className="text-[10px] text-slate-400">
                  {Object.keys(stores).length}{" "}
                  local{" "}
                  {Object.keys(stores).length ===
                    1
                    ? "store"
                    : "stores"}
                </p>
              </div>

            </div>

            <div className="space-y-2">

              {Object.values(stores).map(
                (store, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >

                    <div className="mb-2 flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-indigo-500 shadow-sm">
                        <StoreIcon size={13} />
                      </div>

                      <p className="min-w-0 flex-1 truncate text-xs font-black text-slate-800">
                        {store.name}
                      </p>

                    </div>

                    <div className="space-y-1.5">

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">
                          Products
                        </span>

                        <span className="font-bold text-slate-700">
                          {currency}
                          {Number(
                            store.subtotal
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">
                          Delivery
                        </span>

                        <Protect
                          plan="prime"
                          fallback={
                            <span className="font-bold text-slate-700">
                              {currency}
                              {
                                settings.deliveryFee
                              }
                            </span>
                          }
                        >
                          <span className="font-bold text-emerald-600">
                            Free
                          </span>
                        </Protect>
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>

          {/* ===================================================
              PRICE BREAKDOWN
          ==================================================== */}

          <section className="border-t border-slate-100 pt-6">

            <div className="space-y-3">

              <div className="flex items-center justify-between text-sm">

                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-bold text-slate-800">
                  {currency}
                  {Number(
                    totalPrice
                  ).toLocaleString()}
                </span>

              </div>

              <div className="flex items-center justify-between text-sm">

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  {totalPrice >=
                    settings.freeDeliveryAbove && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-600">
                        Free
                      </span>
                    )}
                </div>

                <Protect
                  plan="prime"
                  fallback={
                    <span className="font-bold text-slate-800">
                      {shippingCost === 0
                        ? "Free"
                        : `${currency}${shippingCost}`}
                    </span>
                  }
                >
                  <span className="font-bold text-emerald-600">
                    Free
                  </span>
                </Protect>

              </div>

              {coupon && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-emerald-600">
                    Discount ({coupon.discount}%)
                  </span>

                  <span className="font-black text-emerald-600">
                    -{currency}
                    {discount.toFixed(2)}
                  </span>
                </motion.div>
              )}

            </div>

            {/* FINAL TOTAL */}

            <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-4 shadow-lg">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    You'll Pay
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-300">
                    Inclusive of delivery
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {currency}
                    {finalTotal.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>

                  {coupon && (
                    <p className="mt-0.5 text-[9px] font-bold text-emerald-400">
                      You saved {currency}
                      {discount.toFixed(2)}
                    </p>
                  )}

                </div>

              </div>

            </div>

          </section>

          {/* ===================================================
              CHECKOUT BUTTON
          ==================================================== */}

          <section>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                isProcessing ||
                !selectedAddress
              }
              className={`
                relative h-[64px] w-full overflow-hidden
                rounded-2xl font-bold
                transition-all duration-300
                sm:h-[68px]
                ${isProcessing ||
                  !selectedAddress
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl active:scale-[0.99]"
                }
              `}
            >

              <AnimatePresence mode="wait">

                {!checkoutAnimating ? (

                  <motion.div
                    key="normal"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    className="flex h-full items-center justify-center gap-3"
                  >

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                      <CheckCircle2Icon
                        size={19}
                      />
                    </div>

                    <div className="text-left">

                      <p className="text-sm font-black sm:text-base">
                        Complete Checkout
                      </p>

                      <p className="text-[9px] font-medium text-emerald-100">
                        {selectedAddress
                          ? "Ready to place your order"
                          : "Select an address first"}
                      </p>

                    </div>

                    <ChevronRightIcon
                      size={18}
                    />

                  </motion.div>

                ) : (

                  /* =================================================
                     DELIVERY ANIMATION
                  ================================================== */

                  <motion.div
                    key="delivery-animation"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    className="absolute inset-0 overflow-hidden bg-emerald-600"
                  >

                    {/* STATUS */}

                    <motion.p
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: [
                          0,
                          1,
                          1,
                          0,
                        ],
                      }}
                      transition={{
                        duration: 3.1,
                        times: [
                          0,
                          0.1,
                          0.82,
                          1,
                        ],
                      }}
                      className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-emerald-100 sm:text-xs"
                    >
                      Preparing your order...
                    </motion.p>

                    {/* ROAD */}

                    <div className="absolute bottom-[13px] left-4 right-4 h-[2px] bg-white/20">

                      <motion.div
                        animate={{
                          x: [0, -40],
                        }}
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute -top-[1px] flex gap-5"
                      >
                        {Array.from({
                          length: 15,
                        }).map(
                          (_, index) => (
                            <span
                              key={index}
                              className="block h-[2px] w-5 bg-white/60"
                            />
                          )
                        )}
                      </motion.div>

                    </div>

                    {/* PACKAGES */}

                    <div className="absolute bottom-[25px] left-1/2 flex -translate-x-1/2 items-end gap-1">

                      {[0, 1, 2].map(
                        (item) => (
                          <motion.div
                            key={item}
                            initial={{
                              opacity: 0,
                              y: -30,
                              scale: 0.7,
                            }}
                            animate={{
                              opacity: [
                                0,
                                1,
                                1,
                                0,
                              ],
                              y: [
                                -30,
                                0,
                                0,
                                10,
                              ],
                              scale: [
                                0.7,
                                1,
                                1,
                                0.7,
                              ],
                            }}
                            transition={{
                              duration: 1.3,
                              delay:
                                0.55 +
                                item *
                                0.16,
                            }}
                          >
                            <PackageIcon
                              size={
                                item === 1
                                  ? 19
                                  : 16
                              }
                              className="text-amber-200"
                            />
                          </motion.div>
                        )
                      )}

                    </div>

                    {/* TRUCK */}

                    <motion.div
                      initial={{
                        x: "-90px",
                      }}
                      animate={{
                        x: [
                          "-90px",
                          "calc(50% - 30px)",
                          "calc(50% - 30px)",
                          "calc(100% + 100px)",
                        ],
                      }}
                      transition={{
                        duration: 3.2,
                        times: [
                          0,
                          0.27,
                          0.58,
                          1,
                        ],
                        ease: [
                          "easeOut",
                          "linear",
                          "easeIn",
                        ],
                      }}
                      className="absolute bottom-[16px] left-0 z-20"
                    >

                      <motion.div
                        animate={{
                          y: [
                            0,
                            -1,
                            0,
                            1,
                            0,
                          ],
                        }}
                        transition={{
                          duration: 0.35,
                          repeat: Infinity,
                        }}
                        className="flex h-10 w-14 items-center justify-center rounded-xl border border-white/20 bg-white text-emerald-600 shadow-lg"
                      >
                        <TruckIcon
                          size={27}
                          strokeWidth={2.3}
                        />
                      </motion.div>

                    </motion.div>

                    {/* FINAL */}

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: [
                          0,
                          0,
                          1,
                        ],
                        y: [
                          5,
                          5,
                          0,
                        ],
                      }}
                      transition={{
                        duration: 2.8,
                        times: [
                          0,
                          0.72,
                          1,
                        ],
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >

                      <span className="rounded-full bg-white px-4 py-1.5 text-xs font-black text-emerald-600 shadow-md sm:text-sm">
                        Order placed! 🚚
                      </span>

                    </motion.div>

                  </motion.div>

                )}

              </AnimatePresence>

            </button>

            {/* SECURITY MESSAGE */}

            <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-medium text-slate-400">
              <ShieldCheckIcon
                size={12}
                className="text-emerald-500"
              />

              <span>
                Safe & secure checkout •
                Your information is protected
              </span>
            </div>

          </section>

        </div>
      </div>
    </div>
  );
};

export default OrderSummary;