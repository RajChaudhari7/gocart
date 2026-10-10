"use client"

import { useEffect, useState } from "react"

import {
    RefreshCw,
    Search,
    Store,
    Wallet,
    Clock,
    CheckCircle,
    AlertCircle,
    CreditCard,
} from "lucide-react"

const STATUS_OPTIONS = [
    "ALL",
    "PENDING",
    "PROCESSING",
    "SUCCESS",
    "FAILED",
    "CANCELLED",
]

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`
}

function formatDate(date) {
    if (!date) return "-"

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function StatusBadge({ status }) {
    const styles = {
        PENDING:
            "bg-amber-50 text-amber-700 border-amber-200",

        PROCESSING:
            "bg-blue-50 text-blue-700 border-blue-200",

        SUCCESS:
            "bg-emerald-50 text-emerald-700 border-emerald-200",

        FAILED:
            "bg-red-50 text-red-700 border-red-200",

        CANCELLED:
            "bg-gray-100 text-gray-600 border-gray-200",
    }

    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${styles[status] ||
                "bg-gray-50 text-gray-600 border-gray-200"
                }`}
        >
            {status}
        </span>
    )
}

function SummaryCard({
    icon: Icon,
    title,
    value,
    description,
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {value}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        {description}
                    </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Icon
                        size={19}
                        className="text-emerald-600"
                    />
                </div>
            </div>
        </div>
    )
}

