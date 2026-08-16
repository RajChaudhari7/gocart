"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  Phone,
  CarFront,
  Hash,
  Camera,
  Star,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import axios from "axios";
import { toast } from "sonner";
import { useDriver } from "@/context/DriverContext";

export default function DriverProfile() {
  const { driver, loading, refreshDriver } = useDriver();

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [photoPreview, setPhotoPreview] = useState("");

  // ---------------------------------------
  // Sync driver profile photo
  // ---------------------------------------

  useEffect(() => {
    if (!driver) return;

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
  // Stats
  // ---------------------------------------

  const averageRating = Number(driver?.averageRating || 0);

  const totalRatings = Number(driver?.totalRatings || 0);

  const totalDeliveries = Number(driver?.totalDeliveries || 0);

  const statusLabel = useMemo(() => {
    if (!driver?.isActive) {
      return "Inactive";
    }

    return driver?.isOnline ? "Online" : "Active";
  }, [driver?.isActive, driver?.isOnline]);

  // ---------------------------------------
  // Update profile photo
  // ---------------------------------------

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !driver?.id) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");

      event.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be less than 5MB");

      event.target.value = "";

      return;
    }

    let localPreview = null;

    try {
      setUploadingPhoto(true);

      // Instant local preview
      localPreview = URL.createObjectURL(file);

      setPhotoPreview(localPreview);

      // Upload to ImageKit
      const formData = new FormData();

      formData.append("file", file);

      const { data: uploadData } = await axios.post("/api/upload", formData);

      if (!uploadData?.url) {
        throw new Error("Image upload did not return a URL");
      }

      // Save uploaded URL to Driver
      const { data } = await axios.patch("/api/driver/profile", {
        driverId: driver.id,

        name: driver.name,

        phone: driver.phone,

        vehicle: driver.vehicle,

        vehicleNo: driver.vehicleNo,

        profilePhoto: uploadData.url,
      });

      setPhotoPreview(uploadData.url);

      toast.success(data?.message || "Profile photo updated successfully");

      await refreshDriver();
    } catch (error) {
      console.error("PROFILE PHOTO UPDATE ERROR:", error);

      setPhotoPreview(driver?.profilePhoto || "");

      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Unable to update profile photo",
      );
    } finally {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }

      event.target.value = "";

      setUploadingPhoto(false);
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
  // Driver not found
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

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Could not load your driver details. Please try logging in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">
      {/* ======================================= */}
      {/* PAGE HEADER */}
      {/* ======================================= */}

      <section className="mx-auto max-w-5xl px-3 pt-5 sm:px-6 sm:pt-8">
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:text-xs">
            Driver Account
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your verified driver and vehicle information.
          </p>
        </div>

        {/* ======================================= */}
        {/* PROFILE CARD */}
        {/* ======================================= */}

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg">
          {/* Dark profile section */}

          <div className="relative overflow-hidden bg-slate-950 px-4 pb-7 pt-6 text-white sm:px-8 sm:pb-8 sm:pt-8">
            {/* Decorative background */}

            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-green-500/15 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Driver */}

              <div className="flex min-w-0 items-center gap-4">
                {/* Avatar */}

                <div className="relative shrink-0">
                  <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-4 border-white/15 bg-green-100 shadow-xl sm:h-28 sm:w-28">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt={driver.name || "Driver"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-green-100 text-3xl font-black text-green-700">
                        {getInitials(driver.name)}
                      </div>
                    )}

                    {/* Upload overlay */}

                    {uploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />

                          <span className="text-[10px] font-semibold text-white">
                            Uploading
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File input */}

                  <input
                    id="driver-profile-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />

                  {/* Camera */}

                  <label
                    htmlFor="driver-profile-photo"
                    className={`absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl border-4 border-slate-950 bg-green-600 text-white shadow-lg transition ${
                      uploadingPhoto
                        ? "pointer-events-none cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-green-500 active:scale-95"
                    }`}
                  >
                    <Camera size={18} />
                  </label>
                </div>

                {/* Driver details */}

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:text-[10px]">
                    Delivery Partner
                  </p>

                  <h2 className="mt-1 truncate text-xl font-black sm:text-3xl">
                    {driver.name}
                  </h2>

                  <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">
                    {driver.phone}
                  </p>

                  {/* Status */}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] font-bold sm:px-3 sm:text-xs ${
                        driver.isActive
                          ? "border-green-500/20 bg-green-500/10 text-green-300"
                          : "border-red-500/20 bg-red-500/10 text-red-300"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          driver.isActive ? "bg-green-400" : "bg-red-400"
                        }`}
                      />

                      {driver.isActive ? "Active" : "Inactive"}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1.5 text-[10px] font-bold sm:px-3 sm:text-xs ${
                        driver.isOnline
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-600 bg-slate-800 text-slate-400"
                      }`}
                    >
                      {driver.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo helper */}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:max-w-[230px]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                    <Camera size={17} className="text-green-400" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white">
                      Change Profile Photo
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-slate-400 sm:text-[11px]">
                      Tap the camera icon to choose a new profile picture.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================= */}
          {/* STATS */}
          {/* ======================================= */}

          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="p-3 text-center sm:p-5">
              <PackageCheck size={18} className="mx-auto text-green-600" />

              <p className="mt-2 text-lg font-black text-slate-900 sm:text-xl">
                {totalDeliveries}
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">
                Deliveries
              </p>
            </div>

            <div className="p-3 text-center sm:p-5">
              <Star
                size={18}
                className="mx-auto fill-amber-400 text-amber-400"
              />

              <p className="mt-2 text-lg font-black text-slate-900 sm:text-xl">
                {averageRating.toFixed(1)}
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">
                Rating
              </p>
            </div>

            <div className="p-3 text-center sm:p-5">
              <ShieldCheck size={18} className="mx-auto text-indigo-600" />

              <p className="mt-2 text-lg font-black text-slate-900 sm:text-xl">
                {totalRatings}
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400 sm:text-[10px]">
                Reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================= */}
      {/* DETAILS */}
      {/* ======================================= */}

      <section className="mx-auto mt-5 max-w-5xl space-y-5 px-3 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Personal */}

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
                Account Information
              </p>

              <h3 className="mt-2 text-lg font-black text-slate-900 sm:text-xl">
                Personal Details
              </h3>
            </div>

            <div className="space-y-5">
              <ProfileField icon={User} label="Full Name">
                <p className="break-words font-semibold text-slate-900">
                  {driver.name || "--"}
                </p>
              </ProfileField>

              <ProfileField icon={Phone} label="Phone Number">
                <p className="break-all font-semibold text-slate-900">
                  {driver.phone || "--"}
                </p>
              </ProfileField>
            </div>
          </section>

          {/* Vehicle */}

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
                Delivery Vehicle
              </p>

              <h3 className="mt-2 text-lg font-black text-slate-900 sm:text-xl">
                Vehicle Details
              </h3>
            </div>

            <div className="space-y-5">
              <ProfileField icon={CarFront} label="Vehicle Model">
                <p className="break-words font-semibold text-slate-900">
                  {driver.vehicle || "Not provided"}
                </p>
              </ProfileField>

              <ProfileField icon={Hash} label="License Plate">
                <span className="inline-flex max-w-full break-all rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 font-mono text-sm font-black text-slate-900">
                  {driver.vehicleNo || "Not provided"}
                </span>
              </ProfileField>
            </div>
          </section>
        </div>

        {/* ======================================= */}
        {/* VERIFIED ACCOUNT */}
        {/* ======================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50">
              <ShieldCheck size={21} className="text-green-600" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Verified Driver Account
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Your personal and vehicle information is verified by the
                platform and cannot be edited from the driver app. You can
                update only your profile photo.
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
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
          {label}
        </p>

        {children}
      </div>
    </div>
  );
}
