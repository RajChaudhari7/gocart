"use client";

import { useEffect, useState } from "react";

import {
    CheckCircle2,
    Clock3,
    Loader2,
    Search,
    ShieldCheck,
    Store,
    XCircle,
} from "lucide-react";

import { toast } from "sonner";

const STATUS_OPTIONS = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending Verification" },
    { value: "VERIFIED", label: "Verified" },
    { value: "INACTIVE", label: "Inactive" },
];

function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function StatusBadge({ profile }) {
    if (!profile.isActive) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                <XCircle className="h-3.5 w-3.5" />
                Inactive
            </span>
        );
    }

    if (profile.isVerified) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <Clock3 className="h-3.5 w-3.5" />
            Pending
        </span>
    );
}

function maskAccountNumber(accountNumber) {
    if (!accountNumber) return "-";

    const value = String(accountNumber);

    if (value.length <= 4) {
        return `•••• ${value}`;
    }

    return `•••• •••• ${value.slice(-4)}`;
}

function ProfileDetails({ profile }) {
    return (
        <div className="mt-5 grid gap-4 rounded-xl bg-gray-50 p-5 sm:grid-cols-2">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Payment Method
                </p>

                <p className="mt-1 font-medium text-gray-900">
                    {profile.method === "BANK"
                        ? "Bank Account"
                        : "UPI"}
                </p>
            </div>

            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Account Holder
                </p>

                <p className="mt-1 font-medium text-gray-900">
                    {profile.accountHolderName || "-"}
                </p>
            </div>

            {profile.method === "BANK" ? (
                <>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Account Number
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                            {maskAccountNumber(
                                profile.accountNumber
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            IFSC
                        </p>

                        <p className="mt-1 font-medium uppercase text-gray-900">
                            {profile.ifsc || "-"}
                        </p>
                    </div>
                </>
            ) : (
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        UPI ID
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                        {profile.upiId || "-"}
                    </p>
                </div>
            )}

            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Last Updated
                </p>

                <p className="mt-1 font-medium text-gray-900">
                    {formatDate(profile.updatedAt)}
                </p>
            </div>
        </div>
    );
}

export default function SellerPayoutAccountsPage() {
    const [profiles, setProfiles] = useState([]);

    const [status, setStatus] =
        useState("PENDING");

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [updatingId, setUpdatingId] =
        useState(null);

    const fetchProfiles = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            params.set("status", status);

            if (search.trim()) {
                params.set(
                    "search",
                    search.trim()
                );
            }

            const res = await fetch(
                `/api/admin/seller-payout-profiles?${params.toString()}`,
                {
                    cache: "no-store",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Failed to load payout accounts"
                );
            }

            setProfiles(data.profiles || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, [status]);

    const handleSearch = (e) => {
        e.preventDefault();

        fetchProfiles();
    };

    const updateProfile = async (
        profileId,
        action
    ) => {
        try {
            setUpdatingId(profileId);

            const res = await fetch(
                "/api/admin/seller-payout-profiles",
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        profileId,
                        action,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Failed to update payout profile"
                );
            }

            toast.success(data.message);

            await fetchProfiles();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const pendingCount = profiles.filter(
        (profile) =>
            !profile.isVerified &&
            profile.isActive
    ).length;

    const verifiedCount = profiles.filter(
        (profile) =>
            profile.isVerified &&
            profile.isActive
    ).length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}

                <div className="mb-8">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-black p-3">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Seller Payout Accounts
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Review and verify seller bank
                                and UPI payout details.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <p className="text-sm text-amber-700">
                            Pending Verification
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {pendingCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <p className="text-sm text-emerald-700">
                            Verified Accounts
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {verifiedCount}
                        </p>
                    </div>
                </div>

                {/* Filters */}

                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
                    <form
                        onSubmit={handleSearch}
                        className="grid gap-4 md:grid-cols-[1fr_220px_160px]"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search seller or store..."
                                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-black"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(
                                    e.target.value
                                )
                            }
                            className="rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                        >
                            {STATUS_OPTIONS.map(
                                (option) => (
                                    <option
                                        key={
                                            option.value
                                        }
                                        value={
                                            option.value
                                        }
                                    >
                                        {option.label}
                                    </option>
                                )
                            )}
                        </select>

                        <button
                            type="submit"
                            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Profiles */}

                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
                        <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                        <Store className="mx-auto h-10 w-10 text-gray-300" />

                        <h3 className="mt-4 font-medium text-gray-900">
                            No payout accounts found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Seller payout accounts matching
                            your filters will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {profiles.map((profile) => (
                            <div
                                key={profile.id}
                                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                            >
                                {/* Seller header */}

                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex items-center gap-4">
                                        {profile.store?.logo ? (
                                            <img
                                                src={
                                                    profile
                                                        .store
                                                        .logo
                                                }
                                                alt=""
                                                className="h-12 w-12 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                                                <Store className="h-5 w-5 text-gray-500" />
                                            </div>
                                        )}

                                        <div>
                                            <h2 className="font-semibold text-gray-900">
                                                {profile
                                                    .store
                                                    ?.name ||
                                                    "Unknown Store"}
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                @
                                                {profile
                                                    .store
                                                    ?.username ||
                                                    "-"}
                                            </p>

                                            {profile
                                                .store
                                                ?.email && (
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {
                                                            profile
                                                                .store
                                                                .email
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    </div>

                                    <StatusBadge
                                        profile={profile}
                                    />
                                </div>

                                <ProfileDetails
                                    profile={profile}
                                />

                                {/* Actions */}

                                <div className="mt-5 flex flex-wrap justify-end gap-3">
                                    {!profile.isVerified &&
                                        profile.isActive && (
                                            <button
                                                type="button"
                                                disabled={
                                                    updatingId ===
                                                    profile.id
                                                }
                                                onClick={() =>
                                                    updateProfile(
                                                        profile.id,
                                                        "VERIFY"
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                                            >
                                                {updatingId ===
                                                    profile.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}

                                                Verify Account
                                            </button>
                                        )}

                                    {profile.isActive ? (
                                        <button
                                            type="button"
                                            disabled={
                                                updatingId ===
                                                profile.id
                                            }
                                            onClick={() =>
                                                updateProfile(
                                                    profile.id,
                                                    "DISABLE"
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                        >
                                            <XCircle className="h-4 w-4" />

                                            Disable
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={
                                                updatingId ===
                                                profile.id
                                            }
                                            onClick={() =>
                                                updateProfile(
                                                    profile.id,
                                                    "ENABLE"
                                                )
                                            }
                                            className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                        >
                                            Enable
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}