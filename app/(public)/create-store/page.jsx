"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Check,
    CheckCircle2,
    Clock,
    ImagePlus,
    MapPin,
    Store,
    UserRound,
    Mail,
    Phone,
    FileText,
    Tag,
    ArrowRight,
    XCircle,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/Loading";

const CATEGORIES = [
    "Clothing",
    "Electronics",
    "Grocery",
    "Stationery",
    "Bakery",
    "Other",
];

export default function CreateStore() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();

    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(5);

    // GST is optional
    const [gstValid, setGstValid] = useState(true);
    const [gstError, setGstError] = useState("");

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: "",
        gst: "",
        category: "",
        customCategory: "",
        latitude: "",
        longitude: "",
    });

    /* -------------------------------------------------
       GST VALIDATION
    ------------------------------------------------- */

    const validateGST = (gst) => {
        // GST is optional
        if (!gst) {
            setGstError("");
            setGstValid(true);
            return;
        }

        const gstRegex =
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

        if (!gstRegex.test(gst)) {
            setGstError("Invalid GST format");
            setGstValid(false);
            return;
        }

        setGstError("");
        setGstValid(true);
    };

    /* -------------------------------------------------
       INPUT HANDLER
    ------------------------------------------------- */

    const onChangeHandler = (e) => {
        const { name, value } = e.target;

        // Contact number
        if (name === "contact") {
            const val = value.replace(/\D/g, "");

            if (val.length > 10) return;

            setStoreInfo((prev) => ({
                ...prev,
                contact: val,
            }));

            return;
        }

        // GST number
        if (name === "gst") {
            const val = value.toUpperCase();

            setStoreInfo((prev) => ({
                ...prev,
                gst: val,
            }));

            // GST optional
            if (!val) {
                setGstValid(true);
                setGstError("");
                return;
            }

            if (val.length === 15) {
                validateGST(val);
            } else {
                setGstValid(false);
                setGstError("GST must be exactly 15 characters");
            }

            return;
        }

        setStoreInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* -------------------------------------------------
       FETCH SELLER STATUS
    ------------------------------------------------- */

    const fetchSellerStatus = async () => {
        try {
            const token = await getToken();

            const { data } = await axios.get("/api/store/create", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (
                ["approved", "rejected", "pending"].includes(
                    data.status
                )
            ) {
                setStatus(data.status);
                setAlreadySubmitted(true);

                switch (data.status) {
                    case "approved":
                        setMessage(
                            "Your store has been approved. You can now manage your products and start selling on GlobalMart."
                        );
                        setCountdown(5);
                        break;

                    case "rejected":
                        setMessage(
                            "Your store application was rejected. Please contact the administration for more details."
                        );
                        break;

                    case "pending":
                        setMessage(
                            "Your store application is currently under review. We will notify you once the administration completes the review."
                        );
                        break;

                    default:
                        break;
                }
            } else {
                setAlreadySubmitted(false);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.error ||
                error?.message ||
                "Unable to check store status"
            );
        } finally {
            setLoading(false);
        }
    };

    /* -------------------------------------------------
       SUBMIT STORE
    ------------------------------------------------- */

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!user) {
            return toast.error("Please login to continue");
        }

        if (storeInfo.contact.length !== 10) {
            return toast.error(
                "Contact number must be 10 digits"
            );
        }

        if (!storeInfo.name.trim()) {
            return toast.error("Please enter your store name");
        }

        if (!storeInfo.username.trim()) {
            return toast.error("Please enter a username");
        }

        if (!storeInfo.description.trim()) {
            return toast.error(
                "Please enter a store description"
            );
        }

        if (!storeInfo.email.trim()) {
            return toast.error("Please enter your email");
        }

        if (!storeInfo.address.trim()) {
            return toast.error(
                "Please enter your business address"
            );
        }

        if (!storeInfo.image) {
            return toast.error("Please upload your store logo");
        }

        if (!storeInfo.category) {
            return toast.error(
                "Please select a store category"
            );
        }

        if (
            storeInfo.category === "Other" &&
            !storeInfo.customCategory.trim()
        ) {
            return toast.error(
                "Please enter your custom category"
            );
        }

        if (!storeInfo.latitude || !storeInfo.longitude) {
            return toast.error(
                "Please select your business location"
            );
        }

        if (!gstValid) {
            return toast.error(
                "Please enter a valid GST number or leave it empty"
            );
        }

        try {
            const token = await getToken();

            const formData = new FormData();

            Object.keys(storeInfo).forEach((key) => {
                formData.append(key, storeInfo[key]);
            });

            const { data } = await axios.post(
                "/api/store/create",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(data.message);

            await fetchSellerStatus();
        } catch (error) {
            toast.error(
                error?.response?.data?.error ||
                error?.message ||
                "Failed to create store"
            );
        }
    };

    /* -------------------------------------------------
       REDIRECT AFTER APPROVAL
    ------------------------------------------------- */

    useEffect(() => {
        if (status !== "approved") return;

        if (countdown === 0) {
            router.push("/store");
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [status, countdown, router]);

    /* -------------------------------------------------
       FETCH STATUS WHEN USER LOADS
    ------------------------------------------------- */

    useEffect(() => {
        if (user) {
            fetchSellerStatus();
        }
    }, [user]);

    /* -------------------------------------------------
       CURRENT LOCATION
    ------------------------------------------------- */

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            return toast.error(
                "Geolocation is not supported by your browser"
            );
        }

        toast.loading("Detecting your location...", {
            id: "location",
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setStoreInfo((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));

                toast.success("Business location captured", {
                    id: "location",
                });
            },
            (error) => {
                console.error("Location error:", error);

                toast.error(
                    "Location permission denied. Please allow location access.",
                    {
                        id: "location",
                    }
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    /* -------------------------------------------------
       INPUT STYLES
    ------------------------------------------------- */

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

    const labelClass =
        "mb-2 block text-sm font-semibold text-slate-800";

    /* -------------------------------------------------
       NOT LOGGED IN
    ------------------------------------------------- */

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-16">
                <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
                    <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                            <ShieldCheck
                                size={32}
                                className="text-indigo-600"
                            />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Login Required
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Please login to your GlobalMart account
                            before creating a store.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* -------------------------------------------------
       MAIN
    ------------------------------------------------- */

    return !loading ? (
        <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            {!alreadySubmitted ? (
                <div className="mx-auto max-w-4xl">
                    {/* -----------------------------------------
                        HEADER
                    ----------------------------------------- */}

                    <div className="mb-10 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold tracking-wide text-indigo-700">
                            <Store size={15} />
                            SELLER ONBOARDING
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Create your store
                        </h1>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                            Set up your store profile and start
                            showcasing your products on GlobalMart.
                        </p>
                    </div>

                    {/* -----------------------------------------
                        FORM
                    ----------------------------------------- */}

                    <form
                        onSubmit={(e) =>
                            toast.promise(onSubmitHandler(e), {
                                loading:
                                    "Setting up your store...",
                            })
                        }
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.07)]"
                    >
                        <div className="p-6 sm:p-10">
                            {/* =================================
                                01 STORE PROFILE
                            ================================= */}

                            <section>
                                <SectionHeader
                                    number="01"
                                    icon={<Store size={18} />}
                                    title="Store Profile"
                                    description="Tell customers a little about your store."
                                />

                                <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-6">
                                    {/* LOGO */}

                                    <div className="col-span-full">
                                        <label className={labelClass}>
                                            Store Logo
                                        </label>

                                        <div className="flex flex-col gap-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center">
                                            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                                {storeInfo.image ? (
                                                    <Image
                                                        src={URL.createObjectURL(
                                                            storeInfo.image
                                                        )}
                                                        alt="Store logo preview"
                                                        width={96}
                                                        height={96}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ImagePlus
                                                        size={32}
                                                        strokeWidth={
                                                            1.5
                                                        }
                                                        className="text-slate-400"
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900">
                                                    Upload your store
                                                    logo
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    Use a clear PNG,
                                                    JPG or WEBP image.
                                                    Recommended size:
                                                    512 × 512px.
                                                </p>

                                                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                                                    <ImagePlus
                                                        size={16}
                                                    />
                                                    Choose Logo

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        onChange={(e) => {
                                                            const file =
                                                                e
                                                                    .target
                                                                    .files?.[0];

                                                            if (
                                                                file
                                                            ) {
                                                                setStoreInfo(
                                                                    (
                                                                        prev
                                                                    ) => ({
                                                                        ...prev,
                                                                        image: file,
                                                                    })
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* USERNAME */}

                                    <div className="sm:col-span-3">
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Store Username
                                        </label>

                                        <div className="relative">
                                            <UserRound
                                                size={17}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                name="username"
                                                value={
                                                    storeInfo.username
                                                }
                                                onChange={
                                                    onChangeHandler
                                                }
                                                type="text"
                                                placeholder="yourstore"
                                                className={`${inputClass} pl-11`}
                                            />
                                        </div>
                                    </div>

                                    {/* STORE NAME */}

                                    <div className="sm:col-span-3">
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Store Name
                                        </label>

                                        <div className="relative">
                                            <Store
                                                size={17}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                name="name"
                                                value={
                                                    storeInfo.name
                                                }
                                                onChange={
                                                    onChangeHandler
                                                }
                                                type="text"
                                                placeholder="e.g. Raj General Store"
                                                className={`${inputClass} pl-11`}
                                            />
                                        </div>
                                    </div>

                                    {/* DESCRIPTION */}

                                    <div className="col-span-full">
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Store Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                storeInfo.description
                                            }
                                            onChange={
                                                onChangeHandler
                                            }
                                            rows={4}
                                            placeholder="Describe what your store sells and what makes it special..."
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                </div>
                            </section>

                            <Divider />

                            {/* =================================
                                02 CONTACT DETAILS
                            ================================= */}

                            <section>
                                <SectionHeader
                                    number="02"
                                    icon={<Phone size={18} />}
                                    title="Contact Details"
                                    description="Add the details customers and GlobalMart support can use to reach you."
                                />

                                <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {/* EMAIL */}

                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Support Email
                                        </label>

                                        <div className="relative">
                                            <Mail
                                                size={17}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                name="email"
                                                value={
                                                    storeInfo.email
                                                }
                                                onChange={
                                                    onChangeHandler
                                                }
                                                type="email"
                                                placeholder="store@example.com"
                                                className={`${inputClass} pl-11`}
                                            />
                                        </div>
                                    </div>

                                    {/* PHONE */}

                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Business Phone
                                        </label>

                                        <div className="relative">
                                            <Phone
                                                size={17}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                name="contact"
                                                value={
                                                    storeInfo.contact
                                                }
                                                onChange={
                                                    onChangeHandler
                                                }
                                                type="text"
                                                maxLength={10}
                                                placeholder="10-digit mobile number"
                                                className={`${inputClass} pl-11`}
                                            />
                                        </div>

                                        {storeInfo.contact.length >
                                            0 &&
                                            storeInfo.contact
                                                .length !==
                                            10 && (
                                                <p className="mt-2 text-xs font-medium text-rose-500">
                                                    Enter a valid
                                                    10-digit phone
                                                    number.
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </section>

                            <Divider />

                            {/* =================================
                                03 BUSINESS & LOCATION
                            ================================= */}

                            <section>
                                <SectionHeader
                                    number="03"
                                    icon={<MapPin size={18} />}
                                    title="Business & Location"
                                    description="Provide your business address and location for delivery serviceability."
                                />

                                <div className="mt-7 space-y-6">
                                    {/* GST */}

                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label
                                                className={`${labelClass} mb-0`}
                                            >
                                                GST Number
                                            </label>

                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                                                OPTIONAL
                                            </span>
                                        </div>

                                        <input
                                            name="gst"
                                            value={
                                                storeInfo.gst
                                            }
                                            onChange={
                                                onChangeHandler
                                            }
                                            type="text"
                                            maxLength={15}
                                            placeholder="Enter 15-character GSTIN if applicable"
                                            className={inputClass}
                                        />

                                        <p className="mt-2 text-xs text-slate-400">
                                            Leave this empty if your
                                            business does not have a
                                            GST registration.
                                        </p>

                                        {storeInfo.gst.length >
                                            0 && (
                                                <div className="mt-3">
                                                    {gstValid ? (
                                                        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                                                            <CheckCircle2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            Valid GSTIN
                                                        </p>
                                                    ) : (
                                                        <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-500">
                                                            <XCircle
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            {gstError}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                    </div>

                                    {/* ADDRESS */}

                                    <div>
                                        <label
                                            className={
                                                labelClass
                                            }
                                        >
                                            Business Address
                                        </label>

                                        <div className="relative">
                                            <FileText
                                                size={17}
                                                className="absolute left-4 top-4 text-slate-400"
                                            />

                                            <textarea
                                                name="address"
                                                value={
                                                    storeInfo.address
                                                }
                                                onChange={
                                                    onChangeHandler
                                                }
                                                rows={4}
                                                placeholder="Complete business address..."
                                                className={`${inputClass} resize-none pl-11`}
                                            />
                                        </div>
                                    </div>

                                    {/* LOCATION */}

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                                    <MapPin
                                                        size={21}
                                                    />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        Business
                                                        Location
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        Your location
                                                        helps us determine
                                                        delivery
                                                        availability.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={
                                                    getCurrentLocation
                                                }
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
                                            >
                                                <MapPin
                                                    size={17}
                                                />
                                                Use My Location
                                            </button>
                                        </div>

                                        {storeInfo.latitude &&
                                            storeInfo.longitude && (
                                                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                                    <CheckCircle2
                                                        size={17}
                                                    />
                                                    Business location
                                                    captured successfully
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </section>

                            <Divider />

                            {/* =================================
                                04 CATEGORY
                            ================================= */}

                            <section>
                                <SectionHeader
                                    number="04"
                                    icon={<Tag size={18} />}
                                    title="Store Category"
                                    description="Choose the category that best represents your business."
                                />

                                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                                    {CATEGORIES.map((cat) => {
                                        const isActive =
                                            storeInfo.category ===
                                            cat;

                                        return (
                                            <button
                                                type="button"
                                                key={cat}
                                                onClick={() =>
                                                    setStoreInfo(
                                                        (prev) => ({
                                                            ...prev,
                                                            category:
                                                                cat,
                                                            customCategory:
                                                                cat ===
                                                                    "Other"
                                                                    ? prev.customCategory
                                                                    : "",
                                                        })
                                                    )
                                                }
                                                className={`group relative flex min-h-[76px] items-center justify-center rounded-2xl border px-3 text-center text-sm font-semibold transition-all duration-200 ${isActive
                                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-4 ring-indigo-500/10"
                                                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600"
                                                    }`}
                                            >
                                                {isActive && (
                                                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                                                        <Check
                                                            size={12}
                                                        />
                                                    </span>
                                                )}

                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>

                                {storeInfo.category ===
                                    "Other" && (
                                        <div className="mt-5">
                                            <label
                                                className={
                                                    labelClass
                                                }
                                            >
                                                Custom Category
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    storeInfo.customCategory
                                                }
                                                onChange={(e) =>
                                                    setStoreInfo(
                                                        (prev) => ({
                                                            ...prev,
                                                            customCategory:
                                                                e
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                placeholder="e.g. Hardware, Cosmetics, Furniture..."
                                                className={inputClass}
                                            />
                                        </div>
                                    )}
                            </section>
                        </div>

                        {/* =================================
                            SUBMIT FOOTER
                        ================================= */}

                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 sm:px-10">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Ready to launch?
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Your application will be
                                        reviewed by the GlobalMart
                                        team.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        !gstValid ||
                                        storeInfo.contact.length !==
                                        10 ||
                                        !storeInfo.name.trim() ||
                                        !storeInfo.username.trim() ||
                                        !storeInfo.description.trim() ||
                                        !storeInfo.email.trim() ||
                                        !storeInfo.address.trim() ||
                                        !storeInfo.image ||
                                        !storeInfo.category ||
                                        !storeInfo.latitude ||
                                        !storeInfo.longitude ||
                                        (storeInfo.category ===
                                            "Other" &&
                                            !storeInfo.customCategory.trim())
                                    }
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold transition-all duration-200 ${gstValid &&
                                            storeInfo.contact.length ===
                                            10 &&
                                            storeInfo.name.trim() &&
                                            storeInfo.username.trim() &&
                                            storeInfo.description.trim() &&
                                            storeInfo.email.trim() &&
                                            storeInfo.address.trim() &&
                                            storeInfo.image &&
                                            storeInfo.category &&
                                            storeInfo.latitude &&
                                            storeInfo.longitude &&
                                            !(
                                                storeInfo.category ===
                                                "Other" &&
                                                !storeInfo.customCategory.trim()
                                            )
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
                                            : "cursor-not-allowed bg-slate-200 text-slate-400"
                                        }`}
                                >
                                    Submit Application
                                    <ArrowRight size={17} />
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* TRUST NOTE */}

                    <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                        <ShieldCheck
                            size={15}
                            className="text-emerald-500"
                        />
                        Your business information is securely
                        handled by GlobalMart.
                    </div>
                </div>
            ) : (
                /* =========================================
                   APPLICATION STATUS
                ========================================= */

                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-12">
                        {/* STATUS ICON */}

                        <div className="mb-7 flex justify-center">
                            {status === "approved" && (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                                    <CheckCircle2
                                        size={48}
                                        strokeWidth={1.7}
                                        className="text-emerald-500"
                                    />
                                </div>
                            )}

                            {status === "pending" && (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                                    <Clock
                                        size={48}
                                        strokeWidth={1.7}
                                        className="text-amber-500"
                                    />
                                </div>
                            )}

                            {status === "rejected" && (
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
                                    <XCircle
                                        size={48}
                                        strokeWidth={1.7}
                                        className="text-rose-500"
                                    />
                                </div>
                            )}
                        </div>

                        {/* TITLE */}

                        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            {status === "approved" &&
                                "Application Approved!"}

                            {status === "pending" &&
                                "Application Under Review"}

                            {status === "rejected" &&
                                "Application Rejected"}
                        </h2>

                        {/* MESSAGE */}

                        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
                            {message}
                        </p>

                        {/* APPROVED */}

                        {status === "approved" && (
                            <div className="mt-8">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    Redirecting to dashboard in{" "}
                                    {countdown}s
                                </div>
                            </div>
                        )}

                        {/* PENDING */}

                        {status === "pending" && (
                            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700">
                                <Clock size={16} />
                                Application is being reviewed
                            </div>
                        )}

                        {/* REJECTED */}

                        {status === "rejected" && (
                            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
                                <XCircle size={16} />
                                Please contact administration
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    ) : (
        <Loading />
    );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
    number,
    icon,
    title,
    description,
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                {icon}
            </div>

            <div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-widest text-indigo-500">
                        {number}
                    </span>

                    <span className="text-xs text-slate-300">
                        /
                    </span>

                    <h2 className="text-lg font-bold text-slate-900">
                        {title}
                    </h2>
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   DIVIDER
========================================================= */

function Divider() {
    return (
        <div className="my-10 border-t border-slate-100" />
    );
}