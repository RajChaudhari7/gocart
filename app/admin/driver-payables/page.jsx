
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    RefreshCw,
    Search,
    Wallet,
    Clock,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Truck,
    X,
    ReceiptText,
} from "lucide-react";

const money = (amount = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);

const dateText = (date) =>
    date ? new Date(date).toLocaleString("en-IN") : "—";

const statusClass = {
    PENDING: "bg-amber-100 text-amber-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SUCCESS: "bg-emerald-100 text-emerald-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-700",
};

export default function DriverPayablesPage() {
    const [data, setData] = useState({
        payables: [],
        payouts: [],
        summary: {
            availableAmount: 0,
            availableCount: 0,
            inProgressAmount: 0,
            paidAmount: 0,
        },
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [reference, setReference] = useState("");
    const [note, setNote] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = new URLSearchParams({
                search,
                status,
            });

            const response = await fetch(
                `/api/admin/driver-payables?${params.toString()}`,
                { cache: "no-store" }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to load driver payables");
            }

            setData({
                payables: result.payables || [],
                payouts: result.payouts || [],
                summary: result.summary || {},
            });
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => {
        const timer = setTimeout(() => loadData(), 250);
        return () => clearTimeout(timer);
    }, [loadData]);

    const selectedEarnings = useMemo(() => {
        if (!selectedDriver) return [];

        return selectedDriver.earnings.filter((earning) =>
            selectedIds.includes(earning.id)
        );
    }, [selectedDriver, selectedIds]);

    const selectedAmount = selectedEarnings.reduce(
        (sum, earning) => sum + earning.amount,
        0
    );

    function openPayout(driver) {
        setSelectedDriver(driver);
        setSelectedIds(driver.earnings.map((earning) => earning.id));
        setReference("");
        setNote("");
        setError("");
        setNotice("");
    }

    function toggleEarning(id) {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id]
        );
    }

    async function recordPayout(event) {
        event.preventDefault();

        if (!selectedDriver || !selectedIds.length) {
            setError("Select at least one available earning.");
            return;
        }

        if (!reference.trim()) {
            setError("Enter the bank/UPI transaction reference.");
            return;
        }

        const confirmed = window.confirm(
            `Confirm that ₹${selectedAmount.toFixed(2)} has already been transferred to ${selectedDriver.name}?`
        );

        if (!confirmed) return;

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/admin/driver-payables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    driverId: selectedDriver.id,
                    earningIds: selectedIds,
                    transactionReference: reference.trim(),
                    note: note.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to record payout");
            }

            setSelectedDriver(null);
            setSelectedIds([]);
            setReference("");
            setNote("");
            setNotice("Manual payout recorded successfully.");
            await loadData();
        } catch (err) {
            setError(err.message || "Unable to record payout");
        } finally {
            setSubmitting(false);
        }
    }

    const summary = data.summary || {};

    return (
        <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                            GoCart Administration
                        </p>
                        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                            Driver Payables
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Review driver earnings and record completed manual payments.
                        </p>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-100 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                        <button
                            onClick={() => setError("")}
                            className="ml-auto"
                            aria-label="Dismiss error"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {notice && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        {notice}
                    </div>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: "Available to Pay",
                            value: money(summary.availableAmount),
                            detail: `${summary.availableCount || 0} earnings`,
                            icon: Wallet,
                            color: "text-indigo-600 bg-indigo-50",
                        },
                        {
                            label: "In Progress",
                            value: money(summary.inProgressAmount),
                            detail: "Pending / processing payouts",
                            icon: Clock,
                            color: "text-amber-600 bg-amber-50",
                        },
                        {
                            label: "Successfully Paid",
                            value: money(summary.paidAmount),
                            detail: "Recorded successful payouts",
                            icon: CheckCircle2,
                            color: "text-emerald-600 bg-emerald-50",
                        },
                        {
                            label: "Drivers",
                            value: data.payables.length,
                            detail: "Matching driver records",
                            icon: Truck,
                            color: "text-sky-600 bg-sky-50",
                        },
                    ].map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">{card.label}</p>
                                        <p className="mt-2 text-2xl font-bold">{card.value}</p>
                                    </div>
                                    <div className={`rounded-xl p-3 ${card.color}`}>
                                        <Icon size={21} />
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-slate-500">{card.detail}</p>
                            </div>
                        );
                    })}
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold">Driver balances</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Select available earnings to record a completed payment.
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search name or phone"
                                className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-slate-500">
                            Loading driver payables…
                        </div>
                    ) : data.payables.length === 0 ? (
                        <div className="p-12 text-center">
                            <Truck className="mx-auto text-slate-300" size={32} />
                            <p className="mt-3 font-semibold">No drivers found</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Try another search term.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Driver</th>
                                        <th className="px-5 py-3">Available earnings</th>
                                        <th className="px-5 py-3">Available balance</th>
                                        <th className="px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.payables.map((driver) => (
                                        <tr key={driver.id} className="hover:bg-slate-50/70">
                                            <td className="px-5 py-4">
                                                <p className="font-semibold">{driver.name}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {driver.phone}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                                    {driver.availableCount}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-bold">
                                                {money(driver.availableAmount)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    disabled={!driver.earnings.length}
                                                    onClick={() => openPayout(driver)}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <CreditCard size={15} />
                                                    Record payout
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold">Driver payout ledger</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Historical payouts and transaction references.
                            </p>
                        </div>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            Loading payout history…
                        </div>
                    ) : data.payouts.length === 0 ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            <ReceiptText className="mx-auto mb-2 text-slate-300" size={30} />
                            No driver payouts match these filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Driver</th>
                                        <th className="px-5 py-3">Amount</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Transaction reference</th>
                                        <th className="px-5 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.payouts.map((payout) => (
                                        <tr key={payout.id} className="hover:bg-slate-50/70">
                                            <td className="px-5 py-4">
                                                <p className="font-semibold">
                                                    {payout.driver?.name || "Unknown driver"}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {payout.driver?.phone || "—"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 font-bold">
                                                {money(payout.amount)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[payout.status] ||
                                                        "bg-slate-100 text-slate-700"
                                                        }`}
                                                >
                                                    {payout.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="max-w-56 break-all font-medium">
                                                    {payout.providerPayoutId || "—"}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {payout.provider || "Manual"}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                                {dateText(payout.processedAt || payout.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <p className="text-xs leading-5 text-slate-500">
                    Manual payouts are recorded only after the real transfer is completed.
                    This page does not initiate bank, UPI, or RazorpayX transfers.
                </p>
            </div>

            {selectedDriver && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !submitting) {
                            setSelectedDriver(null);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payout-modal-title"
                        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
                            <div>
                                <h2 id="payout-modal-title" className="text-lg font-bold">
                                    Record manual payout
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedDriver.name} · {selectedDriver.phone}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDriver(null)}
                                disabled={submitting}
                                aria-label="Close payout dialog"
                                className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={recordPayout} className="space-y-5 p-5">
                            <div className="rounded-xl bg-indigo-50 p-4">
                                <p className="text-sm text-indigo-700">
                                    Selected payout total
                                </p>
                                <p className="mt-1 text-2xl font-bold text-indigo-950">
                                    {money(selectedAmount)}
                                </p>
                                <p className="mt-1 text-xs text-indigo-700">
                                    {selectedEarnings.length} selected earnings
                                </p>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label className="font-semibold">
                                        Available earnings
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedIds(
                                                selectedDriver.earnings.map((earning) => earning.id)
                                            )
                                        }
                                        className="text-xs font-semibold text-indigo-600 hover:underline"
                                    >
                                        Select all
                                    </button>
                                </div>

                                <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border p-3">
                                    {selectedDriver.earnings.map((earning) => (
                                        <label
                                            key={earning.id}
                                            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(earning.id)}
                                                onChange={() => toggleEarning(earning.id)}
                                                className="mt-1 accent-indigo-600"
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block break-all text-sm font-medium">
                                                    Order: {earning.orderId}
                                                </span>
                                                <span className="mt-1 block text-xs text-slate-500">
                                                    {earning.type} · {dateText(earning.createdAt)}
                                                </span>
                                            </span>
                                            <span className="whitespace-nowrap text-sm font-bold">
                                                {money(earning.amount)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="transactionReference"
                                    className="mb-1.5 block text-sm font-semibold"
                                >
                                    Bank / UPI transaction reference *
                                </label>
                                <input
                                    id="transactionReference"
                                    required
                                    maxLength={150}
                                    value={reference}
                                    onChange={(event) => setReference(event.target.value)}
                                    placeholder="Enter actual UTR or transaction ID"
                                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="payoutNote"
                                    className="mb-1.5 block text-sm font-semibold"
                                >
                                    Admin note (optional)
                                </label>
                                <textarea
                                    id="payoutNote"
                                    maxLength={500}
                                    rows={2}
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                    placeholder="Optional internal note"
                                    className="w-full resize-y rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                                Only continue if this money has already been transferred.
                                Submitting records the payout as successful and marks the
                                selected earnings as paid. It will not send money.
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !selectedIds.length ||
                                    !reference.trim() ||
                                    selectedAmount <= 0
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <CreditCard size={17} />
                                {submitting
                                    ? "Recording payout…"
                                    : `Confirm completed payout · ${money(selectedAmount)}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
