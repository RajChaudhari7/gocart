"use client";

import { useEffect, useState } from "react";
import {
    Banknote,
    CheckCircle2,
    Loader2,
    Save,
    ShieldCheck,
    Smartphone,
} from "lucide-react";
import { toast } from "sonner";

export default function SellerPayoutProfilePage() {
    const [method, setMethod] = useState("BANK");

    const [accountHolderName, setAccountHolderName] =
        useState("");

    const [accountNumber, setAccountNumber] =
        useState("");

    const [ifsc, setIfsc] = useState("");

    const [upiId, setUpiId] = useState("");

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                "/api/store/payout-profile",
                {
                    cache: "no-store",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Failed to load payout profile"
                );
            }

            if (data.profile) {
                const p = data.profile;

                setProfile(p);
                setMethod(p.method || "BANK");

                setAccountHolderName(
                    p.accountHolderName || ""
                );

                setAccountNumber(
                    p.accountNumber || ""
                );

                setIfsc(p.ifsc || "");

                setUpiId(p.upiId || "");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const res = await fetch(
                "/api/store/payout-profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        method,
                        accountHolderName,
                        accountNumber,
                        ifsc,
                        upiId,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Failed to save payout profile"
                );
            }

            setProfile(data.profile);

            toast.success(
                "Payout profile saved. Admin verification is required."
            );
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Payout Settings
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Configure where your seller earnings
                        should be paid.
                    </p>
                </div>

                {/* Verification status */}

                <div
                    className={`mb-6 rounded-xl border p-5 ${profile?.isVerified
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-amber-200 bg-amber-50"
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {profile?.isVerified ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                        ) : (
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-600" />
                        )}

                        <div>
                            <p className="font-medium text-gray-900">
                                {profile?.isVerified
                                    ? "Payout account verified"
                                    : "Verification required"}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                                {profile?.isVerified
                                    ? "Your payout account is verified and can receive seller payouts."
                                    : "After saving your payout details, an admin must verify them before payouts can be created."}
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Payment Method
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Choose how you want to receive
                            your earnings.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* BANK */}

                        <button
                            type="button"
                            onClick={() =>
                                setMethod("BANK")
                            }
                            className={`rounded-xl border p-5 text-left transition ${method === "BANK"
                                    ? "border-black bg-gray-50"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            <Banknote className="mb-3 h-6 w-6" />

                            <p className="font-medium text-gray-900">
                                Bank Account
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Receive payouts directly
                                into your bank account.
                            </p>
                        </button>

                        {/* UPI */}

                        <button
                            type="button"
                            onClick={() =>
                                setMethod("UPI")
                            }
                            className={`rounded-xl border p-5 text-left transition ${method === "UPI"
                                    ? "border-black bg-gray-50"
                                    : "border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            <Smartphone className="mb-3 h-6 w-6" />

                            <p className="font-medium text-gray-900">
                                UPI
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Receive payouts using
                                your UPI ID.
                            </p>
                        </button>
                    </div>

                    {/* Account holder */}

                    <div className="mt-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Account Holder Name
                        </label>

                        <input
                            value={accountHolderName}
                            onChange={(e) =>
                                setAccountHolderName(
                                    e.target.value
                                )
                            }
                            placeholder="Enter account holder name"
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                        />
                    </div>

                    {/* BANK */}

                    {method === "BANK" && (
                        <div className="mt-6 space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Account Number
                                </label>

                                <input
                                    value={accountNumber}
                                    onChange={(e) =>
                                        setAccountNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter bank account number"
                                    inputMode="numeric"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    IFSC Code
                                </label>

                                <input
                                    value={ifsc}
                                    onChange={(e) =>
                                        setIfsc(
                                            e.target.value
                                                .toUpperCase()
                                        )
                                    }
                                    placeholder="Example: SBIN0001234"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 uppercase outline-none focus:border-black"
                                />
                            </div>
                        </div>
                    )}

                    {/* UPI */}

                    {method === "UPI" && (
                        <div className="mt-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                UPI ID
                            </label>

                            <input
                                value={upiId}
                                onChange={(e) =>
                                    setUpiId(
                                        e.target.value
                                            .toLowerCase()
                                    )
                                }
                                placeholder="example@upi"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Payout Details
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}