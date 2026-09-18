"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
    CheckCircle2,
    ChevronLeft,
    ImagePlus,
    Loader2,
    Mail,
    MapPin,
    Navigation,
    Phone,
    Save,
    ShieldCheck,
    Store,
    UserRound,
    X,
} from "lucide-react";

const STORE_CATEGORIES = [
    "Grocery & Kitchen",
    "Snacks & Drinks",
    "Bakery & Sweets",
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Meat & Fish",
    "Pharmacy & Wellness",
    "Electronics",
    "Clothing & Fashion",
    "Home & Living",
    "Stationery & Books",
    "Beauty & Personal Care",
    "Other",
];

const EMPTY_FORM = {
    name: "",
    username: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    gst: "",
    latitude: "",
    longitude: "",
    category: "",
    customCategory: "",
};

export default function StoreProfile() {
    const router = useRouter();
    const { getToken } = useAuth();

    const [form, setForm] = useState(EMPTY_FORM);

    const [store, setStore] = useState(null);
    const [logo, setLogo] = useState("");
    const [imageFile, setImageFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locating, setLocating] = useState(false);

    const [isDirty, setIsDirty] = useState(false);

    /* =========================================================
       LOAD PROFILE
    ========================================================= */

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const token = await getToken();

            const { data } = await axios.get(
                "/api/store/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const storeData = data?.store;

            if (!storeData) {
                throw new Error("Store profile not found");
            }

            setStore(storeData);

            setForm({
                name: storeData.name || "",
                username: storeData.username || "",
                description: storeData.description || "",
                email: storeData.email || "",
                contact: storeData.contact || "",
                address: storeData.address || "",
                gst: storeData.gst || "",
                latitude:
                    storeData.latitude !== null &&
                        storeData.latitude !== undefined
                        ? String(storeData.latitude)
                        : "",
                longitude:
                    storeData.longitude !== null &&
                        storeData.longitude !== undefined
                        ? String(storeData.longitude)
                        : "",
                category: STORE_CATEGORIES.includes(storeData.category)
                    ? storeData.category
                    : storeData.category
                        ? "Other"
                        : "",
                customCategory: STORE_CATEGORIES.includes(storeData.category)
                    ? ""
                    : storeData.category || "",
            });

            setLogo(storeData.logo || "");
            setImageFile(null);
            setIsDirty(false);

        } catch (error) {
            console.error("STORE PROFILE ERROR:", error);

            toast.error(
                error?.response?.data?.error ||
                error?.message ||
                "Failed to load store profile"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    /* =========================================================
       INPUT HANDLER
    ========================================================= */

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setIsDirty(true);
    };

    /* =========================================================
       IMAGE
    ========================================================= */

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB");
            return;
        }

        setImageFile(file);

        const previewUrl = URL.createObjectURL(file);

        setLogo(previewUrl);
        setIsDirty(true);
    };

    const removeNewImage = () => {
        setImageFile(null);
        setLogo(store?.logo || "");
        setIsDirty(true);
    };

    /* =========================================================
       CURRENT LOCATION
    ========================================================= */

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                setForm((prev) => ({
                    ...prev,
                    latitude: latitude.toFixed(6),
                    longitude: longitude.toFixed(6),
                }));

                setIsDirty(true);
                setLocating(false);

                toast.success("Store location updated");
            },
            (error) => {
                console.error("LOCATION ERROR:", error);

                setLocating(false);

                if (error.code === error.PERMISSION_DENIED) {
                    toast.error(
                        "Location permission was denied. Please allow location access."
                    );
                } else {
                    toast.error(
                        "Unable to get your current location"
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    /* =========================================================
       VALIDATION
    ========================================================= */

    const validateForm = () => {
        if (!form.name.trim()) {
            toast.error("Store name is required");
            return false;
        }

        if (!form.username.trim()) {
            toast.error("Username is required");
            return false;
        }

        if (!/^[a-z0-9._-]+$/i.test(form.username.trim())) {
            toast.error(
                "Username can contain only letters, numbers, dots, underscores and hyphens"
            );
            return false;
        }

        if (!form.description.trim()) {
            toast.error("Store description is required");
            return false;
        }

        if (!form.email.trim()) {
            toast.error("Email is required");
            return false;
        }

        if (!form.contact.trim()) {
            toast.error("Contact number is required");
            return false;
        }

        if (!form.address.trim()) {
            toast.error("Store address is required");
            return false;
        }

        const latitude = Number(form.latitude);
        const longitude = Number(form.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            toast.error("Valid store coordinates are required");
            return false;
        }

        if (latitude < -90 || latitude > 90) {
            toast.error("Invalid latitude");
            return false;
        }

        if (longitude < -180 || longitude > 180) {
            toast.error("Invalid longitude");
            return false;
        }

        if (!form.category) {
            toast.error("Please select a store category");
            return false;
        }

        if (
            form.category === "Other" &&
            !form.customCategory.trim()
        ) {
            toast.error("Please enter your custom category");
            return false;
        }

        if (form.gst.trim()) {
            const gstRegex =
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

            if (
                !gstRegex.test(
                    form.gst.trim().toUpperCase()
                )
            ) {
                toast.error("Invalid GST number");
                return false;
            }
        }

        return true;
    };

    /* =========================================================
       SAVE
    ========================================================= */

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);

            const token = await getToken();

            const formData = new FormData();

            formData.append("name", form.name.trim());
            formData.append(
                "username",
                form.username.trim().toLowerCase()
            );
            formData.append(
                "description",
                form.description.trim()
            );
            formData.append("email", form.email.trim());
            formData.append("contact", form.contact.trim());
            formData.append("address", form.address.trim());

            formData.append(
                "gst",
                form.gst.trim().toUpperCase()
            );

            formData.append(
                "latitude",
                String(Number(form.latitude))
            );

            formData.append(
                "longitude",
                String(Number(form.longitude))
            );

            formData.append(
                "category",
                form.category
            );

            formData.append(
                "customCategory",
                form.customCategory.trim()
            );

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const { data } = await axios.put(
                "/api/store/profile",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updatedStore = data?.store;

            if (updatedStore) {
                setStore(updatedStore);

                setForm({
                    name: updatedStore.name || "",
                    username: updatedStore.username || "",
                    description: updatedStore.description || "",
                    email: updatedStore.email || "",
                    contact: updatedStore.contact || "",
                    address: updatedStore.address || "",
                    gst: updatedStore.gst || "",
                    latitude:
                        updatedStore.latitude !== null &&
                            updatedStore.latitude !== undefined
                            ? String(updatedStore.latitude)
                            : "",
                    longitude:
                        updatedStore.longitude !== null &&
                            updatedStore.longitude !== undefined
                            ? String(updatedStore.longitude)
                            : "",
                    category: STORE_CATEGORIES.includes(
                        updatedStore.category
                    )
                        ? updatedStore.category
                        : updatedStore.category
                            ? "Other"
                            : "",
                    customCategory:
                        STORE_CATEGORIES.includes(
                            updatedStore.category
                        )
                            ? ""
                            : updatedStore.category || "",
                });

                setLogo(updatedStore.logo || "");
            }

            setImageFile(null);
            setIsDirty(false);

            toast.success(
                "Store profile updated successfully"
            );

        } catch (error) {
            console.error("SAVE STORE PROFILE ERROR:", error);

            toast.error(
                error?.response?.data?.error ||
                error?.message ||
                "Failed to update store profile"
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       UNSAVED CHANGES
    ========================================================= */

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!isDirty) return;

            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener(
            "beforeunload",
            handleBeforeUnload
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [isDirty]);

    /* =========================================================
       STATUS
    ========================================================= */

    const statusLabel = useMemo(() => {
        if (!store) return "";

        if (store.status === "approved") {
            return "Approved";
        }

        if (store.status === "rejected") {
            return "Rejected";
        }

        return "Pending approval";
    }, [store]);

    const statusClasses = useMemo(() => {
        if (!store) return "";

        if (store.status === "approved") {
            return "bg-emerald-50 text-emerald-700 ring-emerald-100";
        }

        if (store.status === "rejected") {
            return "bg-red-50 text-red-700 ring-red-100";
        }

        return "bg-amber-50 text-amber-700 ring-amber-100";
    }, [store]);

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <main className="min-h-screen bg-[#fffaf5] px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="animate-pulse space-y-5">
                        <div className="h-8 w-48 rounded-xl bg-slate-200" />
                        <div className="h-4 w-72 rounded bg-slate-100" />

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8">
                            <div className="flex flex-col gap-6 sm:flex-row">
                                <div className="h-32 w-32 rounded-2xl bg-slate-100" />

                                <div className="flex-1 space-y-4">
                                    <div className="h-7 w-64 rounded bg-slate-100" />
                                    <div className="h-4 w-80 rounded bg-slate-100" />
                                    <div className="h-4 w-56 rounded bg-slate-100" />
                                </div>
                            </div>
                        </div>

                        <div className="h-96 rounded-[2rem] bg-white ring-1 ring-slate-200" />
                    </div>
                </div>
            </main>
        );
    }

    if (!store) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-5">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
                        <Store
                            size={28}
                            className="text-orange-500"
                        />
                    </div>

                    <h1 className="mt-5 text-xl font-black text-slate-900">
                        Store profile unavailable
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        We couldn't load your store information.
                    </p>

                    <button
                        type="button"
                        onClick={fetchProfile}
                        className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] text-slate-900">
            <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pb-16 lg:px-8">
                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/store")}
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                    Store Profile
                                </h1>

                                {isDirty && (
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-600 ring-1 ring-amber-100">
                                        Unsaved
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage your store information and location.
                            </p>
                        </div>
                    </div>

                    <div
                        className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${statusClasses}`}
                    >
                        <ShieldCheck size={14} />
                        {statusLabel}
                    </div>
                </div>


                {/* =================================================
                    STORE OVERVIEW
                ================================================= */}

                <section className="mb-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.05)]">
                    <div className="p-5 sm:p-7">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            {/* LOGO */}

                            <div className="relative mx-auto shrink-0 sm:mx-0">
                                <div className="relative h-28 w-28 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-sm sm:h-32 sm:w-32">
                                    {logo ? (
                                        <Image
                                            src={logo}
                                            alt={
                                                form.name ||
                                                "Store logo"
                                            }
                                            fill
                                            sizes="128px"
                                            className="object-cover"
                                            unoptimized={
                                                logo.startsWith(
                                                    "blob:"
                                                )
                                            }
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-orange-50">
                                            <Store
                                                size={36}
                                                className="text-orange-400"
                                            />
                                        </div>
                                    )}
                                </div>

                                <label className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-4 border-white bg-orange-500 text-white shadow-md transition hover:bg-orange-600">
                                    <ImagePlus size={17} />

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={
                                            handleImageChange
                                        }
                                    />
                                </label>
                            </div>

                            {/* INFO */}

                            <div className="min-w-0 flex-1 text-center sm:text-left">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="break-words text-xl font-black text-slate-900 sm:text-2xl">
                                            {form.name ||
                                                "Your Store"}
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-400">
                                            @{form.username}
                                        </p>
                                    </div>

                                    <div className="flex justify-center sm:justify-end">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                                            <span
                                                className={`h-2 w-2 rounded-full ${store.isActive
                                                        ? "bg-emerald-500"
                                                        : "bg-red-400"
                                                    }`}
                                            />
                                            {store.isActive
                                                ? "Store is open"
                                                : "Store is closed"}
                                        </span>
                                    </div>
                                </div>

                                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:mx-0">
                                    {form.description ||
                                        "Add a description for your store."}
                                </p>
                            </div>
                        </div>

                        {imageFile && (
                            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-600 sm:justify-start">
                                <ImagePlus size={14} />
                                New logo selected. Save changes to upload it.

                                <button
                                    type="button"
                                    onClick={removeNewImage}
                                    className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg hover:bg-orange-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </section>


                {/* =================================================
                    STORE IDENTITY
                ================================================= */}

                <section className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.04)]">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                                <Store
                                    size={19}
                                    className="text-orange-500"
                                />
                            </div>

                            <div>
                                <h2 className="font-black text-slate-900">
                                    Store Identity
                                </h2>

                                <p className="text-xs text-slate-400">
                                    Basic information customers see.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                        {/* NAME */}

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Store Name
                            </label>

                            <input
                                value={form.name}
                                onChange={(e) =>
                                    handleChange(
                                        "name",
                                        e.target.value
                                    )
                                }
                                placeholder="Your store name"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                            />
                        </div>

                        {/* USERNAME */}

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Store Username
                            </label>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                    @
                                </span>

                                <input
                                    value={form.username}
                                    onChange={(e) =>
                                        handleChange(
                                            "username",
                                            e.target.value
                                                .toLowerCase()
                                                .replace(
                                                    /\s/g,
                                                    ""
                                                )
                                        )
                                    }
                                    placeholder="your-store"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                                />
                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Description
                            </label>

                            <textarea
                                rows={4}
                                value={form.description}
                                onChange={(e) =>
                                    handleChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                                placeholder="Tell customers about your store..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                            />
                        </div>
                    </div>
                </section>


                {/* =================================================
                    CONTACT
                ================================================= */}

                <section className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.04)]">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                <UserRound
                                    size={19}
                                    className="text-indigo-500"
                                />
                            </div>

                            <div>
                                <h2 className="font-black text-slate-900">
                                    Contact Information
                                </h2>

                                <p className="text-xs text-slate-400">
                                    How customers and the platform can contact you.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                        {/* EMAIL */}

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Email
                            </label>

                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        handleChange(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                                />
                            </div>
                        </div>

                        {/* CONTACT */}

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Contact Number
                            </label>

                            <div className="relative">
                                <Phone
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="tel"
                                    value={form.contact}
                                    onChange={(e) =>
                                        handleChange(
                                            "contact",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                                />
                            </div>
                        </div>

                        {/* ADDRESS */}

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Store Address
                            </label>

                            <div className="relative">
                                <MapPin
                                    size={17}
                                    className="absolute left-4 top-4 text-orange-500"
                                />

                                <textarea
                                    rows={3}
                                    value={form.address}
                                    onChange={(e) =>
                                        handleChange(
                                            "address",
                                            e.target.value
                                        )
                                    }
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                                />
                            </div>
                        </div>
                    </div>
                </section>


                {/* =================================================
                    LOCATION
                ================================================= */}

                <section className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.04)]">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                                    <Navigation
                                        size={19}
                                        className="text-emerald-500"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-black text-slate-900">
                                        Store Location
                                    </h2>

                                    <p className="text-xs text-slate-400">
                                        Used for nearby-store and delivery features.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={useCurrentLocation}
                                disabled={locating}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {locating ? (
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Navigation size={15} />
                                )}

                                {locating
                                    ? "Getting location..."
                                    : "Use current location"}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Latitude
                            </label>

                            <input
                                type="number"
                                step="any"
                                value={form.latitude}
                                onChange={(e) =>
                                    handleChange(
                                        "latitude",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. 21.3667"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Longitude
                            </label>

                            <input
                                type="number"
                                step="any"
                                value={form.longitude}
                                onChange={(e) =>
                                    handleChange(
                                        "longitude",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. 74.2444"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                        <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                            <MapPin
                                size={14}
                                className="mt-0.5 shrink-0 text-emerald-500"
                            />

                            <p>
                                Keep the coordinates accurate. They determine
                                whether customers near your store can discover
                                your products and are used by the delivery
                                tracking system.
                            </p>
                        </div>
                    </div>
                </section>


                {/* =================================================
                    BUSINESS
                ================================================= */}

                <section className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.04)]">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                                <ShieldCheck
                                    size={19}
                                    className="text-violet-500"
                                />
                            </div>

                            <div>
                                <h2 className="font-black text-slate-900">
                                    Business Information
                                </h2>

                                <p className="text-xs text-slate-400">
                                    Category and optional GST information.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                        {/* CATEGORY */}

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Store Category
                            </label>

                            <select
                                value={form.category}
                                onChange={(e) =>
                                    handleChange(
                                        "category",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
                            >
                                <option value="">
                                    Select category
                                </option>

                                {STORE_CATEGORIES.map(
                                    (category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* GST */}

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                                GST Number
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black normal-case tracking-normal text-slate-400">
                                    Optional
                                </span>
                            </label>

                            <input
                                value={form.gst}
                                onChange={(e) =>
                                    handleChange(
                                        "gst",
                                        e.target.value.toUpperCase()
                                    )
                                }
                                placeholder="22AAAAA0000A1Z5"
                                maxLength={15}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                            />
                        </div>

                        {/* CUSTOM CATEGORY */}

                        {form.category === "Other" && (
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                                    Custom Category
                                </label>

                                <input
                                    value={form.customCategory}
                                    onChange={(e) =>
                                        handleChange(
                                            "customCategory",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your store category"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-50"
                                />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                        <p className="text-xs leading-5 text-slate-400">
                            GST is optional. If provided, it must be a valid
                            GSTIN and cannot already be registered with another
                            store.
                        </p>
                    </div>
                </section>


                {/* =================================================
                    SAVE BAR
                ================================================= */}

                <div className="sticky bottom-3 z-30">
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <div className="hidden min-w-0 sm:block">
                            <p className="text-xs font-black text-slate-700">
                                {isDirty
                                    ? "You have unsaved changes"
                                    : "Your store profile is up to date"}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                                Store availability is managed separately.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {isDirty && (
                                <button
                                    type="button"
                                    onClick={fetchProfile}
                                    disabled={saving}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                                >
                                    Discard
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || !isDirty}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:flex-none"
                            >
                                {saving ? (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Save size={17} />
                                )}

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}