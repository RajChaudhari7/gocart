"use client";

import { useState } from "react";
import axios from "axios";

export default function DriverLogin() {

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {

        const { data } = await axios.post(
            "/api/driver/login",
            {
                phone,
                password,
            }
        );

        localStorage.setItem(
            "driverId",
            data.driver.id
        );

        window.location.href = "/driver";
    };

    return (
        <div className="min-h-screen flex items-center justify-center">

            <div className="w-96 border p-6 rounded">

                <h1 className="text-2xl mb-4">
                    Driver Login
                </h1>

                <input
                    className="border p-3 w-full mb-3"
                    placeholder="Phone"
                    onChange={(e) => setPhone(e.target.value)}
                />

                <input
                    type="password"
                    className="border p-3 w-full mb-3"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={login}
                    className="bg-black text-white p-3 w-full"
                >
                    Login
                </button>

            </div>
        </div>
    );
}