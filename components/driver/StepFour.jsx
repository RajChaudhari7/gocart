"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  User,
  CreditCard,
  Hash,
  Smartphone,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

import axios from "axios";
import { toast } from "sonner";

export default function StepFour({ form, setForm, back, setStep }) {
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  // ==================================================
  // INPUT HANDLER
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;

    // Bank name / account holder
    if (name === "bankName" || name === "accountHolder") {
      // Allow letters, spaces, dots and apostrophes
      if (!/^[A-Za-z\s.'-]*$/.test(value)) {
        return;
      }

      if (value.length > 100) {
        return;
      }
    }

    // Account number
    if (name === "accountNumber") {
      // Digits only
      if (!/^\d*$/.test(value)) {
        return;
      }

      // Indian bank account numbers generally fall within this range
      if (value.length > 18) {
        return;
      }
    }

    // IFSC
    if (name === "ifsc") {
      nextValue = value.toUpperCase();

      // IFSC contains only letters and numbers
      if (!/^[A-Z0-9]*$/.test(nextValue)) {
        return;
      }

      if (nextValue.length > 11) {
        return;
      }
    }

    // UPI
    if (name === "upiId") {
      // No spaces allowed in UPI ID
      if (/\s/.test(value)) {
        return;
      }

      if (value.length > 100) {
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    // Clear error when user starts correcting field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ==================================================
  // VALIDATION
  // ==================================================

  const validateBankDetails = () => {
    const newErrors = {};

    const bankName = form.bankName?.trim() || "";
    const accountHolder = form.accountHolder?.trim() || "";
    const accountNumber = form.accountNumber?.trim() || "";
    const ifsc = form.ifsc?.trim().toUpperCase() || "";
    const upiId = form.upiId?.trim() || "";

    // ------------------------------------------
    // BANK NAME
    // ------------------------------------------

    if (!bankName) {
      newErrors.bankName = "Bank name is required";
    } else if (bankName.length < 2) {
      newErrors.bankName = "Enter a valid bank name";
    } else if (!/^[A-Za-z\s.'-]+$/.test(bankName)) {
      newErrors.bankName = "Bank name can contain only letters and spaces";
    }

    // ------------------------------------------
    // ACCOUNT HOLDER
    // ------------------------------------------

    if (!accountHolder) {
      newErrors.accountHolder = "Account holder name is required";
    } else if (accountHolder.length < 2) {
      newErrors.accountHolder = "Enter a valid account holder name";
    } else if (!/^[A-Za-z\s.'-]+$/.test(accountHolder)) {
      newErrors.accountHolder =
        "Account holder name can contain only letters and spaces";
    }

    // ------------------------------------------
    // ACCOUNT NUMBER
    // ------------------------------------------

    if (!accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(accountNumber)) {
      newErrors.accountNumber = "Account number must contain only digits";
    } else if (accountNumber.length < 9 || accountNumber.length > 18) {
      newErrors.accountNumber =
        "Account number must be between 9 and 18 digits";
    }

    // ------------------------------------------
    // IFSC
    // ------------------------------------------

    if (!ifsc) {
      newErrors.ifsc = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      newErrors.ifsc = "Enter a valid 11-character IFSC code";
    }

    // ------------------------------------------
    // UPI - OPTIONAL
    // ------------------------------------------

    if (upiId) {
      /*
       * Examples:
       * raj@upi
       * raj123@ybl
       * 9876543210@paytm
       */

      if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z][a-zA-Z0-9._-]{1,}$/.test(upiId)) {
        newErrors.upiId = "Enter a valid UPI ID, e.g. name@upi";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==================================================
  // FILE UPLOAD
  // ==================================================

  const uploadFile = async (file) => {
    // Already uploaded
    if (typeof file === "string") {
      return file;
    }

    if (!file) {
      throw new Error("Required document is missing");
    }

    const formData = new FormData();

    formData.append("file", file);

    const { data } = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!data?.url) {
      throw new Error("File upload failed");
    }

    return data.url;
  };

  // ==================================================
  // SUBMIT APPLICATION
  // ==================================================

  const submitApplication = async () => {
    // Validate bank details first
    const isValid = validateBankDetails();

    if (!isValid) {
      toast.error("Please fix the bank details");

      return;
    }

    try {
      setLoading(true);

      toast.loading("Uploading documents...", {
        id: "upload",
      });

      const [profilePhoto, driverLicense, aadharFront, aadharBack, rcBook] =
        await Promise.all([
          uploadFile(form.profilePhoto),
          uploadFile(form.driverLicense),
          uploadFile(form.aadharFront),
          uploadFile(form.aadharBack),
          uploadFile(form.rcBook),
        ]);

      toast.loading("Submitting application...", {
        id: "upload",
      });

      const payload = {
        name: form.name?.trim(),
        phone: form.phone?.trim(),
        email: form.email?.trim(),
        password: form.password,

        vehicleType: form.vehicleType,
        vehicleName: form.vehicleName?.trim(),
        vehicleNumber: form.vehicleNumber?.trim(),

        profilePhoto,
        driverLicense,
        aadharFront,
        aadharBack,
        rcBook,

        bankName: form.bankName.trim(),
        accountHolder: form.accountHolder.trim(),
        accountNumber: form.accountNumber.trim(),
        ifsc: form.ifsc.trim().toUpperCase(),
        upiId: form.upiId?.trim() || null,
      };

      const savedApplication = JSON.parse(
        localStorage.getItem("driverApplication"),
      );

      // ------------------------------------------
      // UPDATE REJECTED APPLICATION
      // ------------------------------------------

      if (savedApplication?.status === "REJECTED") {
        await axios.patch(
          `/api/driver/application/${savedApplication.id}`,
          payload,
        );
      }

      // ------------------------------------------
      // NEW APPLICATION
      // ------------------------------------------
      else {
        await axios.post("/api/driver/register", payload);
      }

      // ------------------------------------------
      // SAVE APPLICATION LOCALLY
      // ------------------------------------------

      localStorage.setItem(
        "driverApplication",
        JSON.stringify({
          ...payload,
          id: savedApplication?.id,
          phone: form.phone,
          status: "PENDING",
        }),
      );

      toast.success("Application Submitted Successfully", {
        id: "upload",
      });

      setStep(5);
    } catch (error) {
      console.error(
        "DRIVER APPLICATION ERROR:",
        error?.response?.data || error,
      );

      toast.error(
        error?.response?.data?.error || error?.message || "Registration Failed",
        {
          id: "upload",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="
            bg-white/5
            backdrop-blur-xl
            rounded-3xl
            border
            border-white/10
            p-8
        "
    >
      <h2 className="text-3xl font-black text-white">Bank Details</h2>

      <p className="text-white/50 mt-2">
        This account will receive your delivery payouts.
      </p>

      <div className="grid md:grid-cols-2 gap-5 mt-10">
        {/* ==================================
                BANK NAME
            ================================== */}

        <div>
          <div className="relative">
            <Landmark
              className="
                            absolute
                            left-4
                            top-4
                            text-cyan-400
                        "
              size={18}
            />

            <input
              name="bankName"
              value={form.bankName || ""}
              onChange={handleChange}
              placeholder="Bank Name"
              autoComplete="organization"
              maxLength={100}
              className={`
                            w-full
                            pl-12
                            p-4
                            rounded-2xl
                            bg-white/5
                            border
                            text-white
                            outline-none
                            transition
                            ${
                              errors.bankName
                                ? "border-red-500"
                                : "border-white/10 focus:border-cyan-400"
                            }
                        `}
            />
          </div>

          {errors.bankName && (
            <p className="mt-2 text-xs text-red-400">{errors.bankName}</p>
          )}
        </div>

        {/* ==================================
                ACCOUNT HOLDER
            ================================== */}

        <div>
          <div className="relative">
            <User
              className="
                            absolute
                            left-4
                            top-4
                            text-cyan-400
                        "
              size={18}
            />

            <input
              name="accountHolder"
              value={form.accountHolder || ""}
              onChange={handleChange}
              placeholder="Account Holder"
              autoComplete="name"
              maxLength={100}
              className={`
                            w-full
                            pl-12
                            p-4
                            rounded-2xl
                            bg-white/5
                            border
                            text-white
                            outline-none
                            transition
                            ${
                              errors.accountHolder
                                ? "border-red-500"
                                : "border-white/10 focus:border-cyan-400"
                            }
                        `}
            />
          </div>

          {errors.accountHolder && (
            <p className="mt-2 text-xs text-red-400">{errors.accountHolder}</p>
          )}
        </div>

        {/* ==================================
                ACCOUNT NUMBER
            ================================== */}

        <div>
          <div className="relative">
            <CreditCard
              className="
                            absolute
                            left-4
                            top-4
                            text-cyan-400
                        "
              size={18}
            />

            <input
              name="accountNumber"
              value={form.accountNumber || ""}
              onChange={handleChange}
              placeholder="Account Number"
              inputMode="numeric"
              autoComplete="off"
              maxLength={18}
              className={`
                            w-full
                            pl-12
                            p-4
                            rounded-2xl
                            bg-white/5
                            border
                            text-white
                            outline-none
                            transition
                            ${
                              errors.accountNumber
                                ? "border-red-500"
                                : "border-white/10 focus:border-cyan-400"
                            }
                        `}
            />
          </div>

          {errors.accountNumber && (
            <p className="mt-2 text-xs text-red-400">{errors.accountNumber}</p>
          )}
        </div>

        {/* ==================================
                IFSC
            ================================== */}

        <div>
          <div className="relative">
            <Hash
              className="
                            absolute
                            left-4
                            top-4
                            text-cyan-400
                        "
              size={18}
            />

            <input
              name="ifsc"
              value={form.ifsc || ""}
              onChange={handleChange}
              placeholder="IFSC Code"
              autoComplete="off"
              maxLength={11}
              className={`
                            w-full
                            pl-12
                            p-4
                            rounded-2xl
                            bg-white/5
                            border
                            text-white
                            uppercase
                            outline-none
                            transition
                            ${
                              errors.ifsc
                                ? "border-red-500"
                                : "border-white/10 focus:border-cyan-400"
                            }
                        `}
            />
          </div>

          {errors.ifsc && (
            <p className="mt-2 text-xs text-red-400">{errors.ifsc}</p>
          )}
        </div>

        {/* ==================================
                UPI
            ================================== */}

        <div className="md:col-span-2">
          <div className="relative">
            <Smartphone
              className="
                            absolute
                            left-4
                            top-4
                            text-cyan-400
                        "
              size={18}
            />

            <input
              name="upiId"
              value={form.upiId || ""}
              onChange={handleChange}
              placeholder="UPI ID (Optional)"
              autoComplete="off"
              maxLength={100}
              className={`
                            w-full
                            pl-12
                            p-4
                            rounded-2xl
                            bg-white/5
                            border
                            text-white
                            outline-none
                            transition
                            ${
                              errors.upiId
                                ? "border-red-500"
                                : "border-white/10 focus:border-cyan-400"
                            }
                        `}
            />
          </div>

          {errors.upiId && (
            <p className="mt-2 text-xs text-red-400">{errors.upiId}</p>
          )}

          <p className="mt-2 text-xs text-white/30">
            Optional. Example: name@upi
          </p>
        </div>
      </div>

      {/* ======================================
            BUTTONS
        ====================================== */}

      <div className="flex justify-between mt-12">
        <button
          type="button"
          disabled={loading}
          onClick={back}
          className="
                    px-8
                    py-4
                    rounded-2xl
                    bg-white/10
                    text-white
                    hover:bg-white/20
                    transition
                    flex
                    items-center
                    gap-2
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                "
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={submitApplication}
          className="
                    px-10
                    py-4
                    rounded-2xl
                    bg-gradient-to-r
                    from-cyan-400
                    to-emerald-400
                    text-black
                    font-bold
                    hover:scale-105
                    transition
                    flex
                    items-center
                    gap-2
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                "
        >
          <CheckCircle size={20} />

          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </motion.div>
  );
}
