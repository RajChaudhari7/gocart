"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  Phone,
  CarFront,
  Hash,
  Camera,
  Pencil,
  Save,
  X,
  Star,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { useDriver } from "@/context/DriverContext";

export default function DriverProfile() {
  const { driver, loading, refreshDriver } = useDriver();

  const [isEditing, setIsEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [photoPreview, setPhotoPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicle: "",
    vehicleNo: "",
    profilePhoto: "",
  });

  // ---------------------------------------
  // Sync latest driver data into form
  // ---------------------------------------

  useEffect(() => {
    if (!driver) return;

    setForm({
      name: driver.name || "",
      phone: driver.phone || "",
      vehicle: driver.vehicle || "",
      vehicleNo: driver.vehicleNo || "",
      profilePhoto: driver.profilePhoto || "",
    });

    setPhotoPreview(driver.profilePhoto || "");
  }, [driver]);

  // ---------------------------------------
  // Initials
  // ---------------------------------------

  const getInitials = (name) => {
    if (!name) return "D";

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // ---------------------------------------
  // Profile stats
  // ---------------------------------------

  const averageRating = Number(driver?.averageRating || 0);

  const totalRatings = Number(driver?.totalRatings || 0);

  const totalDeliveries = Number(driver?.totalDeliveries || 0);

  const statusLabel = useMemo(() => {
    if (!driver?.isActive) {
      return "Inactive";
    }

    if (driver?.isOnline) {
      return "Online";
    }

    return "Active";
  }, [driver?.isActive, driver?.isOnline]);

  // ---------------------------------------
  // Handle field updates
  // ---------------------------------------

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ---------------------------------------
  // Photo selection
  // ---------------------------------------

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);

      // Local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      // Upload to ImageKit
      const formData = new FormData();

      formData.append("file", file);

      const { data } = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!data?.url) {
        throw new Error("Image upload did not return a URL");
      }

      // Store permanent ImageKit URL
      setForm((current) => ({
        ...current,
        profilePhoto: data.url,
      }));

      // Replace temporary blob preview with permanent URL
      setPhotoPreview(data.url);

      toast.success("Profile photo uploaded successfully");
    } catch (error) {
      console.error("PROFILE PHOTO UPLOAD ERROR:", error);

      toast.error(
        error?.response?.data?.error ||
          error.message ||
          "Unable to upload profile photo",
      );

      // Restore current profile image if upload fails
      setPhotoPreview(driver?.profilePhoto || "");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ---------------------------------------
  // Cancel editing
  // ---------------------------------------

  const handleCancel = () => {
    if (!driver) return;

    setForm({
      name: driver.name || "",
      phone: driver.phone || "",
      vehicle: driver.vehicle || "",
      vehicleNo: driver.vehicleNo || "",
      profilePhoto: driver.profilePhoto || "",
    });

    setPhotoPreview(driver.profilePhoto || "");

    setIsEditing(false);
  };

  // ---------------------------------------
  // Save profile
  // ---------------------------------------

  const handleSave = async () => {
    if (!driver?.id) return;

    if (!form.name.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (form.phone.trim().length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }

    try {
      setSaving(true);

      const { data } = await axios.patch("/api/driver/profile", {
        driverId: driver.id,

        name: form.name.trim(),

        phone: form.phone.trim(),

        vehicle: form.vehicle.trim(),

        vehicleNo: form.vehicleNo.trim().toUpperCase(),

        profilePhoto: form.profilePhoto,
      });

      toast.success(data.message || "Profile updated successfully");

      setIsEditing(false);

      await refreshDriver();
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.error || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fb] p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading profile...
        </p>
      </div>
    );
  }

  // ---------------------------------------
  // Missing driver
  // ---------------------------------------

  if (!driver) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] p-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <User className="h-8 w-8 text-slate-400" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Profile Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Could not load your driver details. Please try logging in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">
      {/* -------------------------------- */}
      {/* HERO HEADER */}
      {/* -------------------------------- */}

      <section className="relative overflow-hidden bg-slate-950 px-4 pb-24 pt-8 text-white sm:px-6 sm:pb-28">
        <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-green-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                Driver Account
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Manage your personal and vehicle information.
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-100 sm:w-auto"
              >
                <Pencil size={17} />
                Edit Profile
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || uploadingPhoto}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------- */}
      {/* PROFILE CONTENT */}
      {/* -------------------------------- */}

      <section className="mx-auto -mt-16 max-w-5xl space-y-5 px-3 sm:px-6">
        {/* Main Profile Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="px-4 pb-6 pt-5 sm:px-8 sm:pb-8">
            {/* Avatar */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-green-100 shadow-xl sm:h-32 sm:w-32">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt={driver.name || "Driver"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-black text-green-700 sm:text-4xl">
                        {getInitials(driver.name)}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <>
                      <input
                        id="driver-profile-photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="driver-profile-photo"
                        className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-green-600 text-white shadow-lg transition hover:bg-green-700"
                      >
                        <Camera size={16} />
                      </label>
                    </>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black text-slate-900 sm:text-2xl">
                    {driver.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Delivery Partner
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                        driver.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          driver.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />

                      {statusLabel}
                    </span>

                    {driver.isOnline && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="rounded-2xl bg-slate-50 p-3 text-center sm:p-4">
                <PackageCheck size={18} className="mx-auto text-green-600" />

                <p className="mt-2 text-lg font-black text-slate-900 sm:text-xl">
                  {totalDeliveries}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase text-slate-400 sm:text-xs">
                  Deliveries
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-center sm:p-4">
                <Star
                  size={18}
                  className="mx-auto fill-amber-400 text-amber-400"
                />

                <p className="mt-2 text-lg font-black text-slate-900 sm:text-xl">
                  {averageRating.toFixed(1)}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase text-slate-400 sm:text-xs">
                  Rating
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-center sm:p-4">
                <ShieldCheck size={18} className="mx-auto text-indigo-600" />

                <p className="mt-2 text-lg font-black text-slate-900 sm:text-xl">
                  {totalRatings}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase text-slate-400 sm:text-xs">
                  Reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Personal */}
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Account Information
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-900">
                Personal Details
              </h3>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <ProfileField icon={User} label="Full Name">
                {isEditing ? (
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-green-500 focus:bg-white"
                  />
                ) : (
                  <p className="break-words font-semibold text-slate-900">
                    {driver.name || "--"}
                  </p>
                )}
              </ProfileField>

              {/* Phone */}
              <ProfileField icon={Phone} label="Phone Number">
                {isEditing ? (
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value.replace(/[^\d+]/g, ""),
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-green-500 focus:bg-white"
                  />
                ) : (
                  <p className="font-semibold text-slate-900">
                    {driver.phone || "--"}
                  </p>
                )}
              </ProfileField>
            </div>
          </section>

          {/* Vehicle */}
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Delivery Vehicle
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-900">
                Vehicle Details
              </h3>
            </div>

            <div className="space-y-5">
              {/* Vehicle */}
              <ProfileField icon={CarFront} label="Vehicle Model">
                {isEditing ? (
                  <input
                    value={form.vehicle}
                    onChange={(event) =>
                      updateField("vehicle", event.target.value)
                    }
                    placeholder="Example: Honda Activa"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-green-500 focus:bg-white"
                  />
                ) : (
                  <p className="break-words font-semibold text-slate-900">
                    {driver.vehicle || "Not provided"}
                  </p>
                )}
              </ProfileField>

              {/* Vehicle number */}
              <ProfileField icon={Hash} label="License Plate">
                {isEditing ? (
                  <input
                    value={form.vehicleNo}
                    onChange={(event) =>
                      updateField("vehicleNo", event.target.value.toUpperCase())
                    }
                    placeholder="MH39AB1234"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm font-bold uppercase text-slate-900 outline-none transition focus:border-green-500 focus:bg-white"
                  />
                ) : (
                  <span className="inline-flex rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-mono text-sm font-black text-slate-900">
                    {driver.vehicleNo || "Not provided"}
                  </span>
                )}
              </ProfileField>
            </div>
          </section>
        </div>

        {/* Account info */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50">
              <ShieldCheck size={21} className="text-green-600" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Verified Driver Account
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Your account and vehicle details are used for delivery
                assignments and customer tracking.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

// --------------------------------------------------
// Reusable Profile Field
// --------------------------------------------------

function ProfileField({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
        <Icon size={19} className="text-slate-500" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        {children}
      </div>
    </div>
  );
}
