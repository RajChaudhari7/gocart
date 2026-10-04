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
        PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        AVAILABLE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        PAID: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        ADJUSTED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    }

    return (
        <span
            className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${styles[status] ||
                "bg-gray-500/10 text-gray-400 border-gray-500/20"
                }`}
        >
            {status}
        </span>
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

    async function fetchEarnings() {
        try {
            setLoading(true)

            const params = new URLSearchParams()

            if (search.trim()) {
                params.set("search", search.trim())
            }

            if (status !== "ALL") {
                params.set("status", status)
            }

            const res = await fetch(
                `/api/admin/seller-earnings?${params.toString()}`
            )

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to load earnings")
            }

            setEarnings(data.earnings || [])
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
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEarnings()
    }, [status])

    return (
        <div className="min-h-screen bg-[#080b12] text-white p-4 md:p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

                <div>
                    <p className="text-xs tracking-[0.3em] text-emerald-400 font-semibold">
                        FINANCE
                    </p>

                    <h1 className="text-2xl md:text-3xl font-bold mt-2">
                        Seller Earnings
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                        Track seller revenue, commissions and payable balances.
                    </p>
                </div>

                <button
                    onClick={fetchEarnings}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>

            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">

                <SummaryCard
                    icon={Wallet}
                    title="Total Earnings"
                    value={formatCurrency(summary.total)}
                />

                <SummaryCard
                    icon={Clock}
                    title="Pending"
                    value={formatCurrency(summary.pending)}
                />

                <SummaryCard
                    icon={IndianRupee}
                    title="Available"
                    value={formatCurrency(summary.available)}
                />

                <SummaryCard
                    icon={CheckCircle}
                    title="Paid"
                    value={formatCurrency(summary.paid)}
                />

                <SummaryCard
                    icon={Store}
                    title="Adjusted"
                    value={formatCurrency(summary.adjusted)}
                />

            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-5">

                <div className="flex flex-col md:flex-row gap-3">

                    <div className="relative flex-1">

                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    fetchEarnings()
                                }
                            }}
                            placeholder="Search order, store or username..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-emerald-500/50"
                        />

                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-[#111722] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                    >
                        {STATUS_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={fetchEarnings}
                        className="px-5 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
                    >
                        Search
                    </button>

                </div>

            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1050px]">

                        <thead className="bg-white/[0.03] border-b border-white/10">

                            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">

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

                        <tbody className="divide-y divide-white/5">

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-5 py-16 text-center text-gray-500"
                                    >
                                        Loading seller earnings...
                                    </td>
                                </tr>
                            ) : earnings.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-5 py-16 text-center text-gray-500"
                                    >
                                        No seller earnings found.
                                    </td>
                                </tr>
                            ) : (
                                earnings.map((earning) => (
                                    <tr
                                        key={earning.id}
                                        className="hover:bg-white/[0.02] transition"
                                    >

                                        <td className="px-5 py-4">

                                            <div className="flex items-center gap-3">

                                                {earning.store?.logo ? (
                                                    <img
                                                        src={earning.store.logo}
                                                        alt=""
                                                        className="w-9 h-9 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                        <Store
                                                            size={16}
                                                            className="text-emerald-400"
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-medium">
                                                        {earning.store?.name || "-"}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        @{earning.store?.username || "-"}
                                                    </p>
                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-5 py-4">

                                            <p className="font-mono text-sm">
                                                #{earning.orderId.slice(-6)}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {earning.order?.status || "-"}
                                            </p>

                                        </td>

                                        <td className="px-5 py-4">
                                            {formatCurrency(earning.grossAmount)}
                                        </td>

                                        <td className="px-5 py-4 text-red-400">
                                            -{formatCurrency(earning.commissionAmount)}
                                        </td>

                                        <td className="px-5 py-4">
                                            {formatCurrency(earning.refundAdjustment)}
                                        </td>

                                        <td className="px-5 py-4 font-semibold text-emerald-400">
                                            {formatCurrency(earning.netAmount)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge status={earning.status} />
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-400">
                                            {formatDate(earning.createdAt)}
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    )
}

function SummaryCard({ icon: Icon, title, value }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-xs text-gray-500">
                        {title}
                    </p>

                    <p className="text-xl font-bold mt-2">
                        {value}
                    </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Icon
                        size={18}
                        className="text-emerald-400"
                    />
                </div>

            </div>

        </div>
    )
}