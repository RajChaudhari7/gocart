'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import {
    ChevronDown,
    Clock3,
    Eye,
    Package,
    RefreshCw,
    Search,
    Truck,
    User,
} from "lucide-react"
import { toast } from "sonner"
import Loading from "@/components/Loading"

const STATUS_OPTIONS = [
    "ALL",
    "ORDER_PLACED",
    "ORDER_CONFIRMED",
    "ORDER_PACKING",
    "ORDER_PACKED",
    "DRIVER_ASSIGNED",
    "REACHED_SHOP",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERY_INITIATED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
]

const STATUS_LABELS = {
    ORDER_PLACED: "Order Placed",
    ORDER_CONFIRMED: "Confirmed",
    ORDER_PACKING: "Packing",
    ORDER_PACKED: "Packed",
    DRIVER_ASSIGNED: "Driver Assigned",
    REACHED_SHOP: "Reached Shop",
    PICKED_UP: "Picked Up",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERY_INITIATED: "Delivery Initiated",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
}

export default function AdminOrdersPage() {

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("ALL")

    const [selectedOrder, setSelectedOrder] = useState(null)

    const fetchOrders = async (manual = false) => {

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
                "/api/admin/orders",
                { params }
            )

            setOrders(data.orders || [])

        } catch (error) {

            toast.error(
                error?.response?.data?.error ||
                "Failed to load orders"
            )

        } finally {

            setLoading(false)
            setRefreshing(false)

        }
    }

    useEffect(() => {

        const timeout = setTimeout(() => {
            fetchOrders()
        }, 300)

        return () => clearTimeout(timeout)

    }, [status, search])

    if (loading) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

            {/* Header */}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <p className="text-sm font-medium text-gray-500">
                        OPERATIONS
                    </p>

                    <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
                        Orders
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Monitor marketplace orders and delivery progress.
                    </p>
                </div>

                <button
                    onClick={() => fetchOrders(true)}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>

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
                            placeholder="Search order, customer or store..."
                            className="w-full rounded-lg border px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                        />

                    </div>


                    <div className="relative">

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                            className="w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-black/10 md:w-64"
                        >

                            {STATUS_OPTIONS.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item === "ALL"
                                        ? "All statuses"
                                        : STATUS_LABELS[item] || item}
                                </option>
                            ))}

                        </select>

                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                    </div>

                </div>

            </div>


            {/* Orders */}

            <div className="rounded-2xl border bg-white shadow-sm">

                {orders.length === 0 ? (

                    <div className="p-12 text-center">

                        <Package
                            size={42}
                            className="mx-auto text-gray-300"
                        />

                        <h2 className="mt-4 font-semibold text-gray-800">
                            No orders found
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing the search or status filter.
                        </p>

                    </div>

                ) : (

                    <div className="divide-y">

                        {orders.map((order) => (

                            <OrderRow
                                key={order.id}
                                order={order}
                                onView={() =>
                                    setSelectedOrder(order)
                                }
                            />

                        ))}

                    </div>

                )}

            </div>


            {/* Details */}

            {selectedOrder && (
                <OrderDetails
                    order={selectedOrder}
                    onClose={() =>
                        setSelectedOrder(null)
                    }
                />
            )}

        </div>
    )
}


