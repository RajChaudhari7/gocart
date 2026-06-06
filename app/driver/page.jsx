'use client'

import Link from "next/link"
import { Truck, Package, CheckCircle, User } from "lucide-react"

export default function DriverDashboard() {
    return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">
                Driver Dashboard
            </h1>

            <div className="grid md:grid-cols-4 gap-4">

                <Link
                    href="/driver/orders"
                    className="bg-white shadow rounded-xl p-5 border"
                >
                    <Package className="w-8 h-8 text-blue-600 mb-3" />
                    <h2 className="font-semibold">
                        Assigned Orders
                    </h2>
                </Link>

                <Link
                    href="/driver/history"
                    className="bg-white shadow rounded-xl p-5 border"
                >
                    <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                    <h2 className="font-semibold">
                        Delivery History
                    </h2>
                </Link>

                <Link
                    href="/driver/profile"
                    className="bg-white shadow rounded-xl p-5 border"
                >
                    <User className="w-8 h-8 text-purple-600 mb-3" />
                    <h2 className="font-semibold">
                        Profile
                    </h2>
                </Link>

                <div className="bg-white shadow rounded-xl p-5 border">
                    <Truck className="w-8 h-8 text-orange-600 mb-3" />
                    <h2 className="font-semibold">
                        Active Driver
                    </h2>
                </div>

            </div>

        </div>
    )
}