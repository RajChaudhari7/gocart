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

    const [sellerPayables, setSellerPayables] = useState([])

    const [payableMap, setPayableMap] =
        useState({})

    const [summary, setSummary] = useState({
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

    const [error, setError] = useState("")

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

            if (!response.ok) {
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

            setPayableMap(
                data.payableMap || {}
            )

            setSummary(
                data.summary || {
                    total: 0,
                    pending: 0,
                    processing: 0,
                    success: 0,
                    failed: 0,
                    cancelled: 0,
                }
            )

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

    useEffect(() => {
        fetchPayouts()
    }, [status])

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">

            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">

                {/* Header */}

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

                {/* Error */}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {/* Summary */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">

                    <SummaryCard
                        icon={Wallet}
                        title="Total Payable"
                        value={formatCurrency(summary.payable)}
                        description="Available seller earnings"
                    />

                    <SummaryCard
                        icon={Clock}
                        title="Pending"
                        value={formatCurrency(
                            summary.pending
                        )}
                        description="Waiting for processing"
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

                {/* Filters */}

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
                            className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
                        >
                            Search
                        </button>

                    </div>

                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">

                    <div className="px-5 py-4 border-b border-gray-200">

                        <h2 className="font-semibold text-gray-900">
                            Seller Payables
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                            Seller earnings currently available for payout
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[850px]">

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">

                                    <th className="px-5 py-4">
                                        Seller
                                    </th>

                                    <th className="px-5 py-4">
                                        Payable Amount
                                    </th>

                                    <th className="px-5 py-4">
                                        Earnings
                                    </th>

                                    <th className="px-5 py-4">
                                        Last Earning
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-5 py-16 text-center text-gray-500"
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

                                ) : sellerPayables.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-5 py-16 text-center text-gray-500"
                                        >
                                            No seller earnings are currently available for payout.
                                        </td>
                                    </tr>

                                ) : (

                                    sellerPayables.map((seller) => (

                                        <tr
                                            key={seller.storeId}
                                            className="hover:bg-gray-50"
                                        >

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    {seller.store?.logo ? (

                                                        <img
                                                            src={seller.store.logo}
                                                            alt=""
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                        />

                                                    ) : (

                                                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">

                                                            <Store
                                                                size={17}
                                                                className="text-emerald-600"
                                                            />

                                                        </div>

                                                    )}

                                                    <div>

                                                        <p className="font-semibold text-gray-900">
                                                            {seller.store?.name || "Unknown Store"}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            @{seller.store?.username || "-"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            <td className="px-5 py-4">

                                                <span className="text-lg font-bold text-emerald-600">
                                                    {formatCurrency(
                                                        seller.amount
                                                    )}
                                                </span>

                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-600">

                                                {seller.earningCount}

                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-500">

                                                {formatDate(
                                                    seller.lastEarningAt
                                                )}

                                            </td>

                                            <td className="px-5 py-4">

                                                <span className="inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200">

                                                    AVAILABLE

                                                </span>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* Table */}

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b border-gray-200">

                        <h2 className="font-semibold text-gray-900">
                            Payout Ledger
                        </h2>

                        <p className="text-xs text-gray-500 mt-1">
                            {payouts.length} payout
                            {payouts.length === 1
                                ? ""
                                : "s"} found
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1050px]">

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

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="7"
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

                                ) : payouts.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="7"
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
                                                payout.storeId
                                                ] || 0

                                            return (
                                                <tr
                                                    key={
                                                        payout.id
                                                    }
                                                    className="hover:bg-gray-50"
                                                >

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

                                                                <p className="font-semibold">
                                                                    {
                                                                        payout
                                                                            .store
                                                                            ?.name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-500">
                                                                    @
                                                                    {
                                                                        payout
                                                                            .store
                                                                            ?.username
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    <td className="px-5 py-4 font-semibold text-emerald-600">
                                                        {formatCurrency(
                                                            payable
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            payout.amount
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={
                                                                payout.status
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-gray-500">
                                                        {payout.provider ||
                                                            "Manual"}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-gray-500">
                                                        {formatDate(
                                                            payout.requestedAt
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-gray-500">
                                                        {formatDate(
                                                            payout.processedAt
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

        </div>
    )
}