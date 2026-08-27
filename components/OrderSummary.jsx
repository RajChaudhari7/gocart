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

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
  const addressList = useSelector((state) => state.address.list);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutAnimating, setCheckoutAnimating] = useState(false);
  const checkoutKeyRef = useRef(null);

  const { customerLocation, selectDeliveryLocation } = useCustomerLocation();

  const stores = items.reduce((acc, item) => {
    const storeId = item.storeId;
    const storeName = item.store?.name || item.storeName || "Store";

    if (!acc[storeId]) {
      acc[storeId] = {
        name: storeName,
        subtotal: 0,
      };
    }

    acc[storeId].subtotal += item.price * item.quantity;

    return acc;
  }, {});

  const shippingCost = Object.values(stores).reduce((sum, store) => {
    if (totalPrice >= settings.freeDeliveryAbove) {
      return sum;
    }

    return sum + settings.deliveryFee;
  }, 0);

  const discount = coupon ? (coupon.discount / 100) * totalPrice : 0;
  const finalTotal = totalPrice + shippingCost - discount;

  useEffect(() => {
    if (!Array.isArray(addressList) || addressList.length === 0) {
      return;
    }

    // 1. Prefer currently active delivery address
    if (customerLocation?.addressId) {
      const matchedAddress = addressList.find(
        (address) => address.id === customerLocation.addressId,
      );

      if (matchedAddress) {
        setSelectedAddress(matchedAddress);
        return;
      }
    }

    // 2. Otherwise use default saved address
    const defaultAddress = addressList.find((address) => address.isDefault);

    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [addressList, customerLocation?.addressId]);

  const generateCheckoutKey = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  /* ---------------- COUPON ---------------- */
  const handleCouponCode = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    try {
      if (!user) return toast.error("Please login to apply coupon");

      const token = await getToken();
      const { data } = await axios.post(
        "/api/coupon",
        { code: couponCodeInput.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setCoupon(data.coupon);
      toast.success("Coupon applied successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Invalid coupon code");
    }
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleCheckoutAddressChange = async (addressId) => {
    const address = addressList.find((item) => item.id === addressId);

    if (!address) return;

    setSelectedAddress(address);

    if (address.latitude != null && address.longitude != null) {
      try {
        await selectDeliveryLocation({
          latitude: address.latitude,
          longitude: address.longitude,

          label: address.label || "Delivery Address",

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
          country: address.country || "India",
        });
      } catch (error) {
        console.error("CHECKOUT ADDRESS LOCATION ERROR:", error);
      }
    }
  };

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    try {
      if (!user) {
        return toast.error("Please login to place order");
      }

      if (!selectedAddress) {
        return toast.error("Please select a delivery address");
      }

      if (!items?.length) {
        return toast.error("Your cart is empty");
      }

      /*
       * Important:
       *
       * Generate the key only once for this checkout
       * attempt.
       *
       * If the same request is accidentally sent again,
       * the same key will reach the backend.
       */
      if (!checkoutKeyRef.current) {
        checkoutKeyRef.current = generateCheckoutKey();
      }

      const checkoutKey = checkoutKeyRef.current;

      setIsProcessing(true);
      setCheckoutAnimating(true);

      const token = await getToken();

      const orderData = {
        addressId: selectedAddress.id,
        items,
        paymentMethod,
        couponCode: coupon?.code,
      };

      const [response] = await Promise.all([
        axios.post("/api/orders", orderData, {
          headers: {
            Authorization: `Bearer ${token}`,

            "Idempotency-Key": checkoutKey,
          },
        }),

        wait(3400),
      ]);

      const data = response.data;

      // ==================================================
      // STRIPE
      // ==================================================

      if (paymentMethod === "STRIPE") {
        window.location.href = data.session.url;
        return;
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      if (data?.duplicate) {
        toast.success("Order was already placed successfully.");
      } else {
        toast.success(data.message || "Order placed successfully! 🎉");
      }

      /*
       * Checkout completed successfully.
       *
       * We can now clear this key because this
       * checkout attempt is finished.
       */
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
      console.error("PLACE ORDER ERROR:", err?.response?.data || err);

      const status = err?.response?.status;

      const code = err?.response?.data?.code;

      /*
       * IMPORTANT:
       *
       * 409 PROCESSING means another request with
       * this exact checkout key is already running.
       *
       * Do NOT create a new key yet.
       */
      if (status === 409 && code === "CHECKOUT_PROCESSING") {
        toast.info(
          "Your checkout is already being processed. Please wait a moment.",
        );

        setCheckoutAnimating(false);
        setIsProcessing(false);

        return;
      }

      /*
       * If backend says the previous attempt failed,
       * allow the next user click to become a NEW
       * checkout attempt with a new key.
       */
      if (status === 409 && code === "CHECKOUT_FAILED") {
        checkoutKeyRef.current = null;

        toast.error("The previous checkout attempt failed. Please try again.");

        setCheckoutAnimating(false);
        setIsProcessing(false);

        return;
      }

      /*
       * For a normal validation/server failure,
       * generate a fresh key on the next manual retry.
       */
      checkoutKeyRef.current = null;

      toast.error(
        err?.response?.data?.error || err.message || "Unable to place order",
      );

      setCheckoutAnimating(false);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await axios.get("/api/platform/settings");
        setSettings(data);
      } catch {
        console.log("Using default settings");
      }
    }

    loadSettings();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl text-slate-200">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        Order Summary
      </h2>

      {/* PAYMENT METHOD */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Payment Method
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setPaymentMethod("COD")}
            className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center gap-2 transition-all ${
              paymentMethod === "COD"
                ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
            }`}
          >
            <BanknoteIcon size={24} />
            <span className="text-xs font-semibold">COD</span>
          </div>

          <div
            onClick={() =>
              toast.error("Stripe service is currently unavailable")
            }
            className={`cursor-not-allowed opacity-50 rounded-xl border p-3 flex flex-col items-center gap-2 transition-all ${
              paymentMethod === "STRIPE"
                ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            <CreditCardIcon size={24} />
            <span className="text-xs font-semibold">Card</span>
          </div>
        </div>
      </div>

      {/* ADDRESS SECTION */}
      <div className="mb-6 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Delivery Address
          </p>
          <button
            type="button"
            onClick={() => router.push("/location/search?from=checkout")}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <PlusIcon size={14} />
            Add New
          </button>
        </div>

        {selectedAddress ? (
          <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 relative group">
            <div className="flex gap-3">
              <MapPinIcon
                size={18}
                className="text-indigo-400 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  {selectedAddress.name}
                </p>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white">
                        {selectedAddress.label ||
                          selectedAddress.name ||
                          "Delivery Address"}
                      </p>

                      {selectedAddress.isDefault && (
                        <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-300">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-slate-300">
                      {selectedAddress.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
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
                      <p className="mt-2 text-xs text-slate-500">
                        +91 {selectedAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedAddress(null)}
              className="absolute top-3 right-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* FIXED SELECT DROPDOWN */}
            <select
              value={selectedAddress?.id || ""}
              onChange={(e) => handleCheckoutAddressChange(e.target.value)}
              className="w-full bg-slate-950 text-white text-sm border border-slate-700 hover:border-slate-600 rounded-xl p-3.5 appearance-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="" disabled>
                Choose an address...
              </option>

              {addressList.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.label || addr.name} — {addr.city}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              ▼
            </div>
          </div>
        )}
      </div>

      {/* COUPON SECTION */}
      <div className="mb-6 pt-6 border-t border-slate-800/80">
        {!coupon ? (
          <form
            onSubmit={handleCouponCode}
            className="relative flex items-center"
          >
            <TagIcon size={18} className="absolute left-3.5 text-slate-500" />
            <input
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              placeholder="Have a promo code?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-24 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors uppercase"
            />
            <button
              type="submit"
              disabled={!couponCodeInput.trim()}
              className="absolute right-2 top-2 bottom-2 bg-slate-800 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold px-4 rounded-lg transition-colors"
            >
              Apply
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon size={18} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                {coupon.code}
              </span>
            </div>
            <button
              onClick={() => {
                setCoupon(null);
                setCouponCodeInput("");
              }}
              className="text-emerald-400 hover:text-emerald-300 p-1 bg-emerald-500/10 rounded-md transition-colors"
            >
              <XIcon size={14} />
            </button>
          </div>
        )}
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="pt-6 border-t border-slate-800/80 space-y-4">
        {Object.values(stores).map((store, index) => (
          <div
            key={index}
            className="rounded-xl bg-slate-950 border border-slate-800 p-3"
          >
            <p className="text-sm font-bold text-white mb-2">{store.name}</p>

            <div className="flex justify-between text-sm text-slate-400">
              <span>Products</span>
              <span>
                {currency}
                {store.subtotal}
              </span>
            </div>

            <div className="flex justify-between text-sm text-slate-400 mt-1">
              <span>Delivery</span>

              <Protect
                plan="prime"
                fallback={
                  <span>
                    {currency}
                    {settings.deliveryFee}
                  </span>
                }
              >
                <span className="text-emerald-400 font-bold">Free</span>
              </Protect>
            </div>
          </div>
        ))}

        <div className="flex justify-between text-sm text-slate-400">
          <span>Subtotal</span>
          <span className="text-white">
            {currency}
            {totalPrice}
          </span>
        </div>

        <div className="flex justify-between text-sm text-slate-400">
          <span>Total Delivery</span>

          <Protect
            plan="prime"
            fallback={
              <span className="text-white">
                {currency}
                {shippingCost}
              </span>
            }
          >
            <span className="font-bold text-emerald-400">Free</span>
          </Protect>
        </div>

        {coupon && (
          <div className="flex justify-between text-sm text-emerald-400">
            <span>Discount ({coupon.discount}%)</span>
            <span>
              -{currency}
              {discount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-700 border-dashed">
        <span className="text-base text-slate-400">Total</span>
        <span className="text-3xl font-black text-white">
          {currency}
          {finalTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* PLACE ORDER BUTTON */}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={isProcessing || !selectedAddress}
        className={`
    relative mt-8 h-[64px] w-full overflow-hidden
    rounded-2xl font-bold
    transition-all duration-300
    sm:h-[68px]
    ${
      isProcessing || !selectedAddress
        ? "cursor-not-allowed bg-slate-800 text-slate-500"
        : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-[0.99]"
    }
  `}
      >
        <AnimatePresence mode="wait">
          {!checkoutAnimating ? (
            /* NORMAL BUTTON */
            <motion.div
              key="normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="flex h-full items-center justify-center gap-2"
            >
              <CheckCircle2Icon size={19} />

              <span className="text-sm sm:text-base">Complete Checkout</span>
            </motion.div>
          ) : (
            /* DELIVERY ANIMATION */
            <motion.div
              key="delivery-animation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 overflow-hidden"
            >
              {/* Road */}
              <div className="absolute bottom-[13px] left-4 right-4 h-[2px] bg-white/25">
                {/* Road markings */}
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
                  }).map((_, index) => (
                    <span
                      key={index}
                      className="block h-[2px] w-5 bg-white/60"
                    />
                  ))}
                </motion.div>
              </div>

              {/* Status text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3.1,
                  times: [0, 0.1, 0.82, 1],
                }}
                className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-indigo-100 sm:text-xs"
              >
                Preparing your order...
              </motion.p>

              {/* Packages */}
              <div className="absolute bottom-[25px] left-1/2 flex -translate-x-1/2 items-end gap-1">
                {[0, 1, 2].map((item) => (
                  <motion.div
                    key={item}
                    initial={{
                      opacity: 0,
                      y: -30,
                      scale: 0.7,
                    }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [-30, 0, 0, 10],
                      scale: [0.7, 1, 1, 0.7],
                    }}
                    transition={{
                      duration: 1.3,
                      delay: 0.55 + item * 0.16,
                    }}
                  >
                    <PackageIcon
                      size={item === 1 ? 19 : 16}
                      className="text-amber-200"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Truck */}
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
                  times: [0, 0.27, 0.58, 1],
                  ease: ["easeOut", "linear", "easeIn"],
                }}
                className="absolute bottom-[16px] left-0 z-20"
              >
                <motion.div
                  animate={{
                    y: [0, -1, 0, 1, 0],
                  }}
                  transition={{
                    duration: 0.35,
                    repeat: Infinity,
                  }}
                  className="flex h-10 w-14 items-center justify-center rounded-xl border border-white/20 bg-white text-indigo-600 shadow-lg"
                >
                  <TruckIcon size={27} strokeWidth={2.3} />
                </motion.div>
              </motion.div>

              {/* Final text */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: [0, 0, 1],
                  y: [5, 5, 0],
                }}
                transition={{
                  duration: 2.8,
                  times: [0, 0.72, 1],
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="rounded-full bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white shadow-md sm:text-sm">
                  Order placed! 🚚
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export default OrderSummary;
