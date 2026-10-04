"use client"

import { useEffect, useState } from "react"
import {
    RefreshCw,
    Search,
    Store,
    Wallet,
    Clock,
    CheckCircle,
    IndianRupee,
    TrendingUp,
} from "lucide-react"

const STATUS_OPTIONS = [
    "ALL",
    "PENDING",
    "AVAILABLE",
    "PAID",
    "ADJUSTED",
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

        AVAILABLE:
            "bg-emerald-50 text-emerald-700 border-emerald-200",

        PAID:
            "bg-blue-50 text-blue-700 border-blue-200",

        ADJUSTED:
            "bg-purple-50 text-purple-700 border-purple-200",
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

            <div className="flex items-start justify-between gap-4">

                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {value}
                    </p>

                    {description && (
                        <p className="text-xs text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
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

export default function SellerEarningsPage() {

    const [earnings, setEarnings] = useState([])

    const [summary, setSummary] = useState({
        total: 0,
        pending: 0,
        available: 0,
        paid: 0,
        adjusted: 0,
    })

    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("ALL")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    async function fetchEarnings() {

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
                `/api/admin/seller-earnings?${params.toString()}`,
                {
                    cache: "no-store",
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to load seller earnings"
                )
            }

            setEarnings(
                Array.isArray(data.earnings)
                    ? data.earnings
                    : []
            )

            setSummary(
                data.summary || {
                    total: 0,
                    pending: 0,
                    available: 0,
                    paid: 0,
                    adjusted: 0,
                }
            )

        } catch (error) {

            console.error(
                "SELLER EARNINGS PAGE ERROR:",
                error
            )

            setError(
                error.message ||
                "Failed to load seller earnings"
            )

            setEarnings([])

        } finally {

            setLoading(false)

        }
    }

    useEffect(() => {
        fetchEarnings()
    }, [status])

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">

            <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                    <div>

                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                            <TrendingUp size={16} />
                            FINANCE
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                            Seller Earnings
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Track seller revenue, commissions and payable balances.
                        </p>

                    </div>

                    <button
                        onClick={fetchEarnings}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition disabled:opacity-60"
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
                        title="Total Earnings"
                        value={formatCurrency(
                            summary.total
                        )}
                        description="All seller earnings"
                    />

                    <SummaryCard
                        icon={Clock}
                        title="Pending"
                        value={formatCurrency(
                            summary.pending
                        )}
                        description="Awaiting availability"
                    />

                    <SummaryCard
                        icon={IndianRupee}
                        title="Available"
                        value={formatCurrency(
                            summary.available
                        )}
                        description="Ready for payout"
                    />

                    <SummaryCard
                        icon={CheckCircle}
                        title="Paid"
                        value={formatCurrency(
                            summary.paid
                        )}
                        description="Already paid"
                    />

                    <SummaryCard
                        icon={Store}
                        title="Adjusted"
                        value={formatCurrency(
                            summary.adjusted
                        )}
                        description="Refund adjustments"
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
                                        fetchEarnings()
                                    }
                                }}
                                placeholder="Search order, store or username..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                            />

                        </div>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(
                                    e.target.value
                                )
                            }
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                            onClick={fetchEarnings}
                            className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                        >
                            Search
                        </button>

                    </div>

                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Earnings Ledger
                            </h2>

                            <p className="text-xs text-gray-500 mt-1">
                                {earnings.length} record
                                {earnings.length === 1
                                    ? ""
                                    : "s"} found
                            </p>
                        </div>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px]">

                            <thead className="bg-gray-50 border-b border-gray-200">

                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">

                                    <th className="px-5 py-4">
                                        Store
                                    </th>

                                    <th className="px-5 py-4">
                                        Order
                                    </th>

                                    <th className="px-5 py-4">
                                        Gross
                                    </th>

                                    <th className="px-5 py-4">
                                        Commission
                                    </th>

                                    <th className="px-5 py-4">
                                        Refund Adj.
                                    </th>

                                    <th className="px-5 py-4">
                                        Net
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                    <th className="px-5 py-4">
                                        Date
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-5 py-16 text-center text-gray-500"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                Loading seller earnings...
                                            </div>
                                        </td>
                                    </tr>

                                ) : earnings.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-5 py-16 text-center"
                                        >

                                            <div className="flex flex-col items-center">

                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                    <Store
                                                        size={20}
                                                        className="text-gray-400"
                                                    />
                                                </div>

                                                <p className="font-medium text-gray-700">
                                                    No seller earnings found
                                                </p>

                                                <p className="text-sm text-gray-400 mt-1">
                                                    Try changing the search or status filter.
                                                </p>

                                            </div>

                                        </td>
                                    </tr>

                                ) : (

                                    earnings.map(
                                        (earning) => (
                                            <tr
                                                key={
                                                    earning.id
                                                }
                                                className="hover:bg-gray-50 transition"
                                            >

                                                {/* Store */}
                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        {earning
                                                            .store
                                                            ?.logo ? (

                                                            <img
                                                                src={
                                                                    earning
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
                                                                {earning
                                                                    .store
                                                                    ?.name ||
                                                                    "-"}
                                                            </p>

                                                            <p className="text-xs text-gray-500">
                                                                @
                                                                {earning
                                                                    .store
                                                                    ?.username ||
                                                                    "-"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* Order */}
                                                <td className="px-5 py-4">

                                                    <p className="font-mono text-sm font-medium text-gray-800">
                                                        #
                                                        {String(
                                                            earning.orderId
                                                        ).slice(
                                                            -6
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {earning
                                                            .order
                                                            ?.status ||
                                                            "-"}
                                                    </p>

                                                </td>

                                                {/* Gross */}
                                                <td className="px-5 py-4 font-medium text-gray-800">
                                                    {formatCurrency(
                                                        earning.grossAmount
                                                    )}
                                                </td>

                                                {/* Commission */}
                                                <td className="px-5 py-4 text-red-600">
                                                    -
                                                    {formatCurrency(
                                                        earning.commissionAmount
                                                    )}
                                                </td>

                                                {/* Refund */}
                                                <td className="px-5 py-4 text-gray-600">
                                                    {formatCurrency(
                                                        earning.refundAdjustment
                                                    )}
                                                </td>

                                                {/* Net */}
                                                <td className="px-5 py-4">

                                                    <span className="font-bold text-emerald-600">
                                                        {formatCurrency(
                                                            earning.netAmount
                                                        )}
                                                    </span>

                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={
                                                            earning.status
                                                        }
                                                    />
                                                </td>

                                                {/* Date */}
                                                <td className="px-5 py-4 text-sm text-gray-500">
                                                    {formatDate(
                                                        earning.createdAt
                                                    )}
                                                </td>

                                            </tr>
                                        )
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