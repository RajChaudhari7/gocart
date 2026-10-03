'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import {
    IndianRupee,
    RefreshCw,
    Search,
    Truck,
    Wallet,
} from "lucide-react"
import { toast } from "sonner"
import Loading from "@/components/Loading"

const STATUS_OPTIONS = [
    "ALL",
    "PENDING",
    "AVAILABLE",
    "PAID",
    "ADJUSTED",
]

export default function DriverEarningsPage() {

    const [earnings, setEarnings] = useState([])
    const [summary, setSummary] = useState({
        total: 0,
        pending: 0,
        available: 0,
        paid: 0,
    })

    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("ALL")

    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchEarnings = async (manual = false) => {

        try {

            if (manual) {
                setRefreshing(true)
            }

            const params = {}

            if (status !== "ALL") {
                params.status = status
            }

            if (search.trim()) {
                params.search = search.trim()
            }

            const { data } = await axios.get(
                "/api/admin/driver-earnings",
                { params }
            )

            setEarnings(data.earnings || [])
            setSummary(
                data.summary || {
                    total: 0,
                    pending: 0,
                    available: 0,
                    paid: 0,
                }
            )

        } catch (error) {

            toast.error(
                error?.response?.data?.error ||
                "Failed to load driver earnings"
            )

        } finally {

            setLoading(false)
            setRefreshing(false)

        }
    }

    useEffect(() => {

        const timer = setTimeout(() => {
            fetchEarnings()
        }, 300)

        return () => clearTimeout(timer)

    }, [status, search])

    if (loading) {
        return <Loading />
    }

    const money = (value) =>
        `₹${Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        })}`

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <p className="text-sm font-medium text-gray-500">
                        FINANCE
                    </p>

                    <h1 className="mt-1 text-2xl md:text-3xl font-bold">
                        Driver Earnings
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Track driver earnings and settlement status.
                    </p>
                </div>

                <button
                    onClick={() => fetchEarnings(true)}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                </button>

            </div>


            {/* Summary */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    title="Total Earnings"
                    value={money(summary.total)}
                    icon={IndianRupee}
                />

                <SummaryCard
                    title="Pending"
                    value={money(summary.pending)}
                    icon={Wallet}
                />

                <SummaryCard
                    title="Available"
                    value={money(summary.available)}
                    icon={Truck}
                />

                <SummaryCard
                    title="Paid"
                    value={money(summary.paid)}
                    icon={Wallet}
                />

            </div>


            {/* Filters */}

            <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 md:flex-row">

                    <div className="relative flex-1">

                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search driver, phone or order..."
                            className="w-full rounded-lg border px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                        />

                    </div>

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                        className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none md:w-56"
                    >

                        {STATUS_OPTIONS.map(item => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item === "ALL"
                                    ? "All statuses"
                                    : item}
                            </option>
                        ))}

                    </select>

                </div>

            </div>


            {/* Ledger */}

            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                {earnings.length === 0 ? (

                    <div className="p-12 text-center">

                        <Wallet
                            size={42}
                            className="mx-auto text-gray-300"
                        />

                        <h2 className="mt-4 font-semibold">
                            No earnings found
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Driver earnings will appear here after delivery completion.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px] text-sm">

                            <thead className="border-b bg-gray-50">

                                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">

                                    <th className="px-5 py-4">
                                        Driver
                                    </th>

                                    <th className="px-5 py-4">
                                        Order
                                    </th>

                                    <th className="px-5 py-4">
                                        Type
                                    </th>

                                    <th className="px-5 py-4">
                                        Amount
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                    <th className="px-5 py-4">
                                        Date
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y">

                                {earnings.map(item => (

                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="px-5 py-4">

                                            <div className="font-medium">
                                                {item.driver?.name || "Unknown"}
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                {item.driver?.phone || "—"}
                                            </div>

                                        </td>


                                        <td className="px-5 py-4 font-medium">
                                            #{item.orderId.slice(-8).toUpperCase()}
                                        </td>


                                        <td className="px-5 py-4">
                                            {item.type || "DELIVERY"}
                                        </td>


                                        <td className="px-5 py-4 font-semibold">
                                            {money(item.amount)}
                                        </td>


                                        <td className="px-5 py-4">
                                            <EarningStatus
                                                status={item.status}
                                            />
                                        </td>


                                        <td className="px-5 py-4 text-gray-500">
                                            {formatDate(item.createdAt)}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    )
}


function SummaryCard({
    title,
    value,
    icon: Icon,
}) {

    return (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

                <div className="rounded-xl bg-gray-100 p-3">
                    <Icon size={21} />
                </div>

                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {value}
                    </p>
                </div>

            </div>

        </div>
    )
}


function EarningStatus({ status }) {

    const styles = {
        PENDING: "bg-yellow-50 text-yellow-700",
        AVAILABLE: "bg-blue-50 text-blue-700",
        PAID: "bg-green-50 text-green-700",
        ADJUSTED: "bg-purple-50 text-purple-700",
    }

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                styles[status] ||
                "bg-gray-100 text-gray-600"
            }`}
        >
            {status}
        </span>
    )
}


function formatDate(date) {

    if (!date) {
        return "—"
    }

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}