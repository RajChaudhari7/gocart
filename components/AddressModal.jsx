"use client";

import { addAddress } from "@/lib/features/address/addressSlice";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { indianStates } from "@/assets/indianStates";
import { useCustomerLocation } from "@/context/CustomerLocationContext";

const INDIA_NAME = "India";

const AddressModal = ({
  setShowAddressModal,
  initialLocation = null,
  onAddressSaved,
}) => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const { selectDeliveryLocation } = useCustomerLocation();

  const [address, setAddress] = useState({
    name: "",
    email: "",
    label: "Home",
    street: "",
    landmark: "",
    city: "",
    state: "",
    zip: "",
    country: INDIA_NAME,
    phone: "",
    latitude: initialLocation?.latitude ?? null,
    longitude: initialLocation?.longitude ?? null,
  });

  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [pinLoading, setPinLoading] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  // ==================================================
  // LOAD INDIA STATES
  // ==================================================

  useEffect(() => {
    setStates(indianStates);

    setAddress((prev) => ({
      ...prev,
      country: INDIA_NAME,
    }));
  }, []);

  // ==================================================
  // LOAD MAP LOCATION INTO FORM
  // ==================================================

  useEffect(() => {
    if (!initialLocation) return;

    const incomingZip = initialLocation.zip ? String(initialLocation.zip) : "";

    setAddress((prev) => ({
      ...prev,

      latitude: initialLocation.latitude ?? prev.latitude,
      longitude: initialLocation.longitude ?? prev.longitude,

      street:
        initialLocation.street || initialLocation.area || prev.street || "",

      landmark: initialLocation.landmark || prev.landmark || "",

      city: initialLocation.city || prev.city || "",

      state: initialLocation.state || prev.state || "",

      zip: incomingZip || prev.zip || "",

      country: initialLocation.country || INDIA_NAME,
    }));

    if (/^\d{6}$/.test(incomingZip)) {
      setIsPinVerified(true);
    }
  }, [initialLocation]);

  // ==================================================
  // INPUT HANDLER
  // ==================================================

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    if (name === "zip") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 6) return;

      setIsPinVerified(false);
    }

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ==================================================
  // LABEL
  // ==================================================

  const handleLabelChange = (label) => {
    setAddress((prev) => ({
      ...prev,
      label,
    }));
  };

  // ==================================================
  // STATE
  // ==================================================

  const handleStateSelect = (e) => {
    setAddress((prev) => ({
      ...prev,
      state: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      state: "",
    }));
  };

  // ==================================================
  // PIN CODE LOOKUP
  // ==================================================

  const verifyPin = async () => {
    if (address.country !== INDIA_NAME || address.zip.length !== 6) {
      return false;
    }

    try {
      setPinLoading(true);

      setErrors((prev) => ({
        ...prev,
        zip: "",
      }));

      const { data } = await axios.get(
        `https://api.postalpincode.in/pincode/${address.zip}`,
      );

      if (
        !Array.isArray(data) ||
        !data[0] ||
        data[0].Status !== "Success" ||
        !Array.isArray(data[0].PostOffice) ||
        data[0].PostOffice.length === 0
      ) {
        setErrors((prev) => ({
          ...prev,
          zip: "Invalid PIN code",
        }));

        setIsPinVerified(false);

        return false;
      }

      const postOffice = data[0].PostOffice[0];

      const detectedCity = postOffice.District || "";

      const detectedState = postOffice.State || "";

      const matchedState = states.find(
        (state) =>
          state.name.toLowerCase().trim() ===
          detectedState.toLowerCase().trim(),
      );

      setAddress((prev) => ({
        ...prev,

        city: detectedCity || prev.city,

        state: matchedState ? matchedState.name : detectedState || prev.state,

        country: INDIA_NAME,
      }));

      setIsPinVerified(true);

      setErrors((prev) => ({
        ...prev,
        zip: "",
      }));

      return true;
    } catch (error) {
      console.error("PIN VERIFICATION ERROR:", error);

      setErrors((prev) => ({
        ...prev,
        zip: "PIN verification failed",
      }));

      setIsPinVerified(false);

      return false;
    } finally {
      setPinLoading(false);
    }
  };

  const handlePinBlur = async () => {
    if (address.zip.length !== 6) return;

    await verifyPin();
  };

  // ==================================================
  // VALIDATION
  // ==================================================

  const validate = async () => {
    const newErrors = {};

    if (!address.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!address.email.trim()) {
      newErrors.email = "Email address is required";
    }

    if (!address.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!address.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (address.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (address.latitude == null || address.longitude == null) {
      newErrors.location = "Please select a location on the map";
    }

    if (address.country === INDIA_NAME) {
      if (address.zip.length !== 6) {
        newErrors.zip = "Indian PIN must be 6 digits";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    if (address.country === INDIA_NAME && !isPinVerified) {
      const validPin = await verifyPin();

      if (!validPin) {
        return false;
      }
    }

    return true;
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const valid = await validate();

    if (!valid) {
      toast.error("Please fix the validation errors");

      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      const cleanAddress = {
        ...address,

        name: address.name.trim(),

        email: address.email.trim(),

        label: address.label?.trim() || "Home",

        street: address.street.trim(),

        landmark: address.landmark?.trim() || null,

        city: address.city.trim(),

        state: address.state.trim(),

        zip: address.zip.trim(),

        country: address.country.trim() || INDIA_NAME,

        phone: address.phone.trim(),

        latitude: Number(address.latitude),

        longitude: Number(address.longitude),
      };

      const { data } = await axios.post(
        "/api/address",

        {
          address: cleanAddress,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!data?.newAddress) {
        throw new Error("Address was not saved properly");
      }

      const savedAddress = data.newAddress;

      dispatch(addAddress(savedAddress));

      await selectDeliveryLocation({
        latitude: savedAddress.latitude,

        longitude: savedAddress.longitude,

        label: savedAddress.label || "Home",

        formattedAddress: [
          savedAddress.street,
          savedAddress.landmark,
          savedAddress.city,
          savedAddress.state,
          savedAddress.zip,
        ]
          .filter(Boolean)
          .join(", "),

        source: "SAVED",

        addressId: savedAddress.id,

        street: savedAddress.street || "",

        landmark: savedAddress.landmark || "",

        city: savedAddress.city || "",

        state: savedAddress.state || "",

        zip: savedAddress.zip || "",

        country: savedAddress.country || INDIA_NAME,
      });

      toast.success(data.message || "Address saved successfully");

      if (onAddressSaved) {
        await onAddressSaved(savedAddress);
      }

      setShowAddressModal(false);
    } catch (err) {
      console.error("SAVE ADDRESS ERROR:", err?.response?.data || err);

      toast.error(
        err?.response?.data?.error || err?.message || "Unable to save address",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 px-3 backdrop-blur-md sm:px-4">
      <form
        onSubmit={handleSubmit}
        className={`
          relative
          max-h-[92vh]
          w-full
          max-w-lg
          overflow-y-auto
          rounded-3xl
          border
          border-slate-700
          bg-slate-950
          p-5
          text-white
          shadow-2xl
          sm:p-6
        `}
      >
        {/* CLOSE */}

        <button
          type="button"
          onClick={() => setShowAddressModal(false)}
          className={`
            absolute
            right-4
            top-4
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/5
            text-white/60
            transition
            hover:bg-white/10
            hover:text-white
          `}
        >
          <XIcon size={19} />
        </button>

        {/* HEADER */}

        <div className="pr-12">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
            Delivery Address
          </p>

          <h2 className="mt-1 text-xl font-black sm:text-2xl">
            Add New Address
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-white/35">
            Confirm your contact details and exact delivery address.
          </p>
        </div>

        {/* MAP LOCATION */}

        {initialLocation && (
          <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.07] p-4">
            <div className="flex items-start gap-3">
              <MapPinIcon />

              <div className="min-w-0">
                <p className="text-xs font-bold text-cyan-300">
                  Map location selected
                </p>

                <p className="mt-1 text-xs leading-relaxed text-white/40">
                  {initialLocation.formattedAddress ||
                    [
                      initialLocation.street,
                      initialLocation.area,
                      initialLocation.city,
                      initialLocation.state,
                      initialLocation.zip,
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                    "Selected delivery point"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {/* SAVE AS */}

          <div>
            <label className="mb-2 block text-xs font-bold text-white/45">
              Save address as
            </label>

            <div className="grid grid-cols-3 gap-2">
              {["Home", "Work", "Other"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleLabelChange(item)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                    address.label === item
                      ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
                      : "border-white/10 bg-white/[0.035] text-white/50 hover:bg-white/[0.06]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* NAME */}

          <Field label="Full Name" error={errors.name}>
            <input
              name="name"
              value={address.name}
              onChange={handleAddressChange}
              placeholder="Full Name"
              className="input"
            />
          </Field>

          {/* EMAIL */}

          <Field label="Email Address" error={errors.email}>
            <input
              name="email"
              type="email"
              value={address.email}
              onChange={handleAddressChange}
              placeholder="Email Address"
              className="input"
            />
          </Field>

          {/* STREET */}

          <Field label="House / Street / Building" error={errors.street}>
            <input
              name="street"
              value={address.street}
              onChange={handleAddressChange}
              placeholder="House no., building, street"
              className="input"
            />
          </Field>

          {/* LANDMARK */}

          <Field label="Landmark">
            <input
              name="landmark"
              value={address.landmark || ""}
              onChange={handleAddressChange}
              placeholder="Nearby landmark (optional)"
              className="input"
            />
          </Field>

          {/* PIN */}

          <Field label="PIN Code" error={errors.zip}>
            <div className="relative">
              <input
                name="zip"
                value={address.zip}
                onChange={handleAddressChange}
                onBlur={handlePinBlur}
                placeholder="6-digit PIN code"
                className={`input ${errors.zip ? "error" : ""}`}
              />

              {pinLoading && <LoaderSmall />}
            </div>

            {pinLoading && (
              <p className="mt-1 text-[10px] text-white/40">Verifying PIN...</p>
            )}

            {isPinVerified && !pinLoading && (
              <p className="mt-1 text-[10px] font-semibold text-emerald-400">
                PIN verified ✓
              </p>
            )}
          </Field>

          {/* CITY + STATE */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="City" error={errors.city}>
              <input
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder="City"
                className="input"
              />
            </Field>

            <Field label="State" error={errors.state}>
              <select
                value={address.state}
                onChange={handleStateSelect}
                className="input"
              >
                <option value="">Select State</option>

                {states.map((state) => (
                  <option key={state.code} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* COUNTRY */}

          <Field label="Country">
            <input
              value={INDIA_NAME}
              readOnly
              className="input cursor-not-allowed opacity-70"
            />
          </Field>

          {/* PHONE */}

          <Field label="Phone Number" error={errors.phone}>
            <input
              name="phone"
              inputMode="numeric"
              value={address.phone}
              onChange={handleAddressChange}
              placeholder="10-digit phone number"
              className={`input ${errors.phone ? "error" : ""}`}
            />
          </Field>

          {errors.location && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              {errors.location}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || pinLoading}
          className={`
            mt-6
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-cyan-500
            py-3.5
            text-sm
            font-black
            text-slate-950
            transition
            hover:bg-cyan-400
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-60
          `}
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
              Saving Address...
            </>
          ) : (
            "Save & Use Address"
          )}
        </button>

        <style jsx>{`
          .input {
            width: 100%;
            padding: 0.75rem 0.8rem;
            border-radius: 0.75rem;
            border: 1px solid rgb(51 65 85);
            background: rgb(15 23 42);
            outline: none;
            color: rgb(226 232 240);
            font-size: 16px;
            transition:
              border-color 0.2s,
              background-color 0.2s;
          }

          .input:focus {
            border-color: rgb(34 211 238 / 0.55);
            background: rgb(15 23 42 / 0.9);
          }

          .input::placeholder {
            color: rgb(100 116 139);
          }

          .input option {
            background: rgb(15 23 42);
            color: rgb(226 232 240);
          }

          .error {
            border-color: rgb(239 68 68);
          }
        `}</style>
      </form>
    </div>
  );
};

function Field({ label, error, children }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-white/45">
          {label}
        </label>
      )}

      {children}

      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function LoaderSmall() {
  return (
    <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
  );
}

function MapPinIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-400"
      >
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>
  );
}

export default AddressModal;