function OrderRow({ order, onView }) {

    return (
        <div className="p-4 md:p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex min-w-0 items-start gap-4">

                    <div className="rounded-xl bg-gray-100 p-3">
                        <Package size={20} />
                    </div>

                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                            <p className="font-semibold text-gray-900">
                                #{order.id.slice(-8).toUpperCase()}
                            </p>

                            <StatusBadge
                                status={order.status}
                            />

                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            {order.store?.name || "Unknown store"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            {formatDate(order.createdAt)}
                        </p>

                    </div>

                </div>


                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-4">

                    <Info
                        icon={<User size={14} />}
                        label="Customer"
                        value={order.user?.name || "Unknown"}
                    />

                    <Info
                        icon={<Package size={14} />}
                        label="Items"
                        value={order.orderItems?.length || 0}
                    />

                    <Info
                        icon={<Truck size={14} />}
                        label="Driver"
                        value={
                            order.driver?.name ||
                            "Not assigned"
                        }
                    />

                    <Info
                        icon={<Clock3 size={14} />}
                        label="Total"
                        value={`₹${Number(order.total || 0).toLocaleString("en-IN")}`}
                    />

                </div>


                <button
                    onClick={onView}
                    className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                    <Eye size={16} />
                    View
                </button>

            </div>

        </div>
    )
}


function OrderDetails({ order, onClose }) {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

                <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">

                    <div>

                        <p className="text-xs text-gray-400">
                            ORDER
                        </p>

                        <h2 className="text-xl font-bold">
                            #{order.id.slice(-8).toUpperCase()}
                        </h2>

                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        Close
                    </button>

                </div>


                <div className="space-y-6 p-5">

                    {/* Summary */}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                        <Summary
                            label="Status"
                            value={
                                STATUS_LABELS[order.status] ||
                                order.status
                            }
                        />

                        <Summary
                            label="Total"
                            value={`₹${Number(order.total || 0).toLocaleString("en-IN")}`}
                        />

                        <Summary
                            label="Store"
                            value={order.store?.name || "—"}
                        />

                        <Summary
                            label="Driver"
                            value={order.driver?.name || "Unassigned"}
                        />

                    </div>


                    {/* Items */}

                    <div>

                        <h3 className="mb-3 font-semibold">
                            Order Items
                        </h3>

                        <div className="divide-y rounded-xl border">

                            {order.orderItems?.map((item) => (

                                <div
                                    key={item.productId}
                                    className="flex items-center justify-between p-3"
                                >

                                    <div>

                                        <p className="text-sm font-medium">
                                            {item.product?.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Qty: {item.quantity}
                                        </p>

                                    </div>

                                    <p className="text-sm font-semibold">
                                        ₹{(
                                            Number(item.price) *
                                            Number(item.quantity)
                                        ).toLocaleString("en-IN")}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>


                    {/* Event timeline */}

                    <div>

                        <h3 className="mb-3 font-semibold">
                            Order Timeline
                        </h3>

                        {order.orderEvents?.length ? (

                            <div className="relative space-y-4">

                                {order.orderEvents.map((event) => (

                                    <div
                                        key={event.id}
                                        className="flex gap-3"
                                    >

                                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gray-800" />

                                        <div>

                                            <p className="text-sm font-medium">
                                                {STATUS_LABELS[event.status] ||
                                                    event.status}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {event.actorType || "SYSTEM"}
                                                {event.note
                                                    ? ` • ${event.note}`
                                                    : ""}
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {formatDate(
                                                    event.createdAt
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        ) : (

                            <p className="text-sm text-gray-500">
                                No audit events recorded yet.
                            </p>

                        )}

                    </div>

                </div>

            </div>

        </div>
    )
}


function StatusBadge({ status }) {

    const styles = {

        DELIVERED:
            "bg-green-50 text-green-700",

        CANCELLED:
            "bg-red-50 text-red-700",

        RETURNED:
            "bg-orange-50 text-orange-700",

        DRIVER_ASSIGNED:
            "bg-blue-50 text-blue-700",

        OUT_FOR_DELIVERY:
            "bg-purple-50 text-purple-700",

        DELIVERY_INITIATED:
            "bg-purple-50 text-purple-700",

        ORDER_PLACED:
            "bg-yellow-50 text-yellow-700",

    }

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ||
                "bg-gray-100 text-gray-600"
                }`}
        >
            {STATUS_LABELS[status] || status}
        </span>
    )
}


function Info({ icon, label, value }) {

    return (
        <div>

            <div className="flex items-center gap-1 text-xs text-gray-400">
                {icon}
                {label}
            </div>

            <p className="mt-0.5 truncate text-sm font-medium text-gray-700">
                {value}
            </p>

        </div>
    )
}


function Summary({ label, value }) {

    return (
        <div className="rounded-xl bg-gray-50 p-3">

            <p className="text-xs text-gray-400">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                {value}
            </p>

        </div>
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