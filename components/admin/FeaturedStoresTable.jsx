"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeaturedStoresTable() {

    const [stores, setStores] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchStores();

    }, []);

    const fetchStores = async () => {

        try {

            const { data } = await axios.get(
                "/api/admin/featured"
            );

            setStores(data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="space-y-4">

                {Array.from({ length: 6 }).map((_, i) => (

                    <div
                        key={i}
                        className="h-20 rounded-2xl bg-slate-200 animate-pulse"
                    />

                ))}

            </div>

        );

    }

    return (

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <table className="w-full">

                <thead>

                    <tr className="bg-slate-50">

                        <th className="text-left p-5">
                            Store
                        </th>

                        <th className="text-center">
                            Products
                        </th>

                        <th className="text-center">
                            Status
                        </th>

                        <th className="text-right pr-8">
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {stores.map((store) => (

                        <tr
                            key={store.id}
                            className="border-t hover:bg-slate-50 transition"
                        >

                            <td className="p-5">

                                <div className="flex items-center gap-4">

                                    <Image
                                        src={store.logo}
                                        alt={store.name}
                                        width={55}
                                        height={55}
                                        className="rounded-xl object-cover"
                                    />

                                    <div>

                                        <h2 className="font-semibold">

                                            {store.name}

                                        </h2>

                                        <p className="text-sm text-slate-500">

                                            @{store.username}

                                        </p>

                                    </div>

                                </div>

                            </td>

                            <td className="text-center font-semibold">

                                {store._count.Product}

                            </td>

                            <td className="text-center">

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold

                                    ${store.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >

                                    {store.isActive
                                        ? "Active"
                                        : "Inactive"}

                                </span>

                            </td>

                            <td className="text-right pr-8">

                                <Link
                                    href={`/admin/featured/${store.id}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 transition"
                                >

                                    Manage

                                    <ArrowRight size={16} />

                                </Link>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}