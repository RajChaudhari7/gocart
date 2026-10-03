'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import {
    MapPin,
    Navigation,
    Package,
    Phone,
    RefreshCw,
    Truck,
    User,
} from "lucide-react"
import { toast } from "sonner"
import Loading from "@/components/Loading"

const ACTIVE_STATUSES = [
    "DRIVER_ASSIGNED",
    "REACHED_SHOP",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERY_INITIATED",
]

const STATUS_LABELS = {
    DRIVER_ASSIGNED: "Driver Assigned",
    REACHED_SHOP: "Reached Shop",
    PICKED_UP: "Picked Up",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERY_INITIATED: "Delivery Initiated",
}

export default function LiveDeliveriesPage() {

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchDeliveries = async (showLoader = false) => {

        try {

            if (showLoader) {
                setRefreshing(true)
            }

            const { data } = await axios.get(
                "/api/admin/live-deliveries"
            )

            setOrders(data.orders || [])

        } catch (error) {

            toast.error(
                error?.response?.data?.error ||
                "Failed to load live deliveries"
            )

        } finally {

            setLoading(false)
            setRefreshing(false)

        }
    }

    useEffect(() => {

        fetchDeliveries()

        const interval = setInterval(() => {
            fetchDeliveries()
        }, 5000)

        return () => clearInterval(interval)

    }, [])

    if (loading) {
        return <Loading />
    }

    const activeCount = orders.length

    const drivers = new Set(
        orders
            .map(order => order.driver?.id)
            .filter(Boolean)
    )

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

            {/* Header */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

                        <p className="text-sm font-medium text-green-600">
                            LIVE OPERATIONS
                        </p>

                    </div>

                    <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
                        Live Deliveries
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Monitor active deliveries and driver locations.
                    </p>

                </div>


                <button
                    onClick={() => fetchDeliveries(true)}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />

                    Refresh
                </button>

            </div>


            {/* Summary */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-4">

                        <div className="rounded-xl bg-gray-100 p-3">
                            <Truck size={22} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Active Deliveries
                            </p>

                            <p className="text-2xl font-bold text-gray-900">
                                {activeCount}
                            </p>
                        </div>

                    </div>

                </div>


                <div className="rounded-2xl border bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-4">

                        <div className="rounded-xl bg-gray-100 p-3">
                            <User size={22} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Drivers On Delivery
                            </p>

                            <p className="text-2xl font-bold text-gray-900">
                                {drivers.size}
                            </p>
                        </div>

                    </div>

                </div>

            </div>


            {/* Deliveries */}

            {orders.length === 0 ? (

                <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">

                    <Truck
                        size={42}
                        className="mx-auto text-gray-300"
                    />

                    <h2 className="mt-4 text-lg font-semibold text-gray-800">
                        No active deliveries
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Active driver deliveries will appear here.
                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

                    {orders.map((order) => (

                        <DeliveryCard
                            key={order.id}
                            order={order}
                        />

                    ))}

                </div>

            )}

        </div>
    )
}


function DeliveryCard({ order }) {

    const driver = order.driver
    const store = order.store
    const address = order.address

    return (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

            {/* Top */}

            <div className="flex items-start justify-between gap-4">

                <div>

                    <p className="text-xs text-gray-400">
                        ORDER
                    </p>

                    <p className="font-semibold text-gray-900">
                        #{order.id.slice(-8).toUpperCase()}
                    </p>

                </div>


                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    {STATUS_LABELS[order.status] || order.status}
                </span>

            </div>


            {/* Driver */}

            <div className="mt-5 rounded-xl bg-gray-50 p-4">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border">
                            <Truck size={18} />
                        </div>

                        <div>

                            <p className="text-sm font-semibold">
                                {driver?.name || "Driver unavailable"}
                            </p>

                            <p className="text-xs text-gray-500">
                                {driver?.vehicle || "Vehicle not specified"}
                                {driver?.vehicleNo
                                    ? ` • ${driver.vehicleNo}`
                                    : ""}
                            </p>

                        </div>

                    </div>


                    {driver?.phone && (
                        <a
                            href={`tel:${driver.phone}`}
                            className="rounded-lg border bg-white p-2 hover:bg-gray-100"
                        >
                            <Phone size={16} />
                        </a>
                    )}

                </div>


                {/* Driver location */}

                <div className="mt-4 flex items-center gap-2 text-xs">

                    <Navigation size={15} />

                    {driver?.latitude != null &&
                        driver?.longitude != null ? (

                        <span className="text-green-600">
                            Location available
                        </span>

                    ) : (

                        <span className="text-gray-400">
                            Location unavailable
                        </span>

                    )}

                </div>

            </div>


            {/* Route */}

            <div className="mt-4 space-y-3">

                <LocationRow
                    icon={<Package size={17} />}
                    title="Store"
                    value={store?.name || "Unknown store"}
                    address={store?.address}
                />

                <LocationRow
                    icon={<MapPin size={17} />}
                    title="Customer"
                    value={address?.name || "Customer"}
                    address={`${address?.street || ""}, ${address?.city || ""}`}
                />

            </div>


            {/* Coordinates */}

            {driver?.latitude != null &&
                driver?.longitude != null && (

                    <div className="mt-4 rounded-xl border bg-gray-50 p-3">

                        <p className="text-xs text-gray-400">
                            DRIVER LOCATION
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700">
                            {Number(driver.latitude).toFixed(6)},
                            {" "}
                            {Number(driver.longitude).toFixed(6)}
                        </p>

                    </div>

                )}

        </div>
    )
}


function LocationRow({
    icon,
    title,
    value,
    address,
}) {

    return (
        <div className="flex gap-3">

            <div className="mt-0.5 rounded-lg bg-gray-100 p-2">
                {icon}
            </div>

            <div className="min-w-0">

                <p className="text-xs text-gray-400">
                    {title}
                </p>

                <p className="truncate text-sm font-medium text-gray-800">
                    {value}
                </p>

                {address && (
                    <p className="truncate text-xs text-gray-500">
                        {address}
                    </p>
                )}

            </div>

        </div>
    )
}