export default function SellerPayoutsPage() {
    const [payouts, setPayouts] = useState([])

    const [sellerPayables, setSellerPayables] =
        useState([])

    const [payableMap, setPayableMap] =
        useState({})

    const [summary, setSummary] = useState({
        payable: 0,
        total: 0,
        pending: 0,
        processing: 0,
        success: 0,
        failed: 0,
        cancelled: 0,
    })

    const [search, setSearch] = useState("")

    const [status, setStatus] = useState("ALL")

    const [loading, setLoading] = useState(true)

    const [creatingPayout, setCreatingPayout] =
        useState(null)

    const [selectedPayout, setSelectedPayout] =
        useState(null)

    const [transactionId, setTransactionId] =
        useState("")

    const [markingPaid, setMarkingPaid] =
        useState(false)

    const [error, setError] = useState("")

    // --------------------------------------------------
    // Open Mark Paid Modal
    // --------------------------------------------------

    const openMarkPaidModal = (payout) => {
        setSelectedPayout(payout)
        setTransactionId("")
    }

    // --------------------------------------------------
    // Close Mark Paid Modal
    // --------------------------------------------------

    const closeMarkPaidModal = () => {
        if (markingPaid) return

        setSelectedPayout(null)
        setTransactionId("")
    }

    // --------------------------------------------------
    // Mark Payout As Paid
    // --------------------------------------------------

    const markPayoutAsPaid = async () => {
        if (!selectedPayout) return

        if (!transactionId.trim()) {
            alert(
                "Please enter the UTR / transaction ID"
            )
            return
        }

        try {
            setMarkingPaid(true)

            const response = await fetch(
                "/api/admin/seller-payouts",
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        payoutId:
                            selectedPayout.id,

                        action: "MARK_PAID",

                        transactionId:
                            transactionId.trim(),
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Failed to mark payout as paid"
                )
            }

            alert(
                "Payout marked as paid successfully."
            )

            setSelectedPayout(null)
            setTransactionId("")

            await fetchPayouts()
        } catch (error) {
            console.error(
                "MARK PAYOUT ERROR:",
                error
            )

            alert(
                error.message ||
                "Failed to mark payout as paid"
            )
        } finally {
            setMarkingPaid(false)
        }
    }

    // --------------------------------------------------
    // Fetch Seller Payouts
    // --------------------------------------------------

    async function fetchPayouts() {
        try {
            setLoading(true)
            setError("")

            const params = new URLSearchParams()

            if (search.trim()) {
                params.set(
                    "search",
                    search.trim()
                )
            }

            if (status !== "ALL") {
                params.set(
                    "status",
                    status
                )
            }

            const response = await fetch(
                `/api/admin/seller-payouts?${params.toString()}`,
                {
                    cache: "no-store",
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Failed to load seller payouts"
                )
            }

            setPayouts(
                Array.isArray(data.payouts)
                    ? data.payouts
                    : []
            )

            setSellerPayables(
                Array.isArray(data.sellerPayables)
                    ? data.sellerPayables
                    : []
            )

            setPayableMap(data.payableByStore || {})

            setSummary({
                payable: Number(
                    data.summary?.payable || 0
                ),

                total: Number(
                    data.summary?.total || 0
                ),

                pending: Number(
                    data.summary?.pending || 0
                ),

                processing: Number(
                    data.summary?.processing || 0
                ),

                success: Number(
                    data.summary?.success || 0
                ),

                failed: Number(
                    data.summary?.failed || 0
                ),

                cancelled: Number(
                    data.summary?.cancelled || 0
                ),
            })
        } catch (error) {
            console.error(
                "SELLER PAYOUTS PAGE ERROR:",
                error
            )

            setError(
                error.message ||
                "Failed to load seller payouts"
            )
        } finally {
            setLoading(false)
        }
    }

    // --------------------------------------------------
    // Initial Fetch / Status Change
    // --------------------------------------------------

    useEffect(() => {
        fetchPayouts()
    }, [status])

    // --------------------------------------------------
    // Create Seller Payout
    // --------------------------------------------------

    const createSellerPayout = async (storeId) => {
        try {
            setCreatingPayout(storeId)

            const response = await fetch(
                "/api/admin/seller-payouts",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        storeId,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Failed to create payout"
                )
            }

            if (data.outcomeUnknown) {
                alert(
                    "Payout status is not confirmed yet. Refresh the ledger and check its status before retrying."
                )
            } else if (data.alreadySubmitted) {
                alert(
                    "This seller already has a payout in progress. Check the ledger for its latest status."
                )
            } else {
                alert(
                    `${data.message || "Payout request submitted."}${data.payout?.amount != null
                        ? ` Amount: ${formatCurrency(data.payout.amount)}`
                        : ""
                    }`
                )
            }

            await fetchPayouts()
        } catch (error) {
            console.error(
                "CREATE PAYOUT ERROR:",
                error
            )

            alert(
                error.message ||
                "Failed to create seller payout"
            )
        } finally {
            setCreatingPayout(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <p className="text-sm font-semibold text-emerald-600">
                            FINANCE
                        </p>

                        <h1 className="text-2xl md:text-3xl font-bold mt-2">
                            Seller Payouts
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Monitor seller payout requests and payment status.
                        </p>
                    </div>

                    <button
                        onClick={fetchPayouts}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>

                {/* =====================================================
                    ERROR
                ====================================================== */}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {/* =====================================================
                    SUMMARY
                ====================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">

                    <SummaryCard
                        icon={Wallet}
                        title="Total Payable"
                        value={formatCurrency(
                            summary.payable
                        )}
                        description="Available seller earnings"
                    />

                    <SummaryCard
                        icon={Clock}
                        title="Pending"
                        value={formatCurrency(
                            summary.pending
                        )}
                        description="Waiting for payment"
                    />

                    <SummaryCard
                        icon={CreditCard}
                        title="Processing"
                        value={formatCurrency(
                            summary.processing
                        )}
                        description="Currently processing"
                    />

                    <SummaryCard
                        icon={CheckCircle}
                        title="Successful"
                        value={formatCurrency(
                            summary.success
                        )}
                        description="Successfully paid"
                    />

                    <SummaryCard
                        icon={AlertCircle}
                        title="Failed"
                        value={formatCurrency(
                            summary.failed
                        )}
                        description="Failed payouts"
                    />
                </div>

                {/* =====================================================
                    FILTERS
                ====================================================== */}

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-5">
                    <div className="flex flex-col lg:flex-row gap-3">

                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (
                                        e.key ===
                                        "Enter"
                                    ) {
                                        fetchPayouts()
                                    }
                                }}
                                placeholder="Search seller or store..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(
                                    e.target.value
                                )
                            }
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
                        >
                            {STATUS_OPTIONS.map(
                                (item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                )
                            )}
                        </select>

                        <button
                            onClick={fetchPayouts}
                            disabled={loading}
                            className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* =====================================================
                    SELLER PAYABLES
                ====================================================== */}

                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm mb-6">

                    <div className="p-5 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Seller Payables
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Available seller earnings ready for payout.
                        </p>
                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[800px] text-sm">

                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>

                                    <th className="text-left px-5 py-3">
                                        Seller
                                    </th>

                                    <th className="text-left px-5 py-3">
                                        Earnings
                                    </th>

                                    <th className="text-left px-5 py-3">
                                        Last Earning
                                    </th>

                                    <th className="text-right px-5 py-3">
                                        Payable
                                    </th>

                                    <th className="text-right px-5 py-3">
                                        Action
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            <div className="flex justify-center items-center gap-2">
                                                <RefreshCw
                                                    size={16}
                                                    className="animate-spin"
                                                />

                                                Loading seller payables...
                                            </div>
                                        </td>
                                    </tr>
                                ) : sellerPayables.length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-10 text-center text-gray-500"
                                        >
                                            No seller payable earnings found.
                                        </td>
                                    </tr>
                                ) : (
                                    sellerPayables.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.storeId
                                                }
                                                className="hover:bg-gray-50"
                                            >

                                                {/* Seller */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">

                                                        {item.store
                                                            ?.logo ? (
                                                            <img
                                                                src={
                                                                    item
                                                                        .store
                                                                        .logo
                                                                }
                                                                alt=""
                                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                                <Store
                                                                    size={
                                                                        17
                                                                    }
                                                                    className="text-emerald-600"
                                                                />
                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {item
                                                                    .store
                                                                    ?.name ||
                                                                    item
                                                                        .store
                                                                        ?.username ||
                                                                    "Unknown Seller"}
                                                            </p>

                                                            <p className="text-xs text-gray-500">
                                                                {item
                                                                    .store
                                                                    ?.email ||
                                                                    item
                                                                        .store
                                                                        ?.contact ||
                                                                    ""}
                                                            </p>
                                                        </div>

                                                    </div>
                                                </td>

                                                {/* Earnings */}

                                                <td className="px-5 py-4 text-gray-700">
                                                    {item.earningCount}
                                                </td>

                                                {/* Last Earning */}

                                                <td className="px-5 py-4 text-gray-600">
                                                    {item.lastEarningAt
                                                        ? new Date(
                                                            item.lastEarningAt
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "-"}
                                                </td>

                                                {/* Payable */}

                                                <td className="px-5 py-4 text-right">
                                                    <span className="font-semibold text-emerald-600">
                                                        {formatCurrency(
                                                            item.amount
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Create Payout */}

                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            createSellerPayout(
                                                                item.storeId
                                                            )
                                                        }
                                                        disabled={
                                                            creatingPayout ===
                                                            item.storeId
                                                        }
                                                        className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                                    >
                                                        {creatingPayout ===
                                                            item.storeId
                                                            ? "Creating..."
                                                            : "Create Payout"}
                                                    </button>
                                                </td>

                                            </tr>
                                        )
                                    )
                                )}

                            </tbody>

                        </table>
                    </div>
                </div>

                {/* =====================================================
                    PAYOUT LEDGER
                ====================================================== */}

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b border-gray-200">

                        <h2 className="font-semibold text-gray-900">
                            Payout Ledger
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                            {payouts.length} payout
                            {payouts.length === 1
                                ? ""
                                : "s"}{" "}
                            found
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1200px]">

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">

                                    <th className="px-5 py-4">
                                        Seller
                                    </th>

                                    <th className="px-5 py-4">
                                        Payable
                                    </th>

                                    <th className="px-5 py-4">
                                        Payout Amount
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                    <th className="px-5 py-4">
                                        Provider
                                    </th>

                                    <th className="px-5 py-4">
                                        Requested
                                    </th>

                                    <th className="px-5 py-4">
                                        Processed
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center text-gray-500"
                                        >
                                            <div className="flex justify-center items-center gap-2">
                                                <RefreshCw
                                                    size={16}
                                                    className="animate-spin"
                                                />

                                                Loading payouts...
                                            </div>
                                        </td>
                                    </tr>
                                ) : payouts.length ===
                                    0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center text-gray-500"
                                        >
                                            No seller payouts found.
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.map(
                                        (payout) => {
                                            const payable =
                                                payableMap[
                                                payout
                                                    .storeId
                                                ] || 0

                                            return (
                                                <tr
                                                    key={
                                                        payout.id
                                                    }
                                                    className="hover:bg-gray-50"
                                                >

                                                    {/* Seller */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            {payout
                                                                .store
                                                                ?.logo ? (
                                                                <img
                                                                    src={
                                                                        payout
                                                                            .store
                                                                            .logo
                                                                    }
                                                                    alt=""
                                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                                                    <Store
                                                                        size={
                                                                            17
                                                                        }
                                                                        className="text-emerald-600"
                                                                    />
                                                                </div>
                                                            )}

                                                            <div>

                                                                <p className="font-semibold text-gray-900">
                                                                    {payout
                                                                        .store
                                                                        ?.name ||
                                                                        "Unknown Seller"}
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    @
                                                                    {payout
                                                                        .store
                                                                        ?.username ||
                                                                        "-"}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* Payable */}

                                                    <td className="px-5 py-4 font-semibold text-emerald-600">
                                                        {formatCurrency(
                                                            payable
                                                        )}
                                                    </td>

                                                    {/* Payout Amount */}

                                                    <td className="px-5 py-4 font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            payout.amount
                                                        )}
                                                    </td>

                                                    {/* Status */}

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={
                                                                payout.status
                                                            }
                                                        />
                                                    </td>

                                                    {/* Provider */}

                                                    <td className="px-5 py-4 text-sm text-gray-500">
                                                        {payout.provider ||
                                                            "Manual"}
                                                    </td>

                                                    {/* Requested */}

                                                    <td className="px-5 py-4 text-sm text-gray-500">
                                                        {formatDate(
                                                            payout.requestedAt
                                                        )}
                                                    </td>

                                                    {/* Processed */}

                                                    <td className="px-5 py-4 text-sm text-gray-500">
                                                        {formatDate(
                                                            payout.processedAt
                                                        )}
                                                    </td>

                                                    {/* Action */}

                                                    <td className="px-5 py-4 text-right">

                                                        {payout.status === "SUCCESS" ? (
                                                            <span className="text-sm font-medium text-emerald-600">
                                                                Paid
                                                            </span>
                                                        ) : payout.provider === "RAZORPAYX" ? (
                                                            <span className="text-sm text-gray-500">
                                                                {payout.status === "FAILED"
                                                                    ? "Failed — review before retrying"
                                                                    : payout.status === "CANCELLED"
                                                                        ? "Cancelled"
                                                                        : "Awaiting provider"}
                                                            </span>
                                                        ) : payout.status === "PENDING" ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => openMarkPaidModal(payout)}
                                                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                                            >
                                                                Mark Paid
                                                            </button>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">
                                                                {payout.status}
                                                            </span>
                                                        )}

                                                    </td>

                                                </tr>
                                            )
                                        }
                                    )
                                )}

                            </tbody>

                        </table>
                    </div>
                </div>
            </div>

            {/* =====================================================
                MARK PAID MODAL
            ====================================================== */}

            {selectedPayout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                        {/* Modal Header */}

                        <div className="mb-5">

                            <h2 className="text-xl font-semibold text-gray-900">
                                Mark Seller Payout as Paid
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Confirm that the money has actually
                                been transferred to the seller.
                            </p>

                        </div>

                        {/* Payout Information */}

                        <div className="space-y-4">

                            {/* Seller */}

                            <div className="rounded-xl bg-gray-50 p-4">

                                <div className="text-xs text-gray-500">
                                    Seller
                                </div>

                                <div className="mt-1 font-medium text-gray-900">
                                    {selectedPayout
                                        .store
                                        ?.name ||
                                        selectedPayout
                                            .store
                                            ?.username ||
                                        "Seller"}
                                </div>

                            </div>

                            {/* Amount */}

                            <div className="rounded-xl bg-gray-50 p-4">

                                <div className="text-xs text-gray-500">
                                    Amount
                                </div>

                                <div className="mt-1 text-xl font-bold text-gray-900">
                                    {formatCurrency(
                                        selectedPayout.amount
                                    )}
                                </div>

                            </div>

                            {/* Transaction ID */}

                            <div>

                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    UTR / Transaction ID
                                </label>

                                <input
                                    type="text"
                                    value={
                                        transactionId
                                    }
                                    onChange={(e) =>
                                        setTransactionId(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter UTR or transaction reference"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                                />

                            </div>

                        </div>

                        {/* Modal Actions */}

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={
                                    closeMarkPaidModal
                                }
                                disabled={
                                    markingPaid
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    markPayoutAsPaid
                                }
                                disabled={
                                    markingPaid ||
                                    !transactionId.trim()
                                }
                                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                                {markingPaid
                                    ? "Processing..."
                                    : "Confirm Payment"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}