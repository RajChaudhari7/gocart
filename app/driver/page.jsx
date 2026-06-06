"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DriverDashboard() {
    const [orders, setOrders] = useState([]);

    const driverId =
        typeof window !== "undefined"
            ? localStorage.getItem("driverId")
            : null;

    useEffect(() => {
        if (!driverId) return;

        navigator.geolocation.watchPosition(
            async (position) => {
                await axios.post("/api/driver/location", {
                    driverId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            }
        );

        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const res = await axios.get(
            `/api/driver/orders?driverId=${driverId}`
        );

        setOrders(res.data);
    };

    const updateStatus = async (orderId, status) => {
        await axios.post("/api/driver/update-status", {
            orderId,
            status,
        });

        fetchOrders();
    };

    return (
        <div className="p-8">

            <h1 className="text-3xl font-bold mb-6">
                Driver Dashboard
            </h1>

            {orders.map((order) => (
                <div
                    key={order.id}
                    className="border rounded-lg p-5 mb-4"
                >
                    <h2>
                        Order : {order.id}
                    </h2>

                    <p>
                        Customer :
                        {order.user?.name}
                    </p>

                    <p>
                        Status :
                        {order.status}
                    </p>

                    {order.status === "PACKED" && (
                        <button
                            onClick={() =>
                                updateStatus(
                                    order.id,
                                    "REACHED_SHOP"
                                )
                            }
                        >
                            Reached Shop
                        </button>
                    )}

                    {order.status === "REACHED_SHOP" && (
                        <button
                            onClick={() =>
                                updateStatus(
                                    order.id,
                                    "PICKED_UP"
                                )
                            }
                        >
                            Picked Up
                        </button>
                    )}

                    {order.status === "PICKED_UP" && (
                        <button
                            onClick={() =>
                                updateStatus(
                                    order.id,
                                    "OUT_FOR_DELIVERY"
                                )
                            }
                        >
                            Out For Delivery
                        </button>
                    )}

                    {order.status ===
                        "OUT_FOR_DELIVERY" && (
                            <button
                                onClick={() =>
                                    updateStatus(
                                        order.id,
                                        "DELIVERY_INITIATED"
                                    )
                                }
                            >
                                Delivery Initiated
                            </button>
                        )}
                </div>
            ))}
        </div>
    );
}