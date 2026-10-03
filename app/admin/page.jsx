'use client'

import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import {
    IndianRupee,
    ShoppingCart,
    Truck,
    Users,
    Store,
    Wallet,
    Clock3,
    PackageCheck,
    ArrowRight,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminDashboard() {

    const currency =
        process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹"

    const { getToken } = useAuth()

    const [loading, setLoading] = useState(true)

    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())

    const [dashboardData, setDashboardData] = useState({
        ordersToday: 0,
        gmvToday: 0,
        platformRevenueToday: 0,

        activeDeliveries: 0,
        activeDrivers: 0,
        onlineDrivers: 0,

        sellerPayable: 0,
        driverPayable: 0,

        pendingSellerPayouts: 0,
        pendingDriverPayouts: 0,

        products: 0,
        stores: 0,

        allOrders: [],
    })

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            const token = await getToken()

            const { data } = await axios.get(
                "/api/admin/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        month,
                        year,
                    },
                }
            )

            setDashboardData(data.dashboardData)

        } catch (error) {

            toast.error(
                error?.response?.data?.error ||
                error.message ||
                "Failed to load dashboard"
            )

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [month, year])

    if (loading) {
        return <Loading />
    }

    const formatCurrency = (value) => {
        return `${currency}${Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        })}`
    }

    const overviewCards = [
        {
            title: "Orders Today",
            value: dashboardData.ordersToday,
            icon: ShoppingCart,
            description: "Orders created today",
            href: "/admin/orders",
        },
        {
            title: "GMV Today",
            value: formatCurrency(dashboardData.gmvToday),
            icon: IndianRupee,
            description: "Merchandise value",
            href: "/admin/orders",
        },
        {
            title: "Platform Revenue",
            value: formatCurrency(
                dashboardData.platformRevenueToday
            ),
            icon: Wallet,
            description: "Today's platform revenue",
            href: "/admin/reconciliation",
        },
        {
            title: "Active Deliveries",
            value: dashboardData.activeDeliveries,
            icon: Truck,
            description: "Currently in delivery",
            href: "/admin/live-deliveries",
        },
    ]

    const driverCards = [
        {
            title: "Active Drivers",
            value: dashboardData.activeDrivers,
            icon: Users,
            description: "Drivers with active deliveries",
            href: "/admin/drivers",
        },
        {
            title: "Online Drivers",
            value: dashboardData.onlineDrivers,
            icon: Users,
            description: "Currently online",
            href: "/admin/drivers",
        },
    ]

    const financeCards = [
        {
            title: "Seller Payable",
            value: formatCurrency(
                dashboardData.sellerPayable
            ),
            icon: Wallet,
            description: "Available seller earnings",
            href: "/admin/seller-earnings",
        },
        {
            title: "Driver Payable",
            value: formatCurrency(
                dashboardData.driverPayable
            ),
            icon: Wallet,
            description: "Available driver earnings",
            href: "/admin/driver-earnings",
        },
        {
            title: "Pending Seller Payouts",
            value: dashboardData.pendingSellerPayouts,
            icon: Clock3,
            description: "Payouts awaiting processing",
            href: "/admin/seller-payouts",
        },
        {
            title: "Pending Driver Payouts",
            value: dashboardData.pendingDriverPayouts,
            icon: Clock3,
            description: "Payouts awaiting processing",
            href: "/admin/driver-payouts",
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

            {/* Header */}

            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <p className="text-sm font-medium text-gray-500">
                        ADMIN COMMAND CENTER
                    </p>

                    <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900">
                        Overview
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Monitor marketplace operations, deliveries and finance.
                    </p>
                </div>

                {/* Date filters */}

                <div className="flex gap-2">

                    <select
                        value={month}
                        onChange={(e) =>
                            setMonth(Number(e.target.value))
                        }
                        className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                    >
                        {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                        ].map((name, index) => (
                            <option
                                key={index}
                                value={index + 1}
                            >
                                {name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(e) =>
                            setYear(Number(e.target.value))
                        }
                        className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                    >
                        {[2024, 2025, 2026, 2027].map(
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

                </div>

            </div>


            {/* TODAY */}

            <section className="mb-8">

                <div className="mb-4 flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Today
                        </h2>

                        <p className="text-sm text-gray-500">
                            Marketplace activity
                        </p>
                    </div>

                </div>


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {overviewCards.map((card) => {

                        const Icon = card.icon

                        return (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="flex items-start justify-between">

                                    <div className="rounded-xl bg-gray-100 p-3">
                                        <Icon
                                            size={21}
                                            className="text-gray-700"
                                        />
                                    </div>

                                    <ArrowRight
                                        size={18}
                                        className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600"
                                    />

                                </div>

                                <p className="mt-5 text-sm text-gray-500">
                                    {card.title}
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {card.value}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {card.description}
                                </p>

                            </Link>
                        )
                    })}

                </div>

            </section>


            {/* DELIVERY OPERATIONS */}

            <section className="mb-8">

                <div className="mb-4">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Delivery Operations
                    </h2>

                    <p className="text-sm text-gray-500">
                        Current driver and delivery activity
                    </p>

                </div>


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {driverCards.map((card) => {

                        const Icon = card.icon

                        return (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-4">

                                        <div className="rounded-xl bg-gray-100 p-3">
                                            <Icon
                                                size={22}
                                                className="text-gray-700"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {card.title}
                                            </p>

                                            <p className="text-2xl font-bold text-gray-900">
                                                {card.value}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {card.description}
                                            </p>
                                        </div>

                                    </div>

                                    <ArrowRight
                                        size={18}
                                        className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600"
                                    />

                                </div>

                            </Link>
                        )
                    })}

                </div>

            </section>


            {/* FINANCE */}

            <section className="mb-8">

                <div className="mb-4">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Finance
                    </h2>

                    <p className="text-sm text-gray-500">
                        Seller and driver settlement overview
                    </p>

                </div>


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {financeCards.map((card) => {

                        const Icon = card.icon

                        return (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="flex items-start justify-between">

                                    <div className="rounded-xl bg-gray-100 p-3">
                                        <Icon
                                            size={21}
                                            className="text-gray-700"
                                        />
                                    </div>

                                    <ArrowRight
                                        size={18}
                                        className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600"
                                    />

                                </div>

                                <p className="mt-5 text-sm text-gray-500">
                                    {card.title}
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {card.value}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {card.description}
                                </p>

                            </Link>
                        )
                    })}

                </div>

            </section>


            {/* PLATFORM */}

            <section className="mb-8">

                <div className="mb-4">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Marketplace
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <Link
                        href="/admin/stores"
                        className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                        <div className="flex items-center gap-4">

                            <div className="rounded-xl bg-gray-100 p-3">
                                <Store size={22} />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Approved Stores
                                </p>

                                <p className="text-2xl font-bold">
                                    {dashboardData.stores}
                                </p>
                            </div>

                        </div>

                    </Link>


                    <div className="rounded-2xl border bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-4">

                            <div className="rounded-xl bg-gray-100 p-3">
                                <PackageCheck size={22} />
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Products
                                </p>

                                <p className="text-2xl font-bold">
                                    {dashboardData.products}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* EXISTING CHART */}

            <section className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">

                <div className="mb-5">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Orders Overview
                    </h2>

                    <p className="text-sm text-gray-500">
                        Delivered orders for the selected period
                    </p>

                </div>

                <OrdersAreaChart
                    allOrders={dashboardData.allOrders}
                />

            </section>

        </div>
    )
}